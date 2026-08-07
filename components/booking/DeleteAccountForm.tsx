"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, User, Phone } from "lucide-react";
import { submitDeletionRequest } from "@/lib/firebase";

const REASONS = [
  { value: "", label: "Select a reason" },
  { value: "no_longer_using", label: "No longer using the service" },
  { value: "privacy", label: "Privacy concerns" },
  { value: "duplicate", label: "Duplicate account" },
  { value: "other", label: "Other" },
];

export function DeleteAccountForm() {
  const [fullname, setFullname] = useState("");
  const [mobile, setMobile] = useState("");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!fullname.trim()) e.fullname = "Please enter your name";
    if (!/^[6-9][0-9]{9}$/.test(mobile.trim())) e.mobile = "Enter a valid 10-digit mobile number";
    if (!reason) e.reason = "Please select a reason";
    if (reason === "other" && !otherReason.trim()) e.otherReason = "Please tell us the reason";
    if (!confirm) e.confirm = "Please confirm you want your data deleted";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitDeletionRequest({
        fullname: fullname.trim(),
        mobile: mobile.trim(),
        reason,
        otherReason: reason === "other" ? otherReason.trim() : "",
      });
      setDone(true);
    } catch (err) {
      console.error("Deletion request error:", err);
      setErrors({ mobile: "Something went wrong. Please try again or WhatsApp us." });
    } finally {
      setLoading(false);
    }
  }

  const fieldCls = (bad?: string) =>
    `w-full rounded-xl border bg-white/[0.03] py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-emerald ${
      bad ? "border-red-400/70" : "border-[var(--border)]"
    }`;

  return (
    <div className="relative rounded-[2rem] glass-strong p-6 sm:p-9">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5 py-8 text-center"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-emerald/15 text-emerald">
              <CheckCircle2 className="h-10 w-10" />
            </span>
            <h2 className="font-heading text-2xl font-bold">Request received</h2>
            <p className="max-w-sm text-sm text-muted">
              We&rsquo;ve logged your deletion request. Our team will process it and confirm on WhatsApp
              within a few business days.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-5"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="d-name" className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
                <input
                  id="d-name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Name used for your bookings"
                  className={fieldCls(errors.fullname)}
                />
              </div>
              {errors.fullname && <p className="text-xs text-red-400">{errors.fullname}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="d-mobile" className="text-sm font-medium">Mobile Number</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
                <input
                  id="d-mobile"
                  inputMode="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Registered 10-digit mobile"
                  className={fieldCls(errors.mobile)}
                />
              </div>
              {errors.mobile && <p className="text-xs text-red-400">{errors.mobile}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="d-reason" className="text-sm font-medium">Reason for deletion</label>
              <select
                id="d-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors focus:border-emerald ${
                  errors.reason ? "border-red-400/70" : "border-[var(--border)]"
                }`}
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-[#0f1a13]">
                    {r.label}
                  </option>
                ))}
              </select>
              {errors.reason && <p className="text-xs text-red-400">{errors.reason}</p>}
            </div>

            {reason === "other" && (
              <div className="flex flex-col gap-2">
                <label htmlFor="d-other" className="text-sm font-medium">Tell us more</label>
                <textarea
                  id="d-other"
                  rows={3}
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className={`w-full resize-none rounded-xl border bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors focus:border-emerald ${
                    errors.otherReason ? "border-red-400/70" : "border-[var(--border)]"
                  }`}
                />
                {errors.otherReason && <p className="text-xs text-red-400">{errors.otherReason}</p>}
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-white/[0.02] p-4">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-emerald"
              />
              <span className="text-xs leading-relaxed text-muted">
                I understand this will permanently delete my personal data and booking history from
                Manakrishi, and this action cannot be undone.
              </span>
            </label>
            {errors.confirm && <p className="-mt-2 text-xs text-red-400">{errors.confirm}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-red-500/90 to-orange-500/90 px-8 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                "Submit Deletion Request"
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
