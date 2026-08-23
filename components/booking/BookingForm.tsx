"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
  Sprout,
  Ruler,
  Navigation,
  Sparkles,
  Plane,
  Wrench,
  Layers,
  MessageCircle,
  Clock,
  IndianRupee,
  ChevronRight,
} from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { CROPS, SITE } from "@/lib/content";
import { submitBooking } from "@/lib/firebase";
import { cn } from "@/lib/utils";

type ServiceType = "drone" | "tractor" | "combined";

type Fields = {
  fullname: string;
  mobile: string;
  village: string;
  date: string;
  crop: string;
  acres: string;
  chemicalOrImplement: string;
  serviceType: ServiceType;
};

const empty: Fields = {
  fullname: "",
  mobile: "",
  village: "",
  date: "",
  crop: "",
  acres: "",
  chemicalOrImplement: "Advisor Pick",
  serviceType: "drone",
};

const cropSuggestions = [
  { en: "Paddy (వరి)", val: "Paddy" },
  { en: "Cotton (పత్తి)", val: "Cotton" },
  { en: "Chilli (మిరప)", val: "Chilli" },
  { en: "Maize (మొక్కజొన్న)", val: "Maize" },
  { en: "Sugarcane (చెరకు)", val: "Sugarcane" },
  { en: "Orchards (తోటలు)", val: "Orchards" },
];

const chemicalOptions = [
  "Advisor Pick / Free Advice",
  "Insecticide Spraying",
  "Fungicide Dosing",
  "Liquid Fertilizer / NPK",
  "Herbicides & Weed Control",
  "Own Pesticide Chemical Provided",
];

const tractorImplementOptions = [
  "Disc Plough (Deep Tillage)",
  "Rotavator (Fine Soil Prep)",
  "Laser Land Leveller",
  "Cultivator / Harrow",
  "Combined Tillage & Prep",
];

