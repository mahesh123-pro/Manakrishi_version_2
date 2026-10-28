import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID, randomInt } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
if (process.env.DATABASE_URL && process.env.MARKETPLACE_TEST_DATABASE !== "1")
  throw new Error(
    "Use an isolated database branch and set MARKETPLACE_TEST_DATABASE=1; never run fixtures on production.",
  );
const folder = mkdtempSync(join(tmpdir(), "manakrishi-market-test-"));
process.env.MARKETPLACE_DATA_DIR = folder;
const { one, run, closeDb } = await import("../lib/marketplace/db.ts");
const { register, sessionUser, login, limit, newSession } =
  await import("../lib/marketplace/auth.ts");
const m = await import("../lib/marketplace/service.ts");
const { connectPhone } = await import("../lib/marketplace/phone-auth.ts");
after(async () => {
  await closeDb();
  rmSync(folder, { recursive: true, force: true });
});
test("Firebase Admin auth loads in serverless CommonJS without require(esm)", async () => {
  await promisify(execFile)(process.execPath, [
    "--no-experimental-require-module",
    "-e",
    "const {getAuth}=require('firebase-admin/auth'); if(typeof getAuth!=='function') process.exit(1)",
  ]);
});
async function assertReject(fn, error) {
  await assert.rejects(fn, error);
}
const makeUser = async (role = "buyer") =>
  await sessionUser(
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
await run("UPDATE users SET role='admin' WHERE id=?", admin.id);
const image = randomUUID();
await run(
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
test("verified phone identities preserve accounts, enforce unique ownership and reject suspended users", async () => {
  const firstUid = randomUUID(), secondUid = randomUUID();
  const basePhone = randomInt(9000000000, 9999999900);
  const phone = (offset = 0) => `+91${basePhone + offset}`;
  const id = await connectPhone(
    firstUid,
    phone(),
    "Phone farmer",
  );
  const created = await one("SELECT id,name,role FROM users WHERE id=?", id);
  assert.equal(created.role, "buyer");
  const phoneSession = await sessionUser(await newSession(id));
  assert.equal(phoneSession.phone, phone());
  assert.equal(phoneSession.email, "");
  assert.equal(
    await connectPhone(firstUid, phone(), "Different name"),
    id,
  );
  assert.equal(
    (await one("SELECT name FROM users WHERE id=?", id)).name,
    "Phone farmer",
  );
  const existing = await makeUser("farmer");
  assert.equal(
    await connectPhone(
      secondUid,
      phone(1),
      "",
      existing,
      true,
    ),
    existing.id,
  );
  assert.equal(
    (await one("SELECT role FROM users WHERE id=?", existing.id)).role,
    "farmer",
  );
  await assert.rejects(
    () =>
      connectPhone(firstUid, phone(), "", existing, true),
    /phone_already_linked/,
  );
  await assert.rejects(
    () => connectPhone("other-identity", phone(), "Other account"),
    /invalid_login/,
  );
  await assert.rejects(
    () => connectPhone(secondUid, phone(2), "Other account"),
    /phone_already_linked/,
  );
  await assert.rejects(
    () => connectPhone("no-session", phone(3), "", null, true),
    /sign_in/,
  );
  await run("UPDATE users SET suspended=1 WHERE id=?", id);
  await assert.rejects(
    () => connectPhone(firstUid, phone(), "Phone farmer"),
    /invalid_login/,
  );
});
async function listing(patch = {}) {
  const { id } = await m.saveListing(farmer, {
    ...input,
    ...patch,
    action: "publish",
  });
  await m.moderate(admin, {
    id,
    action: "approve",
    reason: "Test fixture review",
  });
  return await m.getListing(id);
}
async function checkout(user, l, quantity = 1, key = randomUUID(), extra = {}) {
  await m.setCart(user, l.id, quantity);
  return await m.createOrders(user, {
    requestKey: key,
    name: "Test buyer",
    phone: "9876543210",
    fulfillment: "pickup",
    expected: [{ id: l.id, price: l.price, version: l.version }],
    ...extra,
  });
}
test("seller publishing, editing and resuming are public without approval; drafts stay private", async () => {
  const created = await m.saveListing(farmer, { ...input, action: "publish" });
  assert.equal(created.status, "published");
  const published = await m.getListing(created.id, farmer);
  assert.ok(
    (await m.discover(new URLSearchParams({ seller: farmer.id }))).items.some(
      (l) => l.id === created.id,
    ),
  );
  await m.saveListing(farmer, { ...published, price: 28, action: "publish" });
  assert.equal((await m.getListing(created.id)).price, 28);
  await m.changeListing(farmer, created.id, "pause");
  await assert.rejects(() => m.getListing(created.id), /not_found/);
  await m.changeListing(farmer, created.id, "resume");
  assert.equal((await m.getListing(created.id)).status, "published");
  await run(
    "UPDATE listings SET quantity=0,status='paused' WHERE id=?",
    created.id,
  );
  await assert.rejects(
    () => m.changeListing(farmer, created.id, "resume"),
    /invalid_quantity/,
  );
  const draft = await m.saveListing(farmer, { ...input, action: "draft" });
  await assert.rejects(() => m.getListing(draft.id), /not_found/);
});
test("authentication, password verification, role escalation and persistent throttles", async () => {
  await assert.rejects(
    async () =>
      await register({
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
  assert.equal((await sessionUser(token)).id, farmer.id);
  await assert.rejects(
    async () => await login({ email: farmer.email, password: "wrong" }),
    /invalid_login/,
  );
  assert.equal(await sessionUser("fake-token"), null);
  await limit("test", 1, 100);
  await assertReject(async () => await limit("test", 1, 100), /rate_limit/);
  await assertReject(
    async () => await m.moderate(buyer, { id: "x", action: "approve" }),
    /forbidden/,
  );
});
test("mandatory publication checks, image ownership, moderation, public privacy and filters", async () => {
  await assertReject(
    async () =>
      await m.saveListing(farmer, { ...input, crop: "", action: "publish" }),
    /invalid_fields/,
  );
  await assertReject(
    async () =>
      await m.saveListing(farmer, { ...input, images: [], action: "publish" }),
    /images_required/,
  );
  await assertReject(
    async () => await m.saveListing(buyer, { ...input, action: "publish" }),
    /farmer_required/,
  );
  const draft = await m.saveListing(farmer, {
    ...input,
    crop: "Draft",
    action: "draft",
  });
  await assertReject(async () => await m.getListing(draft.id), /not_found/);
  const l = await listing();
  assert.equal(l.contact, "");
  assert.equal(l.pickup, "");
  assert.equal(l.latitude, null);
  assert.equal((await m.getListing(l.id, farmer)).contact, input.contact);
  assert.ok(
    (
      await m.discover(
        new URLSearchParams({
          q: "test variety",
          location: "test district",
          category: "rice",
        }),
      )
    ).items.some((x) => x.id === l.id),
  );
  await assertReject(
    async () =>
      await m.saveListing(farmer, {
        ...input,
        images: [`/api/marketplace/media/${randomUUID()}`],
        action: "publish",
      }),
    /invalid_image/,
  );
});
test("stock reservations, duplicate retries, immutable prices, cancellation release and access", async () => {
  const l = await listing({ quantity: 5 });
  const key = randomUUID();
  const [id] = await checkout(buyer, l, 2, key);
  assert.equal((await m.getListing(l.id)).quantity, 3);
  assert.deepEqual(
    await m.createOrders(buyer, {
      requestKey: key,
      name: "Test",
      phone: "9876543210",
      fulfillment: "pickup",
    }),
    [id],
  );
  assert.equal((await m.getListing(l.id)).quantity, 3);
  assert.equal(
    (await m.orders(buyer2)).some((o) => o.id === id),
    false,
  );
  await assertReject(
    async () => await m.updateOrder(buyer2, id, "confirmed", ""),
    /forbidden/,
  );
  await assertReject(
    async () => await m.updateOrder(farmer, id, "delivered", ""),
    /invalid_transition/,
  );
  assert.equal(
    (await m.orders(buyer)).find((o) => o.id === id).sellerContact,
    undefined,
  );
  await m.updateOrder(farmer, id, "confirmed", "");
  assert.equal(
    (await m.orders(buyer)).find((o) => o.id === id).sellerContact,
    input.contact,
  );
  const current = await m.getListing(l.id, farmer);
  await m.saveListing(farmer, {
    ...current,
    price: 80,
    version: current.version,
    action: "publish",
  });
  assert.equal(
    (await m.orders(buyer)).find((o) => o.id === id).items[0].price,
    2550,
  );
  await assertReject(
    async () => await m.changeListing(farmer, l.id, "delete"),
    /active_orders/,
  );
  await m.updateOrder(admin, id, "cancelled", "Test cancellation");
  assert.equal((await m.getListing(l.id, farmer)).quantity, 5);
  await assertReject(
    async () => await m.updateOrder(admin, id, "cancelled", "again"),
    /invalid_transition/,
  );
});
test("stock / price drift, incompatible delivery, expiry and maximum quantities", async () => {
  const l = await listing({
    quantity: 10,
    minimum: 2,
    maximum: 4,
    fulfillment: "pickup",
  });
  await assertReject(
    async () => await m.setCart(buyer, l.id, 1),
    /stock_unavailable/,
  );
  await assertReject(
    async () => await m.setCart(buyer, l.id, 5),
    /stock_unavailable/,
  );
  await assertReject(
    async () =>
      await checkout(buyer, l, 2, randomUUID(), {
        fulfillment: "delivery",
        address: "Test address",
        pin: "500001",
      }),
    /fulfillment_mismatch/,
  );
  await assertReject(
    async () =>
      await checkout(buyer, l, 2, randomUUID(), {
        expected: [{ id: l.id, price: 1, version: l.version }],
      }),
    /stock_unavailable/,
  );
  const [id] = await checkout(buyer, l, 2);
  await run("UPDATE orders SET expiresAt='2000-01-01' WHERE id=?", id);
  await m.expireOrders();
  assert.equal((await m.getListing(l.id)).quantity, 10);
  assert.equal(
    (await m.orders(buyer)).find((o) => o.id === id).status,
    "cancelled",
  );
});
test("two independent processes cannot oversell the final stock", async () => {
  const l = await listing({ quantity: 3, minimum: 1 });
  await m.setCart(buyer, l.id, 2);
  await m.setCart(buyer2, l.id, 2);
  const call = promisify(execFile);
  const code = (user) =>
    `import {createOrders} from './lib/marketplace/service.ts';try{const ids=await createOrders(${JSON.stringify(user)},{requestKey:'${randomUUID()}',name:'Test',phone:'9876543210',fulfillment:'pickup',expected:[{id:'${l.id}',price:${l.price},version:${l.version}}]});console.log(JSON.stringify(ids));}catch(e){console.log('REJECTED:'+e.message);}`;
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
  assert.equal((await m.getListing(l.id)).quantity, 1);
});
test("partial drafts stay private and cannot bypass publication validation", async () => {
  const draft = await m.saveListing(farmer, {
    ...input,
    crop: "",
    description: "",
    images: [],
    price: 0,
    quantity: 0,
    action: "draft",
  });
  assert.equal((await m.getListing(draft.id, farmer)).status, "draft");
  await assertReject(async () => await m.getListing(draft.id), /not_found/);
  await assertReject(
    async () =>
      await m.moderate(admin, {
        id: draft.id,
        action: "approve",
        reason: "Test",
      }),
    /invalid_quantity/,
  );
});
test("multi-seller checkout is atomic and snapshots each seller separately", async () => {
  await run("DELETE FROM cart");
  const other = await makeUser("farmer");
  const otherImage = randomUUID();
  await run(
    "INSERT INTO images VALUES(?,?,?,?)",
    otherImage,
    other.id,
    new Uint8Array([1]),
    new Date().toISOString(),
  );
  const first = await listing({ quantity: 20, price: 10.25 });
  const created = await m.saveListing(other, {
    ...input,
    price: 3.5,
    quantity: 20,
    fulfillment: "delivery",
    images: [`/api/marketplace/media/${otherImage}`],
    action: "publish",
  });
  await m.moderate(admin, {
    id: created.id,
    action: "approve",
    reason: "Test review",
  });
  let second = await m.getListing(created.id);
  await m.setCart(buyer, first.id, 2);
  await m.setCart(buyer, second.id, 4);
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
  await assertReject(
    async () => await m.createOrders(buyer, request()),
    /fulfillment_mismatch/,
  );
  assert.equal((await m.getListing(first.id)).quantity, 20);
  const own = await m.getListing(second.id, other);
  await m.saveListing(other, {
    ...own,
    fulfillment: "both",
    action: "publish",
  });
  await m.moderate(admin, {
    id: second.id,
    action: "approve",
    reason: "Test review",
  });
  second = await m.getListing(second.id);
  const ids = await m.createOrders(buyer, request());
  assert.equal(ids.length, 2);
  const result = (await m.orders(buyer)).filter((o) => ids.includes(o.id));
  assert.equal(
    result.reduce((n, o) => n + o.total, 0),
    3450,
  );
  assert.equal((await m.getListing(first.id)).quantity, 18);
  assert.equal((await m.getListing(second.id)).quantity, 16);
});

test("admin workflow: queue overview, unpublish, enquiry replies and access boundaries", async () => {
  const l = await listing({ quantity: 15 });
  await assert.rejects(() => m.adminOverview(buyer), /forbidden/);
  await assert.rejects(
    () => m.moderate(buyer, { id: l.id, action: "unpublish", reason: "Test" }),
    /forbidden/,
  );
  await assert.rejects(
    () => m.moderate(admin, { id: l.id, action: "unpublish", reason: "" }),
    /reason_required/,
  );
  await m.moderate(admin, {
    id: l.id,
    action: "unpublish",
    reason: "Quality review requested",
  });
  await assert.rejects(() => m.getListing(l.id), /not_found/);
  assert.equal((await m.getListing(l.id, admin)).status, "paused");
  await m.moderate(admin, {
    id: farmer.id,
    action: "suspend",
    reason: "Test review",
  });
  assert.equal((await m.getListing(l.id, admin)).id, l.id);
  await m.moderate(admin, {
    id: farmer.id,
    action: "unsuspend",
    reason: "Review finished",
  });
  const id = randomUUID();
  await run(
    "INSERT INTO enquiries(id,listingId,buyerId,sellerId,message,createdAt) VALUES(?,?,?,?,?,?)",
    id,
    l.id,
    buyer.id,
    farmer.id,
    "Can I collect tomorrow?",
    new Date().toISOString(),
  );
  await assert.rejects(
    () =>
      m.moderate(buyer, { id, action: "reply-enquiry", reply: "Unauthorized" }),
    /forbidden/,
  );
  await assert.rejects(
    () => m.moderate(admin, { id, action: "reply-enquiry", reply: "" }),
    /invalid_fields/,
  );
  await m.moderate(admin, {
    id,
    action: "reply-enquiry",
    reply: "Please agree collection with the farmer.",
  });
  const overview = await m.adminOverview(admin);
  assert.equal(
    overview.enquiries.find((e) => e.id === id).reply,
    "Please agree collection with the farmer.",
  );
  assert(
    overview.audit.some(
      (a) => a.action === "admin.reply-enquiry" && a.targetId === id,
    ),
  );
  assert(overview.users.some((u) => u.id === farmer.id));
});

test("fractional checkout rounds integer paise consistently with crop comparison", async () => {
  const customer = await makeUser();
  const l = await listing({ price: 0.29, minimum: 0.5, quantity: 2 });
  const [id] = await checkout(customer, l, 0.5);
  const order = (await m.orders(customer)).find((o) => o.id === id);
  assert.equal(order.total, 15);
  assert.equal(order.items[0].subtotal, 15);
  assert.equal(order.items[0].price, 29);
  assert.equal((await m.getListing(l.id)).quantity, 1.5);
});
