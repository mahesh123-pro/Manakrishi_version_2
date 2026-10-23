import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

const dir = mkdtempSync(join(tmpdir(), "mk-market-http-"));
process.env.MARKETPLACE_DATA_DIR = dir;
const { run, closeDb } = await import("../lib/marketplace/db.ts");
const { hashPassword } = await import("../lib/marketplace/auth.ts");
const adminEmail = `admin-${randomUUID()}@example.test`,
  password = "test-http-long-password";
run(
  "INSERT INTO users(id,email,password,name,role,createdAt) VALUES(?,?,?,?,?,?)",
  randomUUID(),
  adminEmail,
  await hashPassword(password),
  "Fixture admin",
  "admin",
  new Date().toISOString(),
);
closeDb();
const port = Number(process.env.MARKETPLACE_TEST_PORT || 3107),
  base = `http://localhost:${port}`;
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", String(port)],
  {
    env: {
      ...process.env,
      MARKETPLACE_DATA_DIR: dir,
      MARKETPLACE_ORIGIN: base,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
server.stdout.on("data", (d) => (logs += d));
server.stderr.on("data", (d) => (logs += d));
async function api(path, body, cookie = "", expected = 200, origin = base) {
  const res = await fetch(`${base}/api/marketplace/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(body instanceof FormData
        ? {}
        : body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
      ...(body === undefined ? {} : { origin }),
      ...(cookie ? { cookie } : {}),
    },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  const data = await res.json();
  assert.equal(res.status, expected, `${path}: ${JSON.stringify(data)}`);
  return {
    data,
    cookie: res.headers.get("set-cookie")?.split(";")[0] || cookie,
  };
}
try {
  for (let n = 0; n < 60; n++) {
    try {
      await fetch(`${base}/api/marketplace/session`);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
      if (n === 59) throw Error(logs);
    }
  }
  const admin = (await api("auth/login", { email: adminEmail, password }))
    .cookie;
  const farmer = (
    await api("auth/register", {
      name: "HTTP fixture farmer",
      email: `farmer-${randomUUID()}@example.test`,
      password,
      role: "farmer",
    })
  ).cookie;
  const buyer = (
    await api("auth/register", {
      name: "HTTP fixture buyer",
      email: `buyer-${randomUUID()}@example.test`,
      password,
      role: "buyer",
    })
  ).cookie;
  const stranger = (
    await api("auth/register", {
      name: "HTTP fixture stranger",
      email: `stranger-${randomUUID()}@example.test`,
      password,
      role: "buyer",
    })
  ).cookie;
  await api("admin", undefined, buyer, 403);
  await api("orders", undefined, "", 401);
  await api(
    "cart",
    { listingId: "x", quantity: 1 },
    buyer,
    403,
    "https://invalid.example",
  );
  const upload = new FormData();
  upload.set(
    "file",
    new Blob(
      [
        await sharp({
          create: { width: 40, height: 40, channels: 3, background: "#16803d" },
        })
          .jpeg()
          .toBuffer(),
      ],
      { type: "image/jpeg" },
    ),
    "fixture.jpg",
  );
  const url = (await api("upload", upload, farmer)).data.url;
  assert.equal((await fetch(base + url)).status, 404);
  assert.equal(
    (await fetch(base + url, { headers: { cookie: farmer } })).status,
    200,
  );
  const invalid = new FormData();
  invalid.set(
    "file",
    new Blob(["not an image"], { type: "image/jpeg" }),
    "bad.jpg",
  );
  await api("upload", invalid, farmer, 400);
  const input = {
    crop: "HTTP test crop",
    category: "rice",
    variety: "Test only",
    description: "Isolated test fixture",
    images: [url],
    price: 21.75,
    unit: "kg",
    quantity: 15,
    minimum: 2,
    maximum: 8,
    grade: "Test",
    organic: false,
    organicEvidence: "",
    negotiable: true,
    village: "Fixture village",
    district: "Fixture district",
    state: "Telangana",
    pin: "500001",
    harvest: "2026-10-01",
    availableFrom: "",
    fulfillment: "both",
    pickup: "Private fixture location",
    contact: "9876543210",
    notes: "Test only",
    latitude: 17,
    longitude: 78,
    action: "publish",
  };
  const { id } = (await api("listings", input, farmer)).data;
  await api(`product/${id}`, undefined, buyer, 404);
  await api(
    "admin",
    { id, action: "approve", reason: "Fixture review" },
    buyer,
    403,
  );
  await api(
    "admin",
    { id, action: "approve", reason: "Fixture review" },
    admin,
  );
  const publicProduct = (await api(`product/${id}`)).data.listing;
  assert.equal(publicProduct.contact, "");
  assert.equal(publicProduct.latitude, null);
  assert.equal((await fetch(base + url)).status, 200);
  await api("wishlist", { listingId: id }, buyer);
  assert.equal((await api("wishlist", undefined, buyer)).data.items.length, 1);
  await api(
    "enquiries",
    { listingId: id, message: "Fixture availability question" },
    buyer,
  );
  const enquiry = (await api("enquiries", undefined, farmer)).data.items[0];
  await api(
    "enquiry-reply",
    { id: enquiry.id, reply: "Fixture response" },
    farmer,
  );
  await api("cart", { listingId: id, quantity: 3 }, buyer);
  const cart = (await api("cart", undefined, buyer)).data.items;
  const requestKey = randomUUID();
  const orderInput = {
    requestKey,
    name: "Buyer fixture",
    phone: "9876543210",
    fulfillment: "pickup",
    expected: cart.map((i) => ({
      id: i.listingId,
      version: i.listing.version,
      price: i.listing.price,
    })),
  };
  const ids = (await api("orders", orderInput, buyer)).data.ids;
  assert.deepEqual((await api("orders", orderInput, buyer)).data.ids, ids);
  assert.equal((await api("orders", undefined, stranger)).data.items.length, 0);
  await api("order-action", { id: ids[0], status: "confirmed" }, stranger, 403);
  await api("order-action", { id: ids[0], status: "confirmed" }, farmer);
  for (const status of ["preparing", "ready", "delivered"])
    await api("order-action", { id: ids[0], status }, farmer);
  const order = (await api("orders", undefined, buyer)).data.items[0];
  assert.equal(order.status, "delivered");
  assert.equal(order.total, 6525);
  assert.equal(order.sellerContact, input.contact);
  assert.equal(
    (await api("notifications", undefined, buyer)).data.items.length > 0,
    true,
  );
  await api("report", { listingId: id, reason: "Fixture report" }, buyer);
  const report = (await api("admin", undefined, admin)).data.reports[0];
  await api(
    "admin",
    { id: report.id, action: "resolve", reason: "Fixture resolved" },
    admin,
  );
  await api(
    "admin-settings",
    {
      disabledCategories: ["wheat"],
      disabledUnits: ["tonne"],
      rules: "Fixture rule",
    },
    admin,
  );
  assert.equal((await api("rules")).data.rules, "Fixture rule");
  for (const path of [
    "/",
    "/book",
    "/marketplace",
    "/marketplace/account",
    "/marketplace/sell",
    "/marketplace/cart",
    "/marketplace/checkout",
    "/marketplace/orders",
    "/marketplace/my-listings",
    "/marketplace/wishlist",
    "/admin/marketplace",
    `/marketplace/product/${id}`,
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    if (path === "/marketplace")
      assert.ok(html.includes("Fresh from Our Farms"));
  }
  console.log(
    "Marketplace HTTP workflow passed: auth, image upload/privacy, moderation, wishlist, enquiries, cart, idempotent checkout, order fulfillment, admin rules/reports and route responses.",
  );
} finally {
  server.kill();
  await new Promise((r) => server.once("exit", r));
  await new Promise((r) => setTimeout(r, 500));
  rmSync(dir, { recursive: true, force: true });
}
