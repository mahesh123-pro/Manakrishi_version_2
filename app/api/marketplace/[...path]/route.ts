import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { all, one, run } from "@/lib/marketplace/db";
import {
  MarketError,
  requireValue,
  sessionUser,
  login,
  register,
  tokenHash,
  limit,
} from "@/lib/marketplace/auth";
import * as service from "@/lib/marketplace/service";
import type { User } from "@/lib/marketplace/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "mk_market_session";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
function requireUser(request: NextRequest): User {
  const user = sessionUser(request.cookies.get(COOKIE)?.value);
  requireValue(user, "sign_in", 401);
  return user;
}
function handleError(error: unknown) {
  if (error instanceof SyntaxError)
    return json({ error: "invalid_fields" }, 400);
  if (error instanceof MarketError)
    return json({ error: error.code }, error.status);
  console.error(
    "Marketplace request failed",
    error instanceof Error ? error.message : "Unknown error",
  );
  return json({ error: "server_error" }, 503);
}
async function boundedBody(request: NextRequest, max: number) {
  const reader = request.body?.getReader();
  requireValue(reader, "invalid_fields");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new MarketError("upload_too_large", 413);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const path = (await context.params).path;
    if (path[0] === "session")
      return json({ user: sessionUser(request.cookies.get(COOKIE)?.value) });
    if (path[0] === "rules") return json(service.settings());
    if (path[0] === "listings")
      return json(service.discover(request.nextUrl.searchParams));
    if (path[0] === "product") {
      const l = service.getListing(
        path[1],
        sessionUser(request.cookies.get(COOKIE)?.value),
      );
      if (
        l.status === "published" &&
        request.nextUrl.searchParams.get("view") === "1" &&
        sessionUser(request.cookies.get(COOKIE)?.value)?.id !== l.sellerId
      )
        run("UPDATE listings SET views=views+1 WHERE id=?", l.id);
      return json({ listing: l });
    }
    if (path[0] === "farmer") {
      const farmer = one(
        "SELECT id,name,verified,village,district,state,bio,photo,publicContact FROM users WHERE id=? AND role='farmer' AND suspended=0",
        path[1],
      );
      requireValue(farmer, "not_found", 404);
      const query = new URLSearchParams({
        seller: path[1],
        page: request.nextUrl.searchParams.get("page") || "1",
      });
      return json({ farmer, ...service.discover(query) });
    }
    const user = requireUser(request);
    if (path[0] === "my-listings")
      return json({ items: service.sellerListings(user) });
    if (path[0] === "cart") return json({ items: service.cart(user) });
    if (path[0] === "wishlist") {
      const ids = all<{ listingId: string }>(
        "SELECT listingId FROM wishlist WHERE userId=?",
        user.id,
      );
      return json({
        items: ids.flatMap((row) => {
          try {
            return [service.getListing(row.listingId)];
          } catch {
            return [];
          }
        }),
      });
    }
    if (path[0] === "orders") return json({ items: service.orders(user) });
    if (path[0] === "notifications")
      return json({
        items: all(
          "SELECT * FROM notifications WHERE userId=? ORDER BY createdAt DESC LIMIT 50",
          user.id,
        ),
      });
    if (path[0] === "enquiries")
      return json({
        items: all(
          "SELECT e.*,u.name buyerName,l.crop FROM enquiries e JOIN users u ON u.id=e.buyerId JOIN listings l ON l.id=e.listingId WHERE e.buyerId=? OR e.sellerId=? ORDER BY e.createdAt DESC",
          user.id,
          user.id,
        ),
      });
    if (path[0] === "admin")
      return json({
        ...service.adminOverview(user),
        settings: service.settings(),
      });
    return json({ error: "not_found" }, 404);
  } catch (error) {
    return handleError(error);
  }
}
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const origin = process.env.MARKETPLACE_ORIGIN || request.nextUrl.origin;
    requireValue(
      request.headers.get("origin") === origin,
      "invalid_origin",
      403,
    );
    const path = (await context.params).path;
    requireValue(
      Number(request.headers.get("content-length") || 0) <= 6 * 1024 * 1024,
      "upload_too_large",
      413,
    );
    if (path[0] === "auth") {
      // Per-account and aggregate limits persist across Node restarts.
      limit("auth:global", 120, 60);
      const input = JSON.parse((await boundedBody(request, 16384)).toString());
      limit(`auth:${String(input.email).toLowerCase().slice(0, 254)}`, 10, 900);
      const token =
        path[1] === "register" ? await register(input) : await login(input);
      const response = json({ user: sessionUser(token) });
      response.cookies.set(COOKIE, token, {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production" &&
          !origin.startsWith("http://localhost:"),
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 86400,
      });
      return response;
    }
    const user = requireUser(request);
    limit(`write:${user.id}`, 60, 60);
    if (path[0] === "logout") {
      run(
        "DELETE FROM sessions WHERE hash=?",
        tokenHash(request.cookies.get(COOKIE)!.value),
      );
      const response = json({ ok: true });
      response.cookies.delete(COOKIE);
      return response;
    }
    if (path[0] === "upload") {
      requireValue(user.role === "farmer", "farmer_required", 403);
      limit(`upload:${user.id}`, 20, 3600);
      const bytesBody = await boundedBody(request, 6 * 1024 * 1024);
      const multipart = new Response(new Uint8Array(bytesBody), {
        headers: { "Content-Type": request.headers.get("content-type") || "" },
      });
      const file = (await multipart.formData()).get("file");
      requireValue(
        file instanceof File && file.size > 0 && file.size <= 5 * 1024 * 1024,
        "upload_too_large",
      );
      const buffer = Buffer.from(await file.arrayBuffer());
      const image = sharp(buffer, {
        limitInputPixels: 20000000,
        animated: false,
      });
      const metadata = await image.metadata().catch(() => {
        throw new MarketError("invalid_image");
      });
      requireValue(
        ["jpeg", "png", "webp"].includes(metadata.format || ""),
        "invalid_image",
      );
      requireValue(
        (one<{ n: number }>(
          "SELECT COUNT(*) n FROM images WHERE ownerId=?",
          user.id,
        )?.n || 0) < 100,
        "image_limit",
      );
      const bytes = await image
        .rotate()
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      const id = randomUUID();
      run(
        "INSERT INTO images VALUES(?,?,?,?)",
        id,
        user.id,
        bytes,
        new Date().toISOString(),
      );
      return json({ url: `/api/marketplace/media/${id}` });
    }
    const input = JSON.parse((await boundedBody(request, 65536)).toString());
    if (path[0] === "listings") return json(service.saveListing(user, input));
    if (path[0] === "listing-action") {
      service.changeListing(
        user,
        service.text(input.id),
        service.text(input.action),
      );
      return json({ ok: true });
    }
    if (path[0] === "cart") {
      service.setCart(user, service.text(input.listingId), input.quantity);
      return json({ ok: true });
    }
    if (path[0] === "wishlist") {
      const id = service.text(input.listingId);
      service.getListing(id);
      if (input.remove)
        run("DELETE FROM wishlist WHERE userId=? AND listingId=?", user.id, id);
      else run("INSERT OR IGNORE INTO wishlist VALUES(?,?)", user.id, id);
      return json({ ok: true });
    }
    if (path[0] === "orders")
      return json({ ids: service.createOrders(user, input) });
    if (path[0] === "order-action") {
      service.updateOrder(
        user,
        service.text(input.id),
        service.text(input.status),
        service.text(input.reason ?? "", 500),
      );
      return json({ ok: true });
    }
    if (path[0] === "profile") {
      const name = service.text(input.name, 100, true),
        bio = service.text(input.bio ?? "", 1000),
        village = service.text(input.village ?? "", 100),
        district = service.text(input.district ?? "", 100),
        state = service.text(input.state ?? "", 100),
        contact = service.text(input.publicContact ?? "", 100),
        photo = service.text(input.photo ?? "", 200);
      requireValue(
        !photo ||
          (/^\/api\/marketplace\/media\/[a-f0-9-]{36}$/.test(photo) &&
            one(
              "SELECT id FROM images WHERE ownerId=? AND id=?",
              user.id,
              photo.split("/").pop()!,
            )),
        "invalid_image",
      );
      requireValue(!contact || /^[6-9]\d{9}$/.test(contact), "invalid_contact");
      run(
        "UPDATE users SET name=?,bio=?,village=?,district=?,state=?,publicContact=?,photo=? WHERE id=?",
        name,
        bio,
        village,
        district,
        state,
        contact,
        photo,
        user.id,
      );
      return json({ ok: true });
    }
    if (path[0] === "enquiries") {
      const l = service.getListing(service.text(input.listingId));
      requireValue(l.sellerId !== user.id, "own_listing");
      const message = service.text(input.message, 1000, true);
      run(
        "INSERT INTO enquiries(id,listingId,buyerId,sellerId,message,createdAt) VALUES(?,?,?,?,?,?)",
        randomUUID(),
        l.id,
        user.id,
        l.sellerId,
        message,
        new Date().toISOString(),
      );
      service.notify(l.sellerId, "new_enquiry", "/marketplace/orders");
      return json({ ok: true });
    }
    if (path[0] === "enquiry-reply") {
      const id = service.text(input.id),
        reply = service.text(input.reply, 1000, true);
      const e = one<{ buyerId: string }>(
        "SELECT buyerId FROM enquiries WHERE id=? AND sellerId=?",
        id,
        user.id,
      );
      requireValue(e, "forbidden", 403);
      run("UPDATE enquiries SET reply=? WHERE id=?", reply, id);
      service.notify(e.buyerId, "enquiry_reply", "/marketplace/orders");
      return json({ ok: true });
    }
    if (path[0] === "report") {
      const id = service.text(input.listingId);
      service.getListing(id);
      run(
        "INSERT INTO reports(id,userId,listingId,reason,createdAt) VALUES(?,?,?,?,?)",
        randomUUID(),
        user.id,
        id,
        service.text(input.reason, 1000, true),
        new Date().toISOString(),
      );
      return json({ ok: true });
    }
    if (path[0] === "notifications") {
      run("UPDATE notifications SET seen=1 WHERE userId=?", user.id);
      return json({ ok: true });
    }
    if (path[0] === "admin") {
      service.moderate(user, input);
      return json({ ok: true });
    }
    if (path[0] === "admin-settings") {
      service.saveSettings(user, input);
      return json({ ok: true });
    }
    return json({ error: "not_found" }, 404);
  } catch (error) {
    return handleError(error);
  }
}
