import { NextResponse } from "next/server";
import { equalSignature, paymentConfig, razorpayRequest, sign } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const { enabled, secret } = paymentConfig();
  if (!enabled) return NextResponse.json({ error: "Payments are unavailable." }, { status: 503 });
  try {
    const { token, razorpay_payment_id: paymentId, razorpay_order_id: returnedOrderId, razorpay_signature: signature } = await request.json();
    if (typeof token !== "string" || token.length > 2048 || typeof paymentId !== "string" || !/^pay_[a-zA-Z0-9]+$/.test(paymentId) || typeof signature !== "string") return NextResponse.json({ error: "Invalid payment details." }, { status: 400 });
    const [data, mac] = token.split(".");
    if (!mac || !equalSignature(mac, sign(data, secret))) return NextResponse.json({ error: "Invalid checkout token." }, { status: 400 });
    const saved = JSON.parse(Buffer.from(data, "base64url").toString());
    if (saved.expires < Date.now() || saved.orderId !== returnedOrderId || !equalSignature(signature, sign(`${saved.orderId}|${paymentId}`, secret))) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    const [order, payment] = await Promise.all([razorpayRequest(`orders/${saved.orderId}`), razorpayRequest(`payments/${paymentId}`)]);
    if (payment.order_id !== saved.orderId || order.notes?.booking_id !== saved.bookingId || order.amount !== saved.amount || payment.amount !== saved.amount || payment.currency !== "INR") return NextResponse.json({ error: "Payment details do not match this booking." }, { status: 400 });
    // Razorpay keeps the durable payment record and the order's booking_id link.
    return NextResponse.json({ status: payment.status === "captured" ? "paid" : "pending", paymentId, bookingId: saved.bookingId, amount: saved.amount });
  } catch {
    return NextResponse.json({ error: "Unable to verify payment yet. Keep your payment ID and contact our team before paying again." }, { status: 502 });
  }
}
