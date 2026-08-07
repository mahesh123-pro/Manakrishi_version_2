"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, User, Phone, MapPin, Calendar, Sprout, Ruler } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { CROPS } from "@/lib/content";
import { submitBooking } from "@/lib/firebase";

type Fields = {
  fullname: string;
  mobile: string;
  village: string;
  date: string;
  crop: string;
  acres: string;
};

const empty: Fields = { fullname: "", mobile: "", village: "", date: "", crop: "", acres: "" };

export function BookingForm() {
  const t = useT();
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): boolean {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!fields.fullname.trim()) e.fullname = t("form.err.name");
    if (!/^[6-9][0-9]{9}$/.test(fields.mobile.trim())) e.mobile = t("form.err.mobile");
    if (!fields.village.trim()) e.village = t("form.err.village");
    if (!fields.date) e.date = t("form.err.date");
    if (!fields.crop.trim()) e.crop = t("form.err.crop");
    const acres = parseFloat(fields.acres);
    if (!fields.acres.trim() || isNaN(acres) || acres < 0.5) e.acres = t("form.err.acres");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitBooking({
        fullname: fields.fullname.trim(),
        mobile: fields.mobile.trim(),
        village: fields.village.trim(),
        date: fields.date,
        crop: fields.crop.trim(),
        acres: fields.acres.trim(),
      });
      setDone(true);
    } catch (err) {
      console.error("Booking error:", err);
      setErrors({ mobile: "Something went wrong. Please try again or WhatsApp us." });
    } finally {
      setLoading(false);
    }
  }

  function update(key: keyof Fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  const inputs: {
    key: keyof Fields;
    label: string;
    icon: typeof User;
    type?: string;
    placeholder?: string;
    inputMode?: "tel" | "numeric" | "text";
    list?: boolean;
    min?: number;
    step?: number;
    full?: boolean;
  }[] = [
    { key: "fullname", label: t("form.name"), icon: User, placeholder: "e.g. Ramesh Reddy", full: true },
    { key: "mobile", label: t("form.mobile"), icon: Phone, inputMode: "tel", placeholder: "10-digit mobile" },
    { key: "village", label: t("form.village"), icon: MapPin, placeholder: "Village / mandal" },
    { key: "date", label: t("form.date"), icon: Calendar, type: "date" },
    { key: "crop", label: t("form.crop"), icon: Sprout, placeholder: "e.g. Paddy, Cotton, Chilli", list: true },
    { key: "acres", label: t("form.acres"), icon: Ruler, type: "number", inputMode: "numeric", min: 0.5, step: 0.5, placeholder: "e.g. 2.5" },
  ];

  return (
    <div className="relative rounded-[2rem] glass-strong p-6 sm:p-9">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5 py-10 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="grid h-20 w-20 place-items-center rounded-full bg-emerald/15 text-emerald"
            >
              <CheckCircle2 className="h-10 w-10" />
            </motion.span>
            <h2 className="font-heading text-2xl font-bold">{t("form.success.title")}</h2>
            <p className="max-w-sm text-sm text-muted">{t("form.success.body")}</p>
            <button
              onClick={() => {
                setFields(empty);
                setDone(false);
              }}
              className="mt-2 rounded-full bg-gradient-to-br from-green to-emerald px-6 py-3 text-sm font-semibold text-[#06120b]"
            >
              {t("form.success.again")}
            </button>
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
            <div className="grid gap-5 sm:grid-cols-2">
              {inputs.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.key} className={`flex flex-col gap-2 ${f.full ? "sm:col-span-2" : ""}`}>
                    <label htmlFor={f.key} className="text-sm font-medium">
                      {f.label}
                    </label>
                    <div className="relative">
                      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
                      <input
                        id={f.key}
                        type={f.type ?? "text"}
                        inputMode={f.inputMode}
                        min={f.min}
                        step={f.step}
                        list={f.list ? "crop-options" : undefined}
                        value={fields[f.key]}
                        onChange={(e) => update(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        aria-invalid={Boolean(errors[f.key])}
                        className={`w-full rounded-xl border bg-white/[0.03] py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-emerald ${
                          errors[f.key] ? "border-red-400/70" : "border-[var(--border)]"
                        }`}
                      />
                    </div>
                    {errors[f.key] && <p className="text-xs text-red-400">{errors[f.key]}</p>}
                  </div>
                );
              })}
            </div>

            <datalist id="crop-options">
              {CROPS.map((c) => (
                <option key={c.image} value={c.name.en} />
              ))}
            </datalist>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-gold-400 to-gold px-8 py-4 text-sm font-semibold text-[#1a1200] shadow-[0_12px_40px_-12px_rgba(255,179,0,0.6)] transition-transform hover:scale-[1.02] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("form.processing")}
                </>
              ) : (
                t("form.submit")
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
