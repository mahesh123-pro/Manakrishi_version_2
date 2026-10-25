import { NextRequest, NextResponse } from "next/server";
import {
  sessionUser,
  requireValue,
  MarketError,
  limit,
} from "@/lib/marketplace/auth";
import { listBookings, updateBooking } from "@/lib/admin/bookings";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
async function administrator(request: NextRequest) {
  const user = await sessionUser(
    request.cookies.get("mk_market_session")?.value,
  );
  requireValue(user, "sign_in", 401);
  requireValue(user.role === "admin", "forbidden", 403);
  return user;
}
function errorResponse(error: unknown) {
  if (error instanceof MarketError)
    return json({ error: error.code }, error.status);
  if (error instanceof SyntaxError)
    return json({ error: "invalid_fields" }, 400);
  console.error(
    "Admin booking backend failed",
    error instanceof Error ? error.name : "Unknown error",
  );
  return json({ error: "booking_backend_unavailable" }, 503);
}
export async function GET(request: NextRequest) {
  try {
    return json(
      await listBookings(
        await administrator(request),
        request.nextUrl.searchParams.get("cursor") || undefined,
      ),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await administrator(request);
    requireValue(
      request.headers.get("origin") ===
        (process.env.MARKETPLACE_ORIGIN || request.nextUrl.origin),
      "invalid_origin",
      403,
    );
    await limit(`booking-admin:${user.id}`, 40, 60);
    requireValue(
      Number(request.headers.get("content-length") || 0) <= 16384,
      "invalid_fields",
      413,
    );
    const reader = request.body?.getReader();
    requireValue(reader, "invalid_fields");
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        throw new MarketError("invalid_fields", 413);
      }
      chunks.push(value);
    }
    const input = JSON.parse(Buffer.concat(chunks).toString());
    requireValue(input && typeof input === "object" && !Array.isArray(input), "invalid_fields");
    await updateBooking(user, input);
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
