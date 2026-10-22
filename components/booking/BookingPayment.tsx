"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

type CheckoutResult = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type Order = { key: string; orderId: string; amount: number; token: string };
type Checkout = { open: () => void; on: (event: string, callback: () => void) => void };
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => Checkout } }

let scriptPromise: Promise<void> | undefined;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    const timeout = window.setTimeout(() => { script.remove(); scriptPromise = undefined; reject(new Error("Checkout took too long to load. Please try again.")); }, 15000);
    script.onload = () => { clearTimeout(timeout); resolve(); };
    script.onerror = () => { clearTimeout(timeout); script.remove(); scriptPromise = undefined; reject(new Error("Could not load Razorpay. Please try again.")); };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export function BookingPayment({ bookingId, name, mobile }: { bookingId: string; name: string; mobile: string }) {
  const [config, setConfig] = useState<{ enabled: boolean; amount: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "paid" | "pending">("idle");
  const [paymentId, setPaymentId] = useState("");
  const order = useRef<Order | null>(null);
  const result = useRef<CheckoutResult | null>(null);
  const lock = useRef(false);
  useEffect(() => { fetch("/api/payments/order").then(r => r.json()).then(setConfig).catch(() => setConfig({ enabled: false, amount: 0 })); }, []);
  async function verify(details: CheckoutResult, saved: Order) {
    result.current = details;
    setPaymentId(details.razorpay_payment_id);
    const response = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...details, token: saved.token }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not verify payment. Contact our team before paying again.");
    setStatus(data.status);
    setMessage(data.status === "paid" ? "Your booking advance is received. Our team will confirm the visit and final service price." : "Your payment is awaiting confirmation. Please check its status before making another payment.");
  }
  async function start() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage("");
    try {
      if (result.current && order.current) { await verify(result.current, order.current); return; }
      await loadCheckout();
      if (!order.current) {
        const response = await fetch("/api/payments/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not start payment.");
        order.current = data;
      }
      const saved = order.current!;
      if (!window.Razorpay) throw new Error("Razorpay is unavailable. Please try again.");
      await new Promise<void>(resolve => {
        const checkout = new window.Razorpay!({
          key: saved.key, order_id: saved.orderId, amount: saved.amount, currency: "INR", name: "Manakrishi", description: "Optional farm service booking advance", image: "/assets/manakrishi-logo.png",
          prefill: { name, contact: mobile }, theme: { color: "#235c38" },
          modal: { ondismiss: () => { setMessage("Checkout closed. Your booking request is saved and you can pay later."); resolve(); } },
          handler: async (details: CheckoutResult) => { try { await verify(details, saved); } catch (error) { setMessage(error instanceof Error ? error.message : "Verification is pending. Contact our team before paying again."); } finally { resolve(); } },
        });
        checkout.on("payment.failed", () => setMessage("Payment failed. You can retry in checkout or close it and contact our team."));
        checkout.open();
      });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Checkout is unavailable. Your booking request is saved."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="mx-auto mt-7 max-w-lg rounded-2xl border border-green/15 bg-[#f3f8ee] p-5 text-left">
    <div className="flex items-center gap-2 text-sm font-semibold text-green"><CreditCard className="h-5 w-5" />{status === "paid" ? "Advance payment received" : "Pay a booking advance"}</div>
    <p className="mt-2 text-xs leading-6 text-muted">{config?.enabled ? `Optional advance: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(config.amount / 100)}. This goes towards your final service bill. Your visit still requires team confirmation.` : config === null ? "Checking online payment availability…" : "Online payments will be available soon. Our team will confirm your quote and payment options when they contact you."}</p>
    {config?.enabled && status !== "paid" && <button type="button" disabled={busy} onClick={start} className="farm-button mt-4 w-full disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}{busy ? "Please wait…" : result.current ? "Check payment status" : "Pay securely with Razorpay"}</button>}
    <p className="mt-3 break-all text-[11px] text-muted">Booking reference: {bookingId}</p>
    {paymentId && <p className="mt-1 break-all text-[11px] text-muted">Payment reference: {paymentId}</p>}
    {message && <p role="status" className="mt-3 text-xs leading-6 text-green">{message}</p>}
  </div>;
}
