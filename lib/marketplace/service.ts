import { randomUUID } from "node:crypto";
import { all, one, run, transaction } from "./db.ts";
import { requireValue, MarketError } from "./auth.ts";
import {
  CATEGORIES,
  UNITS,
  type Listing,
  type ListingInput,
  type User,
  type Order,
} from "./types.ts";
const now = () => new Date().toISOString();
export async function settings(): Promise<{
  disabledCategories: string[];
  disabledUnits: string[];
  rules: string;
}> {
  const stored = await one<{
    value: string;
  }>("SELECT value FROM settings WHERE key='marketplace'");
  return stored
    ? JSON.parse(stored.value)
    : { disabledCategories: [], disabledUnits: [], rules: "" };
}
export async function saveSettings(user: User, input: Record<string, unknown>) {
  requireValue(user.role === "admin", "forbidden", 403);
  requireValue(
    Array.isArray(input.disabledCategories) &&
      input.disabledCategories.every((v) => CATEGORIES.some((c) => c[0] === v)),
    "invalid_category",
  );
  requireValue(
    Array.isArray(input.disabledUnits) &&
      input.disabledUnits.every((v) => Object.keys(UNITS).includes(v)) &&
      input.disabledUnits.length < 3,
    "invalid_unit",
  );
  const value = {
    disabledCategories: input.disabledCategories,
    disabledUnits: input.disabledUnits,
    rules: text(input.rules ?? "", 2000),
  };
  await transaction(async () => {
    await run(
      "INSERT INTO settings VALUES('marketplace',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      JSON.stringify(value),
    );
    await audit(user, "settings.updated", "marketplace", JSON.stringify(value));
  });
}
export function text(value: unknown, max = 200, required = false) {
  requireValue(
    typeof value === "string" &&
      value.length <= max &&
      (!required || value.trim().length > 0),
    "invalid_fields",
  );
  return value.trim();
}
export function numeric(value: unknown, min: number, max: number) {
  requireValue(
    typeof value === "number" &&
      Number.isFinite(value) &&
      value >= min &&
      value <= max,
    "invalid_quantity",
  );
  return value;
}
const milli = (v: number) => {
  requireValue(
    Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6,
    "invalid_quantity",
  );
  return Math.round(v * 1000);
};
export async function notify(userId: string, message: string, href: string) {
  await run(
    "INSERT INTO notifications(id,userId,message,href,createdAt) VALUES(?,?,?,?,?)",
    randomUUID(),
    userId,
    message,
    href,
    now(),
  );
}
export async function audit(
  user: User,
  action: string,
  target: string,
  detail = "",
) {
  await run(
    "INSERT INTO audit(actorId,action,targetId,detail,createdAt) VALUES(?,?,?,?,?)",
    user.id,
    action,
    target,
    detail,
    now(),
  );
}
export async function validateListing(
  input: Record<string, unknown>,
  user: User,
  publish = true,
): Promise<ListingInput> {
  const field = (name: string, max = 200, mandatory = false) =>
    text(input[name] ?? "", max, publish && mandatory);
  const unit = field("unit") as keyof typeof UNITS;
  requireValue(Object.keys(UNITS).includes(unit), "invalid_unit");
  const category = field("category");
  requireValue(
    CATEGORIES.some((c) => c[0] === category),
    "invalid_category",
  );
  const rules = await settings();
  requireValue(
    !publish || !rules.disabledCategories.includes(category),
    "invalid_category",
  );
  requireValue(!publish || !rules.disabledUnits.includes(unit), "invalid_unit");
  const price = numeric(input.price, publish ? 0.01 : 0, 1000000);
  requireValue(
    Math.abs(price * 100 - Math.round(price * 100)) < 1e-6,
    "invalid_price",
  );
  const quantity = numeric(input.quantity, publish ? 0.001 : 0, 1000000);
  const minimum = numeric(input.minimum, 0.001, 1000000);
  const maximum = numeric(input.maximum || 0, 0, 1000000);
  milli(quantity);
  milli(minimum);
  milli(maximum);
  requireValue(!publish || minimum <= quantity, "minimum_stock");
  requireValue(!maximum || maximum >= minimum, "invalid_maximum");
  requireValue(
    ["pickup", "delivery", "both"].includes(String(input.fulfillment)),
    "invalid_fulfillment",
  );
  const pin = field("pin", 6, true);
  const contact = field("contact", 100, true);
  if (publish)
    requireValue(
      /^[1-9]\d{5}$/.test(pin) && /^[6-9]\d{9}$/.test(contact),
      "invalid_contact",
    );
  const images = input.images;
  requireValue(
    Array.isArray(images) &&
      images.length <= 5 &&
      (!publish || images.length >= 1),
    "images_required",
  );
  for (const image of images) {
    requireValue(
      typeof image === "string" &&
        /^\/api\/marketplace\/media\/[a-f0-9-]{36}$/.test(image),
      "invalid_image",
    );
    const id = image.split("/").pop()!;
    requireValue(
      await one("SELECT id FROM images WHERE id=? AND ownerId=?", id, user.id),
      "invalid_image",
    );
  }
  const date = (name: string) => {
    const v = field(name, 10);
    requireValue(
      !v ||
        (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
          !Number.isNaN(Date.parse(v)) &&
          new Date(v).toISOString().slice(0, 10) === v),
      "invalid_date",
    );
    return v;
  };
  const lat =
    input.latitude === null || input.latitude === undefined
      ? null
      : numeric(input.latitude, -90, 90);
  const lon =
    input.longitude === null || input.longitude === undefined
      ? null
      : numeric(input.longitude, -180, 180);
  requireValue((lat === null) === (lon === null), "invalid_location");
  const organic = input.organic === true;
  const evidence = field("organicEvidence", 500);
  requireValue(!publish || !organic || evidence.length > 0, "organic_evidence");
  requireValue(
    !publish || category !== "organic" || organic,
    "organic_evidence",
  );
  return {
    crop: field("crop", 100, true),
    category,
    variety: field("variety", 100),
    description: field("description", 3000, true),
    images,
    price,
    unit,
    quantity,
    minimum,
    maximum,
    grade: field("grade", 100),
    organic,
    organicEvidence: evidence,
    negotiable: input.negotiable === true,
    village: field("village", 100, true),
    district: field("district", 100, true),
    state: field("state", 100, true),
    pin,
    harvest: date("harvest"),
    availableFrom: date("availableFrom"),
    fulfillment: input.fulfillment as ListingInput["fulfillment"],
    pickup: field("pickup", 500, true),
    contact,
    notes: field("notes", 1000),
    latitude: lat,
    longitude: lon,
  };
}
type Row = {
  id: string;
  sellerId: string;
  crop: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  minimum: number;
  maximum: number;
  data: string;
  status: string;
  version: number;
  views: number;
  moderation: string;
  createdAt: string;
  seller: string;
  verified: number;
};
export function listingFrom(row: Row, privateFields = false): Listing {
  const data = JSON.parse(row.data);
  // Exact pickup, private phone and precise GPS never leave the seller's private view.
  if (!privateFields) {
    data.contact = "";
    data.pickup = "";
    data.latitude = null;
    data.longitude = null;
  }
  return {
    ...data,
    id: row.id,
    sellerId: row.sellerId,
    seller: row.seller,
    verified: row.verified,
    crop: row.crop,
    category: row.category,
    price: row.price / 100,
    unit: row.unit,
    quantity: row.quantity / 1000,
    minimum: row.minimum / 1000,
    maximum: row.maximum / 1000,
    status: row.status,
    version: row.version,
    views: row.views,
    moderation: privateFields ? row.moderation : "",
    createdAt: row.createdAt,
  };
}
const listingQuery =
  "SELECT l.*,u.name seller,u.verified FROM listings l JOIN users u ON u.id=l.sellerId";
