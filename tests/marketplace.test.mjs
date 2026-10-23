import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const folder = mkdtempSync(join(tmpdir(), "manakrishi-market-test-"));
process.env.MARKETPLACE_DATA_DIR = folder;
const { one, run, closeDb } = await import("../lib/marketplace/db.ts");
const { register, sessionUser, login, limit } = await import(
  "../lib/marketplace/auth.ts"
);
const m = await import("../lib/marketplace/service.ts");
after(() => {
  closeDb();
  rmSync(folder, { recursive: true, force: true });
});
const makeUser = async (role = "buyer") =>
  sessionUser(
    await register({
      name: "Test account",
      email: `${randomUUID()}@example.test`,
      password: "long-test-password-only",
      role,
    }),
  );
const farmer = await makeUser("farmer"),
  buyer = await makeUser(),
  buyer2 = await makeUser(),
  admin = { ...(await makeUser()), role: "admin" };
run("UPDATE users SET role='admin' WHERE id=?", admin.id);
const image = randomUUID();
run(
  "INSERT INTO images VALUES(?,?,?,?)",
  image,
  farmer.id,
  new Uint8Array([1, 2, 3]),
  new Date().toISOString(),
);
const input = {
  crop: "Test paddy",
  category: "rice",
  variety: "Test variety",
  description: "Test fixture crop, never production inventory",
  images: [`/api/marketplace/media/${image}`],
  price: 25.5,
  unit: "kg",
  quantity: 100,
  minimum: 1,
  maximum: 0,
  grade: "A",
  organic: false,
  organicEvidence: "",
  negotiable: false,
  village: "Test village",
  district: "Test district",
  state: "Telangana",
  pin: "500001",
  harvest: "2026-10-01",
  availableFrom: "",
  fulfillment: "both",
  pickup: "Private field gate",
  contact: "9876543210",
  notes: "",
  latitude: 17.1,
  longitude: 78.1,
};
function listing(patch = {}) {
  const { id } = m.saveListing(farmer, {
    ...input,
    ...patch,
    action: "publish",
  });
  m.moderate(admin, { id, action: "approve", reason: "Test fixture review" });
  return m.getListing(id);
}
function checkout(user, l, quantity = 1, key = randomUUID(), extra = {}) {
  m.setCart(user, l.id, quantity);
  return m.createOrders(user, {
    requestKey: key,
    name: "Test buyer",
    phone: "9876543210",
    fulfillment: "pickup",
    expected: [{ id: l.id, price: l.price, version: l.version }],
    ...extra,
  });
}
test("authentication, password verification, role escalation and persistent throttles", async () => {
  await assert.rejects(
    () =>
      register({
        name: "Bad admin",
        email: "bad@example.test",
        password: "long-test-password-only",
        role: "admin",
      }),
    /invalid_role/,
  );
  const token = await login({
    email: farmer.email,
    password: "long-test-password-only",
  });
  assert.equal(sessionUser(token).id, farmer.id);
  await assert.rejects(
    () => login({ email: farmer.email, password: "wrong" }),
    /invalid_login/,
  );
  assert.equal(sessionUser("fake-token"), null);
  limit("test", 1, 100);
  assert.throws(() => limit("test", 1, 100), /rate_limit/);
  assert.throws(
    () => m.moderate(buyer, { id: "x", action: "approve" }),
    /forbidden/,
  );
});
test("mandatory publication checks, image ownership, moderation, public privacy and filters", () => {
  assert.throws(
    () => m.saveListing(farmer, { ...input, crop: "", action: "publish" }),
    /invalid_fields/,
  );
  assert.throws(
    () => m.saveListing(farmer, { ...input, images: [], action: "publish" }),
    /images_required/,
  );
  assert.throws(
    () => m.saveListing(buyer, { ...input, action: "publish" }),
    /farmer_required/,
  );
  const draft = m.saveListing(farmer, {
    ...input,
    crop: "Draft",
    action: "draft",
  });
  assert.throws(() => m.getListing(draft.id), /not_found/);
  const l = listing();
  assert.equal(l.contact, "");
  assert.equal(l.pickup, "");
  assert.equal(l.latitude, null);
  assert.equal(m.getListing(l.id, farmer).contact, input.contact);
  assert.ok(
    m
      .discover(
        new URLSearchParams({
          q: "test variety",
          location: "test district",
          category: "rice",
        }),
      )
      .items.some((x) => x.id === l.id),
  );
  assert.throws(
    () =>
      m.saveListing(farmer, {
        ...input,
        images: [`/api/marketplace/media/${randomUUID()}`],
        action: "publish",
      }),
    /invalid_image/,
  );
});
test("stock reservations, duplicate retries, immutable prices, cancellation release and access", () => {
  const l = listing({ quantity: 5 });
  const key = randomUUID();
  const [id] = checkout(buyer, l, 2, key);
  assert.equal(m.getListing(l.id).quantity, 3);
  assert.deepEqual(
    m.createOrders(buyer, {
      requestKey: key,
      name: "Test",
      phone: "9876543210",
      fulfillment: "pickup",
    }),
    [id],
  );
  assert.equal(m.getListing(l.id).quantity, 3);
  assert.equal(
    m.orders(buyer2).some((o) => o.id === id),
    false,
  );
  assert.throws(() => m.updateOrder(buyer2, id, "confirmed", ""), /forbidden/);
  assert.throws(
    () => m.updateOrder(farmer, id, "delivered", ""),
    /invalid_transition/,
  );
  assert.equal(
    m.orders(buyer).find((o) => o.id === id).sellerContact,
    undefined,
  );
  m.updateOrder(farmer, id, "confirmed", "");
  assert.equal(
    m.orders(buyer).find((o) => o.id === id).sellerContact,
    input.contact,
  );
  const current = m.getListing(l.id, farmer);
  m.saveListing(farmer, {
    ...current,
    price: 80,
    version: current.version,
    action: "publish",
  });
  assert.equal(m.orders(buyer).find((o) => o.id === id).items[0].price, 2550);
  assert.throws(() => m.changeListing(farmer, l.id, "delete"), /active_orders/);
  m.updateOrder(admin, id, "cancelled", "Test cancellation");
  assert.equal(m.getListing(l.id, farmer).quantity, 5);
  assert.throws(
    () => m.updateOrder(admin, id, "cancelled", "again"),
    /invalid_transition/,
  );
});
test("stock / price drift, incompatible delivery, expiry and maximum quantities", () => {
  const l = listing({
    quantity: 10,
    minimum: 2,
    maximum: 4,
    fulfillment: "pickup",
  });
  assert.throws(() => m.setCart(buyer, l.id, 1), /stock_unavailable/);
  assert.throws(() => m.setCart(buyer, l.id, 5), /stock_unavailable/);
  assert.throws(
    () =>
      checkout(buyer, l, 2, randomUUID(), {
        fulfillment: "delivery",
        address: "Test address",
        pin: "500001",
      }),
    /fulfillment_mismatch/,
  );
  assert.throws(
    () =>
      checkout(buyer, l, 2, randomUUID(), {
        expected: [{ id: l.id, price: 1, version: l.version }],
      }),
    /stock_unavailable/,
  );
  const [id] = checkout(buyer, l, 2);
  run("UPDATE orders SET expiresAt='2000-01-01' WHERE id=?", id);
  m.expireOrders();
  assert.equal(m.getListing(l.id).quantity, 10);
  assert.equal(m.orders(buyer).find((o) => o.id === id).status, "cancelled");
});
test("two independent processes cannot oversell the final stock", async () => {
  const l = listing({ quantity: 3, minimum: 1 });
  m.setCart(buyer, l.id, 2);
  m.setCart(buyer2, l.id, 2);
  const call = promisify(execFile);
  const code = (user) =>
    `import {createOrders} from './lib/marketplace/service.ts';try{const ids=createOrders(${JSON.stringify(user)},{requestKey:'${randomUUID()}',name:'Test',phone:'9876543210',fulfillment:'pickup',expected:[{id:'${l.id}',price:${l.price},version:${l.version}}]});console.log(JSON.stringify(ids));}catch(e){console.log('REJECTED:'+e.message);}`;
  const results = await Promise.all(
    [buyer, buyer2].map((u) =>
      call(
        process.execPath,
        [
          "--experimental-transform-types",
          "--input-type=module",
          "-e",
          code(u),
        ],
        {
          cwd: process.cwd(),
          env: { ...process.env, MARKETPLACE_DATA_DIR: folder },
        },
      ),
    ),
  );
  assert.equal(results.filter((r) => r.stdout.includes("REJECTED:")).length, 1);
  assert.equal(m.getListing(l.id).quantity, 1);
});

