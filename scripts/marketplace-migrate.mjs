import { postgresPool, closeDb } from "../lib/marketplace/db.ts";
import { POSTGRES_SCHEMA } from "../lib/marketplace/schema-postgres.ts";

if (process.env.MARKETPLACE_MIGRATION_DATABASE_URL)
  process.env.DATABASE_URL = process.env.MARKETPLACE_MIGRATION_DATABASE_URL;
const client = await postgresPool().connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(74719301)");
  await client.query(POSTGRES_SCHEMA);
  await client.query("COMMIT");
  console.log("Marketplace Postgres schema is ready (migration 1).");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await closeDb();
}
