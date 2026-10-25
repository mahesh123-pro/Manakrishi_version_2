import { randomUUID } from "node:crypto";
import { hashPassword } from "../lib/marketplace/auth.ts";
import { one, run, closeDb } from "../lib/marketplace/db.ts";
const email = (process.env.MARKETPLACE_ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.MARKETPLACE_ADMIN_PASSWORD || "";
if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  password.length < 16 ||
  password.length > 128
) {
  console.error(
    "Set MARKETPLACE_ADMIN_EMAIL and a unique MARKETPLACE_ADMIN_PASSWORD of 16–128 characters. Use the same MARKETPLACE_DATA_DIR as the app.",
  );
  process.exit(1);
}
if (await one("SELECT id FROM users WHERE email=?", email)) {
  console.error(
    "Account already exists. No roles or passwords were changed. Use a new administrator email or your database recovery procedure.",
  );
  process.exit(1);
}
await run(
  "INSERT INTO users(id,email,password,name,role,createdAt) VALUES(?,?,?,?,?,?)",
  randomUUID(),
  email,
  await hashPassword(password),
  "Marketplace administrator",
  "admin",
  new Date().toISOString(),
);
await closeDb();
console.log(
  "Administrator created. Sign in at /marketplace/account, then open /admin/marketplace.",
);
