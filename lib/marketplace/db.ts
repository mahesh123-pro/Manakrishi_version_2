import { AsyncLocalStorage } from "node:async_hooks";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import pg, { type PoolClient } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import { SQLITE_SCHEMA } from "./schema-sqlite.ts";

const context = new AsyncLocalStorage<{
  client?: PoolClient;
  sqlite?: boolean;
}>();
let sqlite: DatabaseSync | undefined;
let pool: pg.Pool | undefined;
let queue = Promise.resolve();
const camelColumns = Object.fromEntries(
  [
    "userId",
    "firebaseUid",
    "sellerId",
    "buyerId",
    "ownerId",
    "listingId",
    "orderId",
    "actorId",
    "targetId",
    "requestKey",
    "createdAt",
    "updatedAt",
    "expiresAt",
    "publicContact",
    "buyerName",
  ].map((key) => [key.toLowerCase(), key]),
);
export function postgresPool() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is required for the marketplace on Vercel.");
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 15000,
    });
    if (process.env.VERCEL) attachDatabasePool(pool);
  }
  return pool;
}
async function localDb() {
  if (process.env.VERCEL)
    throw new Error(
      "Configure DATABASE_URL; SQLite is not supported on Vercel.",
    );
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.MARKETPLACE_DATA_DIR
  )
    throw new Error(
      "Configure DATABASE_URL or a persistent MARKETPLACE_DATA_DIR.",
    );
  if (!sqlite) {
    const { DatabaseSync } = await import("node:sqlite");
    const file = resolve(
      process.env.MARKETPLACE_DATA_DIR || ".marketplace",
      "marketplace.sqlite",
    );
    mkdirSync(dirname(file), { recursive: true });
    sqlite = new DatabaseSync(file, { timeout: 5000 });
    sqlite.exec(SQLITE_SCHEMA);
  }
  return sqlite;
}
// SQL originates exclusively from this repository. Values stay parameterized.
function postgresSql(sql: string) {
  let index = 0;
  const ignore = sql.startsWith("INSERT OR IGNORE");
  return (
    sql
      .replace("INSERT OR IGNORE", "INSERT")
      .replace("count=count+1", "count=rate_limits.count+1")
      .replace(
        /json_each\(l\.data,'\$\.images'\)/g,
        "jsonb_array_elements_text(l.data::jsonb->'images') AS image_values(value)",
      )
      .replace(/'(?:''|[^'])*'|\?/g, (token) =>
        token === "?" ? `$${++index}` : token,
      ) + (ignore ? " ON CONFLICT DO NOTHING" : "")
  );
}
function row<T>(record: Record<string, unknown>): T {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      camelColumns[key] || key,
      value,
    ]),
  ) as T;
}
async function query(sql: string, args: SQLInputValue[]) {
  const client = context.getStore()?.client || postgresPool();
  return client.query({
    text: postgresSql(sql),
    values: args.map((value) =>
      value instanceof Uint8Array ? Buffer.from(value) : value,
    ),
    types: {
      getTypeParser: (oid: number, format?: string) =>
        oid === 20 || oid === 1700
          ? Number
          : pg.types.getTypeParser(oid, format as "text"),
    },
  });
}
export async function all<T = Record<string, unknown>>(
  sql: string,
  ...args: SQLInputValue[]
): Promise<T[]> {
  if (process.env.DATABASE_URL)
    return (await query(sql, args)).rows.map((record) => row<T>(record));
  return (await localDb()).prepare(sql).all(...args) as unknown as T[];
}
export async function one<T = Record<string, unknown>>(
  sql: string,
  ...args: SQLInputValue[]
): Promise<T | undefined> {
  return (await all<T>(sql, ...args))[0];
}
export async function run(sql: string, ...args: SQLInputValue[]) {
  if (process.env.DATABASE_URL)
    return { changes: (await query(sql, args)).rowCount || 0 };
  return (await localDb()).prepare(sql).run(...args);
}
export async function transaction<T>(fn: () => T | Promise<T>): Promise<T> {
  if (context.getStore()) return fn();
  if (process.env.DATABASE_URL) {
    const client = await postgresPool().connect();
    try {
      await client.query("BEGIN");
      // Serialize marketplace transactions across Vercel instances, matching
      // SQLite's writer lock for idempotency and atomic stock reservations.
      await client.query("SELECT pg_advisory_xact_lock(74719301)");
      const result = await context.run({ client }, fn);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  const previous = queue;
  let release!: () => void;
  queue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    const connection = await localDb();
    connection.exec("BEGIN IMMEDIATE");
    try {
      const result = await context.run({ sqlite: true }, fn);
      connection.exec("COMMIT");
      return result;
    } catch (error) {
      connection.exec("ROLLBACK");
      throw error;
    }
  } finally {
    release();
  }
}
export async function closeDb() {
  sqlite?.close();
  sqlite = undefined;
  await pool?.end();
  pool = undefined;
}
