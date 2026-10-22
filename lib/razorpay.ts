import { createHmac, timingSafeEqual } from "node:crypto";

export function paymentConfig() {
  const key = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const amount = Number(process.env.RAZORPAY_BOOKING_ADVANCE_PAISE);
  return { key, secret, amount, enabled: Boolean(key && secret && Number.isSafeInteger(amount) && amount >= 100 && amount <= 100000000) };
}

export function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function equalSignature(a: string, b: string) {
  return /^[a-f0-9]{64}$/.test(a) && /^[a-f0-9]{64}$/.test(b) && timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

export async function razorpayRequest(path: string, body?: object) {
  const { key, secret, enabled } = paymentConfig();
  if (!enabled) throw new Error("Payments are not configured.");
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Payment provider unavailable.");
  return response.json();
}
