import { NextResponse } from "next/server";
import { paymentConfig, razorpayRequest, sign } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const { enabled, amount } = paymentConfig();
  return NextResponse.json({ enabled, amount: enabled ? amount : null }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const config = paymentConfig();
  if (!config.enabled) return NextResponse.json({ error: "Online payments are not available yet." }, { status: 503 });
  try {
    const { bookingId } = await request.json();
    if (typeof bookingId !== "string" || !/^[a-zA-Z0-9]{20}$/.test(bookingId)) return NextResponse.json({ error: "Invalid booking reference." }, { status: 400 });
    const order = await razorpayRequest("orders", { amount: config.amount, currency: "INR", receipt: `booking_${bookingId}`, notes: { booking_id: bookingId, purpose: "Optional booking advance" } });
    const data = Buffer.from(JSON.stringify({ orderId: order.id, bookingId, amount: config.amount, expires: Date.now() + 86400000 })).toString("base64url");
    return NextResponse.json({ key: config.key, orderId: order.id, amount: config.amount, token: `${data}.${sign(data, config.secret)}` });
  } catch {
    return NextResponse.json({ error: "Could not start checkout. Your booking request is saved. Please try again." }, { status: 502 });
  }
}