function BookingFormInner() {
  const t = useT();
  const searchParams = useSearchParams();

  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);

  // Set initial service type from URL query if present
  useEffect(() => {
    const s = searchParams?.get("service");
    if (s === "tractor" || s === "combined" || s === "drone") {
      setFields((f) => ({ ...f, serviceType: s as ServiceType }));
    }
  }, [searchParams]);

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
        serviceType: fields.serviceType,
        chemicalOrImplement: fields.chemicalOrImplement,
      });
      setDone(true);
    } catch (err) {
      console.error("Booking error:", err);
      setErrors({ mobile: "Something went wrong. Please try again or WhatsApp us directly." });
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // Handle GPS location auto-detection
  function handleDetectGPS() {
    if (!navigator.geolocation) {
      setErrors((e) => ({ ...e, village: "Geolocation is not supported by your browser." }));
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        update("village", `GPS: ${lat}° N, ${lng}° E (Field Location Detected)`);
        setGpsLoading(false);
        setGpsDetected(true);
      },
      (err) => {
        console.warn("GPS error:", err);
        setGpsLoading(false);
        setErrors((e) => ({ ...e, village: "Could not fetch GPS location. Please type village name manually." }));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Calculate real-time estimation stats based on acreage
  const parsedAcres = parseFloat(fields.acres) || 0;
  const estTimeMins = Math.round(parsedAcres * 7) || 0;
  const estCostMin = fields.serviceType === "tractor" ? parsedAcres * 900 : parsedAcres * 450;
  const estCostMax = fields.serviceType === "tractor" ? parsedAcres * 1200 : parsedAcres * 550;

  // Generate direct WhatsApp pre-filled confirmation link
  const waText = encodeURIComponent(
    `Hello Manakrishi Team!\nI just requested a booking:\n- Name: ${fields.fullname}\n- Service: ${fields.serviceType.toUpperCase()}\n- Crop: ${fields.crop}\n- Acres: ${fields.acres}\n- Village: ${fields.village}\n- Date: ${fields.date}`
  );
  const waLink = `https://wa.me/${SITE.phoneRaw}?text=${waText}`;

  return (
    <div className="relative rounded-[2.2rem] glass-strong p-6 sm:p-9 shadow-2xl border border-emerald/20">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald/10 blur-[80px]" />

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-5 py-8 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="grid h-20 w-20 place-items-center rounded-full bg-emerald/20 text-emerald shadow-[0_0_30px_rgba(74,222,128,0.4)]"
            >
              <CheckCircle2 className="h-10 w-10" />
            </motion.span>

            <h2 className="font-heading text-3xl font-bold">{t("form.success.title")}</h2>

            <div className="w-full max-w-sm rounded-2xl glass p-5 text-left text-xs space-y-2 border border-emerald/20">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-muted">Service Type</span>
                <span className="font-semibold uppercase text-emerald">{fields.serviceType}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-muted">Farmer</span>
                <span className="font-semibold text-foreground">{fields.fullname}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-muted">Location</span>
                <span className="font-semibold text-foreground truncate max-w-[180px]">{fields.village}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Crop & Acreage</span>
                <span className="font-semibold text-gold">{fields.crop} ({fields.acres} ac)</span>
              </div>
            </div>

            <p className="max-w-sm text-sm text-muted">
              Our Telangana operations team will contact you on WhatsApp to confirm your exact time slot.
            </p>

            <div className="mt-2 flex flex-col gap-3 w-full max-w-sm">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
              >
                <MessageCircle className="h-4.5 w-4.5" /> Instant WhatsApp Confirmation
              </a>

              <button
                onClick={() => {
                  setFields(empty);
                  setDone(false);
                }}
                className="rounded-full glass px-6 py-3 text-xs font-semibold text-muted hover:text-foreground transition-colors"
              >
                {t("form.success.again")}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
            noValidate
          >
            {/* Header Title */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald">
                <Sparkles className="h-3.5 w-3.5" /> Quick Booking Portal
              </span>
              <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">Book Agriculture Service</h2>
              <p className="text-xs text-muted mt-1">Select your service, fill field details and get WhatsApp slot confirmation.</p>
            </div>

            {/* Service Type Tabs Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-2">
                Select Service Required
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "drone", label: "Drone Spraying", icon: Plane, sub: "Fast precision spray" },
                  { id: "tractor", label: "Tractor Ploughing", icon: Wrench, sub: "Tillage & levelling" },
                  { id: "combined", label: "Combined Bundle", icon: Layers, sub: "Save 15% package" },
                ].map((st) => {
                  const Icon = st.icon;
                  const active = fields.serviceType === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => update("serviceType", st.id as ServiceType)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3.5 text-center transition-all duration-300",
                        active
                          ? st.id === "combined"
                            ? "service-tab-gold-active text-gold"
                            : "service-tab-active text-emerald"
                          : "border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-heading text-xs font-bold leading-tight">{st.label}</span>
                      <span className="text-[10px] text-muted-2 hidden sm:block">{st.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Form Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="fullname" className="text-xs font-medium text-foreground">
                  {t("form.name")} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
                  <input
                    id="fullname"
                    type="text"
                    value={fields.fullname}
                    onChange={(e) => update("fullname", e.target.value)}
                    placeholder="e.g. Ramesh Reddy"
                    aria-invalid={Boolean(errors.fullname)}
                    className={cn(
                      "input-glow w-full rounded-xl border bg-white/[0.03] py-3 pl-10 pr-4 text-sm outline-none",
                      errors.fullname ? "border-red-400/80" : "border-[var(--border)]"
                    )}
                  />
                </div>
                {errors.fullname && <p className="text-xs text-red-400">{errors.fullname}</p>}
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mobile" className="text-xs font-medium text-foreground">
                  {t("form.mobile")} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
                  <input
                    id="mobile"
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    value={fields.mobile}
                    onChange={(e) => update("mobile", e.target.value)}
                    placeholder="10-digit mobile number"
                    aria-invalid={Boolean(errors.mobile)}
                    className={cn(
                      "input-glow w-full rounded-xl border bg-white/[0.03] py-3 pl-10 pr-4 text-sm outline-none",
                      errors.mobile ? "border-red-400/80" : "border-[var(--border)]"
                    )}
                  />
                </div>
                {errors.mobile && <p className="text-xs text-red-400">{errors.mobile}</p>}
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="date" className="text-xs font-medium text-foreground">
                  {t("form.date")} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
                  <input
                    id="date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={fields.date}
                    onChange={(e) => update("date", e.target.value)}
                    aria-invalid={Boolean(errors.date)}
                    className={cn(
                      "input-glow w-full rounded-xl border bg-white/[0.03] py-3 pl-10 pr-4 text-sm outline-none",
                      errors.date ? "border-red-400/80" : "border-[var(--border)]"
                    )}
                  />
                </div>
                {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
              </div>

              {/* Village / Location + GPS Detector */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="village" className="text-xs font-medium text-foreground">
                    {t("form.village")} <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={gpsLoading}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald hover:underline disabled:opacity-50"
                  >
                    {gpsLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Navigation className="h-3 w-3" />
                    )}
                    {gpsDetected ? "GPS Location Set ✓" : "Detect Field GPS"}
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
                  <input
                    id="village"
                    type="text"
                    value={fields.village}
                    onChange={(e) => update("village", e.target.value)}
                    placeholder="Village, Mandal or District name"
                    aria-invalid={Boolean(errors.village)}
                    className={cn(
                      "input-glow w-full rounded-xl border bg-white/[0.03] py-3 pl-10 pr-4 text-sm outline-none",
                      errors.village ? "border-red-400/80" : "border-[var(--border)]"
                    )}
                  />
                </div>
                {errors.village && <p className="text-xs text-red-400">{errors.village}</p>}
              </div>

              {/* Crop Type + Quick Chips */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="crop" className="text-xs font-medium text-foreground">
                  {t("form.crop")} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Sprout className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
                  <input
                    id="crop"
                    type="text"
                    list="crop-options"
                    value={fields.crop}
                    onChange={(e) => update("crop", e.target.value)}
                    placeholder="Select or type your crop (e.g. Paddy, Cotton)"
                    aria-invalid={Boolean(errors.crop)}
                    className={cn(
                      "input-glow w-full rounded-xl border bg-white/[0.03] py-3 pl-10 pr-4 text-sm outline-none",
                      errors.crop ? "border-red-400/80" : "border-[var(--border)]"
                    )}
                  />
                </div>
                {errors.crop && <p className="text-xs text-red-400">{errors.crop}</p>}

                {/* Quick Crop Chips */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {cropSuggestions.map((c) => (
                    <button
                      key={c.val}
                      type="button"
                      onClick={() => update("crop", c.val)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors border",
                        fields.crop === c.val
                          ? "bg-emerald/20 border-emerald/50 text-emerald"
                          : "bg-white/[0.02] border-white/10 text-muted-2 hover:text-foreground"
                      )}
                    >
                      {c.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Acres */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="acres" className="text-xs font-medium text-foreground">
                  {t("form.acres")} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Ruler className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
                  <input
                    id="acres"
                    type="number"
                    inputMode="numeric"
                    min={0.5}
                    step={0.5}
                    value={fields.acres}
                    onChange={(e) => update("acres", e.target.value)}
                    placeholder="Total Acres (e.g. 3.5)"
                    aria-invalid={Boolean(errors.acres)}
                    className={cn(
                      "input-glow w-full rounded-xl border bg-white/[0.03] py-3 pl-10 pr-4 text-sm outline-none",
                      errors.acres ? "border-red-400/80" : "border-[var(--border)]"
                    )}
                  />
                </div>
                {errors.acres && <p className="text-xs text-red-400">{errors.acres}</p>}
              </div>

              {/* Chemical / Implement Option */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="chemicalOrImplement" className="text-xs font-medium text-foreground">
                  {fields.serviceType === "tractor" ? "Implement Attachment" : "Pesticide / Chemical Option"}
                </label>
                <select
                  id="chemicalOrImplement"
                  value={fields.chemicalOrImplement}
                  onChange={(e) => update("chemicalOrImplement", e.target.value)}
                  className="input-glow w-full rounded-xl border border-[var(--border)] bg-[#0d1611] py-3 px-3.5 text-sm outline-none text-foreground"
                >
                  {(fields.serviceType === "tractor" ? tractorImplementOptions : chemicalOptions).map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0b110d] text-foreground">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Real-time Calculation & Estimate Preview Banner */}
            {parsedAcres > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl glass p-4 border border-emerald/20 bg-emerald/5 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald" />
                  <span>Est. Time: <strong className="text-foreground">{estTimeMins} mins</strong> for {parsedAcres} ac</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4 text-gold" />
                  <span>Est. Range: <strong className="text-gold">₹{estCostMin} - ₹{estCostMax}</strong></span>
                </div>
              </motion.div>
            )}

            <datalist id="crop-options">
              {CROPS.map((c) => (
                <option key={c.image} value={c.name.en} />
              ))}
            </datalist>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-gold-400 to-gold px-8 py-4 text-sm font-bold text-[#1a1200] shadow-[0_12px_40px_-12px_rgba(255,179,0,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("form.processing")}
                </>
              ) : (
                <>
                  {t("form.submit")} <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BookingForm() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[2.2rem] glass p-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald" />
          <p className="mt-3 text-xs text-muted">Loading booking form...</p>
        </div>
      }
    >
      <BookingFormInner />
    </Suspense>
  );
}