test("partial drafts stay private and cannot bypass publication validation", () => {
  const draft = m.saveListing(farmer, {
    ...input,
    crop: "",
    description: "",
    images: [],
    price: 0,
    quantity: 0,
    action: "draft",
  });
  assert.equal(m.getListing(draft.id, farmer).status, "draft");
  assert.throws(() => m.getListing(draft.id), /not_found/);
  assert.throws(
    () =>
      m.moderate(admin, { id: draft.id, action: "approve", reason: "Test" }),
    /invalid_quantity/,
  );
});

test("multi-seller checkout is atomic and snapshots each seller separately", async () => {
  run("DELETE FROM cart");
  const other = await makeUser("farmer");
  const otherImage = randomUUID();
  run(
    "INSERT INTO images VALUES(?,?,?,?)",
    otherImage,
    other.id,
    new Uint8Array([1]),
    new Date().toISOString(),
  );
  const first = listing({ quantity: 20, price: 10.25 });
  const created = m.saveListing(other, {
    ...input,
    price: 3.5,
    quantity: 20,
    fulfillment: "delivery",
    images: [`/api/marketplace/media/${otherImage}`],
    action: "publish",
  });
  m.moderate(admin, {
    id: created.id,
    action: "approve",
    reason: "Test review",
  });
  let second = m.getListing(created.id);
  m.setCart(buyer, first.id, 2);
  m.setCart(buyer, second.id, 4);
  const request = () => ({
    requestKey: randomUUID(),
    name: "Test buyer",
    phone: "9876543210",
    fulfillment: "pickup",
    expected: [first, second].map((l) => ({
      id: l.id,
      price: l.price,
      version: l.version,
    })),
  });
  assert.throws(() => m.createOrders(buyer, request()), /fulfillment_mismatch/);
  assert.equal(m.getListing(first.id).quantity, 20);
  const own = m.getListing(second.id, other);
  m.saveListing(other, { ...own, fulfillment: "both", action: "publish" });
  m.moderate(admin, {
    id: second.id,
    action: "approve",
    reason: "Test review",
  });
  second = m.getListing(second.id);
  const ids = m.createOrders(buyer, request());
  assert.equal(ids.length, 2);
  const result = m.orders(buyer).filter((o) => ids.includes(o.id));
  assert.equal(
    result.reduce((n, o) => n + o.total, 0),
    3450,
  );
  assert.equal(m.getListing(first.id).quantity, 18);
  assert.equal(m.getListing(second.id).quantity, 16);
});
