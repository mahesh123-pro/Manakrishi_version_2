import { NextRequest } from "next/server";
import { one } from "@/lib/marketplace/db";
import { sessionUser } from "@/lib/marketplace/auth";
export const runtime = "nodejs";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const image = one<{ ownerId: string; bytes: Uint8Array }>(
      "SELECT ownerId,bytes FROM images WHERE id=?",
      id,
    );
    if (!image) return new Response("Not found", { status: 404 });
    const user = sessionUser(request.cookies.get("mk_market_session")?.value);
    const publicImage =
      one(
        "SELECT l.id FROM listings l JOIN users u ON u.id=l.sellerId WHERE l.status='published' AND u.suspended=0 AND EXISTS(SELECT 1 FROM json_each(l.data,'$.images') WHERE value=?)",
        `/api/marketplace/media/${id}`,
      ) ||
      one(
        "SELECT id FROM users WHERE photo=? AND suspended=0",
        `/api/marketplace/media/${id}`,
      );
    if (!publicImage && user?.id !== image.ownerId && user?.role !== "admin")
      return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(image.bytes), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