export async function getListing(id: string, user?: User | null) {
  const row = await one<Row>(
    `${listingQuery} WHERE l.id=? AND u.suspended=0`,
    id,
  );
  requireValue(
    row &&
      (row.status === "published" ||
        user?.id === row.sellerId ||
        user?.role === "admin"),
    "not_found",
    404,
  );
  return listingFrom(row, user?.id === row.sellerId || user?.role === "admin");
}
export async function discover(params: URLSearchParams) {
  await expireOrders();
  let rows = await all<Row>(
    `${listingQuery} WHERE l.status='published' AND l.quantity>=l.minimum AND u.suspended=0 ORDER BY l.createdAt DESC`,
  );
  const search = (params.get("q") || "").toLowerCase().slice(0, 200);
  let items = rows
    .map((r) => listingFrom(r))
    .filter((l) => {
      const haystack =
        `${l.crop} ${l.variety} ${l.category} ${l.seller} ${l.village} ${l.district} ${l.state} ${l.grade} ${l.quantity}`.toLowerCase();
      const kgPrice = l.price / UNITS[l.unit];
      return (
        (!search || haystack.includes(search)) &&
        (!params.get("category") || l.category === params.get("category")) &&
        (!params.get("location") ||
          `${l.village} ${l.district} ${l.state}`
            .toLowerCase()
            .includes(params.get("location")!.toLowerCase())) &&
        (!params.get("variety") ||
          l.variety
            .toLowerCase()
            .includes(params.get("variety")!.toLowerCase())) &&
        (!params.get("grade") ||
          l.grade.toLowerCase().includes(params.get("grade")!.toLowerCase())) &&
        (!params.get("minPrice") ||
          kgPrice >= Number(params.get("minPrice"))) &&
        (!params.get("maxPrice") ||
          kgPrice <= Number(params.get("maxPrice"))) &&
        (!params.get("quantity") ||
          l.quantity * UNITS[l.unit] >= Number(params.get("quantity"))) &&
        (!params.get("maxMinimum") ||
          l.minimum * UNITS[l.unit] <= Number(params.get("maxMinimum"))) &&
        (!params.get("organic") || l.organic) &&
        (!params.get("verified") || l.verified === 1) &&
        (!params.get("harvest") || l.harvest >= params.get("harvest")!) &&
        (!params.get("seller") || l.sellerId === params.get("seller"))
      );
    });
  const sort = params.get("sort");
  if (sort === "price-asc" || sort === "price-desc")
    items.sort(
      (a, b) =>
        (a.price / UNITS[a.unit] - b.price / UNITS[b.unit]) *
        (sort === "price-asc" ? 1 : -1),
    );
  if (sort === "quantity")
    items.sort(
      (a, b) => b.quantity * UNITS[b.unit] - a.quantity * UNITS[a.unit],
    );
  const count = items.length;
  const page = Math.max(1, Math.min(100000, Number(params.get("page")) || 1));
  items = items.slice((page - 1) * 12, page * 12);
  return { items, count, page, hasMore: page * 12 < count };
}
export async function saveListing(user: User, input: Record<string, unknown>) {
  requireValue(
    user.role === "farmer" && !user.suspended,
    "farmer_required",
    403,
  );
  const publish = input.action === "publish";
  const data = await validateListing(input, user, publish);
  return await transaction(async () => {
    const id = input.id ? text(input.id) : randomUUID();
    const existing = await one<Row>("SELECT * FROM listings WHERE id=?", id);
    requireValue(!input.id || existing?.sellerId === user.id, "forbidden", 403);
    if (existing) {
      requireValue(existing.version === input.version, "stale_listing", 409);
      const outstanding = (await one<{
        n: number;
      }>(
        "SELECT COUNT(*) n FROM order_items i JOIN orders o ON o.id=i.orderId WHERE i.listingId=? AND o.status NOT IN ('cancelled','rejected','delivered')",
        id,
      ))!.n;
      requireValue(
        !outstanding || existing.unit === data.unit,
        "unit_locked",
        409,
      );
      await run(
        "UPDATE listings SET crop=?,category=?,price=?,unit=?,quantity=?,minimum=?,maximum=?,data=?,status=?,version=version+1,updatedAt=? WHERE id=?",
        data.crop,
        data.category,
        Math.round(data.price * 100),
        data.unit,
        milli(data.quantity),
        milli(data.minimum),
        milli(data.maximum),
        JSON.stringify(data),
        publish ? "pending" : "draft",
        now(),
        id,
      );
    } else {
      await run(
        "INSERT INTO listings(id,sellerId,crop,category,price,unit,quantity,minimum,maximum,status,data,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        id,
        user.id,
        data.crop,
        data.category,
        Math.round(data.price * 100),
        data.unit,
        milli(data.quantity),
        milli(data.minimum),
        milli(data.maximum),
        publish ? "pending" : "draft",
        JSON.stringify(data),
        now(),
        now(),
      );
    }
    await audit(user, publish ? "listing.submitted" : "listing.draft", id);
    return { id, status: publish ? "pending" : "draft" };
  });
}
export async function changeListing(user: User, id: string, action: string) {
  return await transaction(async () => {
    const listing = await getListing(id, user);
    requireValue(listing.sellerId === user.id, "forbidden", 403);
    const transitions: Record<string, string> = {
      pause: "paused",
      resume: "pending",
      unavailable: "unavailable",
      delete: "deleted",
    };
    requireValue(
      transitions[action] &&
        (action !== "pause" || listing.status === "published") &&
        (action !== "resume" ||
          ["paused", "unavailable", "rejected"].includes(listing.status)),
      "invalid_transition",
    );
    if (action === "delete")
      requireValue(
        !(await one(
          "SELECT i.orderId FROM order_items i JOIN orders o ON o.id=i.orderId WHERE i.listingId=? AND o.status NOT IN ('cancelled','rejected','delivered')",
          id,
        )),
        "active_orders",
        409,
      );
    await run(
      "UPDATE listings SET status=?,version=version+1,updatedAt=? WHERE id=?",
      transitions[action],
      now(),
      id,
    );
    await audit(user, `listing.${action}`, id);
  });
}
async function restoreStock(orderId: string) {
  for (const item of await all<{
    listingId: string;
    quantity: number;
  }>("SELECT listingId,quantity FROM order_items WHERE orderId=?", orderId))
    await run(
      "UPDATE listings SET quantity=quantity+?,version=version+1 WHERE id=?",
      item.quantity,
      item.listingId,
    );
}
export async function expireOrders() {
  await transaction(async () => {
    for (const o of await all<{
      id: string;
      buyerId: string;
      sellerId: string;
    }>(
      "SELECT id,buyerId,sellerId FROM orders WHERE status='awaiting_confirmation' AND expiresAt<?",
      now(),
    )) {
      await restoreStock(o.id);
      await run(
        "UPDATE orders SET status='cancelled',reason='Reservation expired after 24 hours' WHERE id=?",
        o.id,
      );
      await notify(o.buyerId, "order_expired", "/marketplace/orders");
      await notify(o.sellerId, "order_expired", "/marketplace/orders");
    }
  });
}
export async function cart(user: User) {
  await expireOrders();
  return await Promise.all(
    (
      await all<{
        listingId: string;
        quantity: number;
      }>("SELECT listingId,quantity FROM cart WHERE userId=?", user.id)
    ).map(async (row) => {
      let listing = null;
      try {
        listing = await getListing(row.listingId);
      } catch {}
      return {
        listingId: row.listingId,
        quantity: row.quantity / 1000,
        listing,
      };
    }),
  );
}
export async function setCart(user: User, id: string, quantity: number) {
  if (quantity === 0) {
    await run("DELETE FROM cart WHERE userId=? AND listingId=?", user.id, id);
    return;
  }
  const l = await getListing(id);
  requireValue(l.sellerId !== user.id, "own_listing");
  requireValue(
    l.status === "published" &&
      quantity >= l.minimum &&
      quantity <= l.quantity &&
      (!l.maximum || quantity <= l.maximum),
    "stock_unavailable",
    409,
  );
  const q = milli(numeric(quantity, 0.001, 1000000));
  await run(
    "INSERT INTO cart VALUES(?,?,?) ON CONFLICT(userId,listingId) DO UPDATE SET quantity=excluded.quantity",
    user.id,
    id,
    q,
  );
}
export async function createOrders(user: User, input: Record<string, unknown>) {
  const key = text(input.requestKey, 80, true);
  requireValue(/^[a-f0-9-]{36}$/.test(key), "invalid_request");
  const delivery = input.fulfillment === "delivery";
  requireValue(
    delivery || input.fulfillment === "pickup",
    "invalid_fulfillment",
  );
  const data = {
    name: text(input.name, 100, true),
    phone: text(input.phone, 10, true),
    address: text(input.address ?? "", 500, delivery),
    pin: text(input.pin ?? "", 6, delivery),
    fulfillment: delivery ? "delivery" : "pickup",
  };
  requireValue(
    /^[6-9]\d{9}$/.test(data.phone) &&
      (!delivery || /^[1-9]\d{5}$/.test(data.pin)),
    "invalid_contact",
  );
  await expireOrders();
  return await transaction(async () => {
    const prior = await all<{
      id: string;
    }>("SELECT id FROM orders WHERE buyerId=? AND requestKey=?", user.id, key);
    if (prior.length) return prior.map((o) => o.id);
    const lines = await all<{
      listingId: string;
      quantity: number;
    }>("SELECT listingId,quantity FROM cart WHERE userId=?", user.id);
    requireValue(lines.length > 0 && lines.length <= 30, "empty_cart");
    const groups = new Map<
      string,
      {
        l: Listing;
        quantity: number;
        subtotal: number;
      }[]
    >();
    for (const line of lines) {
      const l = await getListing(line.listingId);
      const expected = Array.isArray(input.expected)
        ? input.expected.find((e: { id: string }) => e.id === l.id)
        : null;
      requireValue(
        expected &&
          expected.price === l.price &&
          expected.version === l.version,
        "stock_unavailable",
        409,
      );
      requireValue(
        l.sellerId !== user.id &&
          l.quantity * 1000 >= line.quantity &&
          line.quantity >= l.minimum * 1000 &&
          (!l.maximum || line.quantity <= l.maximum * 1000),
        "stock_unavailable",
        409,
      );
      requireValue(
        !l.availableFrom || l.availableFrom <= now().slice(0, 10),
        "not_available_yet",
        409,
      );
      requireValue(
        l.fulfillment === "both" || l.fulfillment === data.fulfillment,
        "fulfillment_mismatch",
      );
      const quantity = line.quantity / 1000;
      const subtotal = Math.round(l.price * 100 * quantity);
      requireValue(
        Number.isSafeInteger(subtotal) && subtotal > 0 && subtotal <= 100000000,
        "order_too_large",
      );
      groups.set(l.sellerId, [
        ...(groups.get(l.sellerId) || []),
        { l, quantity, subtotal },
      ]);
    }
    const ids: string[] = [];
    for (const [sellerId, group] of groups) {
      const id = randomUUID();
      const total = group.reduce((n, g) => n + g.subtotal, 0);
      requireValue(total <= 100000000, "order_too_large");
      const privateListing = await getListing(group[0].l.id, {
        ...user,
        id: sellerId,
      });
      const details = {
        ...data,
        sellerContact: privateListing.contact,
        pickupAddress: privateListing.pickup,
      };
      await run(
        "INSERT INTO orders(id,buyerId,sellerId,status,total,data,requestKey,createdAt,expiresAt) VALUES(?,?,?,'awaiting_confirmation',?,?,?,?,?)",
        id,
        user.id,
        sellerId,
        total,
        JSON.stringify(details),
        key,
        now(),
        new Date(Date.now() + 86400000).toISOString(),
      );
      for (const g of group) {
        const q = milli(g.quantity);
        const result = await run(
          "UPDATE listings SET quantity=quantity-?,version=version+1 WHERE id=? AND quantity>=? AND status='published'",
          q,
          g.l.id,
          q,
        );
        requireValue(result.changes === 1, "stock_unavailable", 409);
        if (g.l.quantity - g.quantity < g.l.minimum)
          await notify(sellerId, "low_stock", "/marketplace/my-listings");
        await run(
          "INSERT INTO order_items VALUES(?,?,?,?)",
          id,
          g.l.id,
          q,
          JSON.stringify({
            listingId: g.l.id,
            crop: g.l.crop,
            variety: g.l.variety,
            unit: g.l.unit,
            price: Math.round(g.l.price * 100),
            quantity: g.quantity,
            subtotal: g.subtotal,
          }),
        );
      }
      await notify(sellerId, "new_order", "/marketplace/orders");
      await audit(user, "order.requested", id);
      ids.push(id);
    }
    await run("DELETE FROM cart WHERE userId=?", user.id);
    return ids;
  });
}
export async function orders(user: User): Promise<Order[]> {
  await expireOrders();
  return await Promise.all(
    (
      await all<{
        id: string;
        buyerId: string;
        sellerId: string;
        status: string;
        total: number;
        data: string;
        createdAt: string;
        expiresAt: string;
        reason: string;
        buyer: string;
        seller: string;
      }>(
        `SELECT o.*,b.name buyer,s.name seller FROM orders o JOIN users b ON b.id=o.buyerId JOIN users s ON s.id=o.sellerId ${user.role === "admin" ? "" : "WHERE o.buyerId=? OR o.sellerId=?"} ORDER BY o.createdAt DESC`,
        ...(user.role === "admin" ? [] : [user.id, user.id]),
      )
    ).map(async (o) => {
      const { data, ...fields } = o;
      const details = JSON.parse(data);
      if (
        user.id === o.buyerId &&
        ["awaiting_confirmation", "rejected", "cancelled"].includes(o.status)
      ) {
        delete details.sellerContact;
        delete details.pickupAddress;
      }
      return {
        ...fields,
        ...details,
        items: (
          await all<{
            snapshot: string;
          }>("SELECT snapshot FROM order_items WHERE orderId=?", o.id)
        ).map((i) => JSON.parse(i.snapshot)),
      };
    }),
  );
}
export async function updateOrder(
  user: User,
  id: string,
  target: string,
  reason: string,
) {
  await expireOrders();
  await transaction(async () => {
    const o = await one<{
      buyerId: string;
      sellerId: string;
      status: string;
      data: string;
    }>("SELECT * FROM orders WHERE id=?", id);
    requireValue(o, "not_found", 404);
    const seller = user.id === o.sellerId;
    const transitions: Record<string, string[]> = {
      awaiting_confirmation: ["confirmed", "rejected", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready"],
      ready:
        JSON.parse(o.data).fulfillment === "delivery"
          ? ["shipped"]
          : ["delivered"],
      shipped: ["delivered"],
    };
    requireValue(
      transitions[o.status]?.includes(target),
      "invalid_transition",
      409,
    );
    requireValue(
      user.role === "admin" ||
        (seller && target !== "cancelled") ||
        (user.id === o.buyerId &&
          target === "cancelled" &&
          o.status === "awaiting_confirmation"),
      "forbidden",
      403,
    );
    if (["cancelled", "rejected"].includes(target)) {
      text(reason, 500, true);
      await restoreStock(id);
    }
    if (target === "confirmed") {
      for (const i of await all<{
        listingId: string;
      }>("SELECT listingId FROM order_items WHERE orderId=?", id))
        requireValue(
          await one(
            "SELECT id FROM listings WHERE id=? AND status IN ('published','paused')",
            i.listingId,
          ),
          "stock_unavailable",
          409,
        );
    }
    await run(
      "UPDATE orders SET status=?,reason=? WHERE id=?",
      target,
      reason.slice(0, 500),
      id,
    );
    await notify(o.buyerId, `order_${target}`, "/marketplace/orders");
    await audit(user, `order.${target}`, id, reason);
  });
}
export async function sellerListings(user: User) {
  await expireOrders();
  return (
    await all<Row>(
      `${listingQuery} WHERE l.sellerId=? AND l.status!='deleted' ORDER BY l.createdAt DESC`,
      user.id,
    )
  ).map((row) => listingFrom(row, true));
}
export async function moderate(user: User, input: Record<string, unknown>) {
  requireValue(user.role === "admin", "forbidden", 403);
  await transaction(async () => {
    const id = text(input.id, 100, true);
    const action = text(input.action);
    const reason = text(input.reason ?? "", 500);
    if (["approve", "reject", "corrections"].includes(action)) {
      const l = await getListing(id, user);
      requireValue(l.status !== "deleted", "invalid_transition");
      requireValue(
        action === "approve" || reason.length > 0,
        "reason_required",
      );
      if (action === "approve") {
        const seller = await one<User>(
          "SELECT * FROM users WHERE id=? AND suspended=0",
          l.sellerId,
        );
        requireValue(seller, "forbidden", 403);
        await validateListing(
          l as unknown as Record<string, unknown>,
          seller,
          true,
        );
      }
      const status =
        action === "approve"
          ? "published"
          : action === "reject"
            ? "rejected"
            : "corrections";
      await run(
        "UPDATE listings SET status=?,moderation=?,version=version+1 WHERE id=?",
        status,
        reason,
        id,
      );
      await notify(l.sellerId, `listing_${status}`, "/marketplace/my-listings");
    } else if (action === "verify" || action === "unverify") {
      requireValue(reason.length > 0, "reason_required");
      await run(
        "UPDATE users SET verified=? WHERE id=? AND role='farmer'",
        action === "verify" ? 1 : 0,
        id,
      );
    } else if (action === "suspend" || action === "unsuspend") {
      requireValue(id !== user.id && reason.length > 0, "reason_required");
      await run(
        "UPDATE users SET suspended=? WHERE id=? AND role!='admin'",
        action === "suspend" ? 1 : 0,
        id,
      );
    } else if (action === "resolve") {
      requireValue(reason.length > 0, "reason_required");
      await run(
        "UPDATE reports SET status='resolved',resolution=? WHERE id=?",
        reason,
        id,
      );
    } else throw new MarketError("invalid_action");
    await audit(user, `admin.${action}`, id, reason);
  });
}
export async function adminOverview(user: User) {
  requireValue(user.role === "admin", "forbidden", 403);
  await expireOrders();
  return {
    listings: (
      await all<Row>(
        `${listingQuery} WHERE l.status!='deleted' ORDER BY l.createdAt DESC`,
      )
    ).map((r) => listingFrom(r, true)),
    users: await all("SELECT id,name,email,role,verified,suspended FROM users"),
    reports: await all("SELECT * FROM reports ORDER BY createdAt DESC"),
    orders: await orders(user),
    audit: await all("SELECT * FROM audit ORDER BY id DESC LIMIT 100"),
    metrics: {
      active: (await one<{
        n: number;
      }>("SELECT COUNT(*) n FROM listings WHERE status='published'"))!.n,
      pending: (await one<{
        n: number;
      }>("SELECT COUNT(*) n FROM listings WHERE status='pending'"))!.n,
      orderValue: (await one<{
        n: number;
      }>(
        "SELECT COALESCE(SUM(total),0) n FROM orders WHERE status NOT IN ('cancelled','rejected')",
      ))!.n,
      completedValue: (await one<{
        n: number;
      }>(
        "SELECT COALESCE(SUM(total),0) n FROM orders WHERE status='delivered'",
      ))!.n,
    },
  };
}
