import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  createHash,
  randomUUID,
} from "node:crypto";
import { promisify } from "node:util";
import { one, run, transaction } from "./db.ts";
import type { User } from "./types.ts";
const derive = promisify(scrypt);
export class MarketError extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}
export function requireValue(
  condition: unknown,
  code: string,
  status = 400,
): asserts condition {
  if (!condition) throw new MarketError(code, status);
}
export async function limit(key: string, max = 40, seconds = 60) {
  await transaction(async () => {
    await run("DELETE FROM rate_limits WHERE expires < ?", Date.now());
    const row = await one<{
      count: number;
    }>("SELECT count FROM rate_limits WHERE key=?", key);
    requireValue(!row || row.count < max, "rate_limit", 429);
    await run(
      "INSERT INTO rate_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
      key,
      Date.now() + seconds * 1000,
    );
  });
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${((await derive(password, salt, 64)) as Buffer).toString("hex")}`;
}
export async function passwordMatches(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  const result = (await derive(password, salt, 64)) as Buffer;
  return timingSafeEqual(result, Buffer.from(key, "hex"));
}
export const tokenHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function sessionUser(token?: string): Promise<User | null> {
  if (!token) return null;
  return (
    (await one<User>(
      "SELECT u.id,CASE WHEN u.email LIKE '%@phone.manakrishi.invalid' THEN '' ELSE u.email END AS email,p.phone,u.name,CASE WHEN f.userId IS NOT NULL THEN 'fpo' ELSE u.role END AS role,u.verified,u.suspended,u.village,u.district,u.state,u.bio,u.photo,u.publicContact FROM users u JOIN sessions s ON s.userId=u.id LEFT JOIN fpo_access f ON f.userId=u.id LEFT JOIN phone_identities p ON p.userId=u.id WHERE s.hash=? AND s.expires>? AND u.suspended=0",
      tokenHash(token),
      Date.now(),
    )) || null
  );
}
export async function newSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await run("DELETE FROM sessions WHERE expires<?", Date.now());
  await run(
    "INSERT INTO sessions VALUES(?,?,?)",
    tokenHash(token),
    userId,
    Date.now() + 7 * 86400000,
  );
  return token;
}
export async function register(input: Record<string, unknown>) {
  const email = String(input.email || "")
    .trim()
    .toLowerCase();
  const name = String(input.name || "").trim();
  const password = String(input.password || "");
  requireValue(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      email.length <= 254 &&
      name.length >= 2 &&
      name.length <= 100 &&
      password.length >= 12 &&
      password.length <= 128,
    "invalid_account",
  );
  requireValue(
    input.role === "buyer" || input.role === "farmer",
    "invalid_role",
  );
  const hash = await hashPassword(password);
  const id = randomUUID();
  try {
    await run(
      "INSERT INTO users(id,email,password,name,role,createdAt) VALUES(?,?,?,?,?,?)",
      id,
      email,
      hash,
      name,
      input.role,
      new Date().toISOString(),
    );
  } catch {
    throw new MarketError("account_exists", 409);
  }
  return await newSession(id);
}
export async function login(input: Record<string, unknown>) {
  const email = String(input.email || "")
    .trim()
    .toLowerCase();
  const password = String(input.password || "");
  requireValue(password.length <= 128, "invalid_login", 401);
  const user = await one<{
    id: string;
    password: string;
    suspended: number;
  }>("SELECT id,password,suspended FROM users WHERE email=?", email);
  const fallback = "00000000000000000000000000000000:" + "0".repeat(128);
  const valid = await passwordMatches(password, user?.password || fallback);
  requireValue(user && valid && !user.suspended, "invalid_login", 401);
  return await newSession(user.id);
}
