"use client";

import { Suspense, useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Leaf, Loader2, MapPin, MessageCircle, Minus, Navigation, Phone, Plane, Plus, ShieldCheck, Sparkles, Sprout, Tractor, Layers, Sunrise, Sunset, type LucideIcon } from "lucide-react";
import { useLanguage, useT } from "@/lib/i18n/context";
import { CROPS, SITE } from "@/lib/content";
import { INITIAL_BOOKING, bookingDate, bookingEstimate, bookingPayload, validBookingDate, type BookingFields, type ServiceType } from "@/lib/booking";
import { submitBooking } from "@/lib/firebase";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<keyof BookingFields, string>>;
const SERVICES: { id: ServiceType; en: string; te: string; sub: string; subTe: string; image: string; icon: LucideIcon }[] = [
  { id: "drone", en: "Drone spraying", te: "డ్రోన్ స్ప్రేయింగ్", sub: "Precision care for your crops", subTe: "మీ పంటలకు కచ్చితమైన సంరక్షణ", image: "field-drone-editorial.webp", icon: Plane },
  { id: "tractor", en: "Tractor & tillage", te: "ట్రాక్టర్ & దుక్కి", sub: "Prepare your field for the season", subTe: "పంట కోసం పొలాన్ని సిద్ధం చేయండి", image: "tractor-ploughing.png", icon: Tractor },
  { id: "combined", en: "Drone + tractor", te: "డ్రోన్ + ట్రాక్టర్", sub: "Plan both services together", subTe: "రెండు సేవలను కలిపి బుక్ చేయండి", image: "hero-drone-farmland.png", icon: Layers },
];
const CHEMICALS = [
  { value: "Advisor Pick / Free Advice", en: "Help me choose", te: "సలహా కావాలి", sub: "Discuss with a crop advisor", subTe: "పంట సలహాదారుతో చర్చించండి" },
  { value: "Insecticide Spraying", en: "Insecticide", te: "పురుగుమందు", sub: "Pest management", subTe: "పురుగుల నియంత్రణ" },
  { value: "Fungicide Dosing", en: "Fungicide", te: "శిలీంద్రనాశిని", sub: "Fungal disease control", subTe: "శిలీంద్ర వ్యాధుల నియంత్రణ" },
  { value: "Liquid Fertilizer / NPK", en: "Liquid nutrients", te: "ద్రవ ఎరువులు", sub: "Fertilizer application", subTe: "ఎరువుల పిచికారీ" },
  { value: "Herbicides & Weed Control", en: "Weed control", te: "కలుపు నియంత్రణ", sub: "Subject to crop suitability", subTe: "పంట అనుకూలతను బట్టి" },
  { value: "Own Pesticide Chemical Provided", en: "I have the chemical", te: "మందు నా వద్ద ఉంది", sub: "Team verifies suitability", subTe: "బృందం అనుకూలతను పరిశీలిస్తుంది" },
];
const IMPLEMENTS = [
  { value: "Disc Plough (Deep Tillage)", en: "Disc plough", te: "డిస్క్ దున్నడం" },
  { value: "Rotavator (Fine Soil Prep)", en: "Rotavator", te: "రోటావేటర్" },
  { value: "Laser Land Leveller", en: "Land leveller", te: "భూమి చదును" },
  { value: "Cultivator / Harrow", en: "Cultivator / harrow", te: "కల్టివేటర్ / హారో" },
  { value: "Combined Tillage & Prep", en: "Help me plan field prep", te: "భూమి తయారీకి సలహా కావాలి" },
];

function Choice({ selected, children, onClick, className }: { selected: boolean; children: ReactNode; onClick: () => void; className?: string }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={cn("booking-choice", selected && "is-selected", className)}>{children}{selected && <Check className="ml-auto h-4 w-4 shrink-0 text-green" aria-hidden />}</button>;
}
function ErrorMessage({ id, children }: { id: string; children?: string }) {
  return children ? <p id={id} className="mt-2 text-xs font-medium text-red-700">{children}</p> : null;
}
function InputField({ label, error, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; id: string }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold">{label}</label><input {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="booking-input" /><ErrorMessage id={`${id}-error`}>{error}</ErrorMessage></div>;
}

function BookingFormInner() {
  const t = useT();
  const { locale } = useLanguage();
  const c = (en: string, te: string) => t({ en, te });
  const searchParams = useSearchParams();
  const [fields, setFields] = useState<BookingFields>({ ...INITIAL_BOOKING });
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [customCrop, setCustomCrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [today, setToday] = useState(() => bookingDate());
  const submitLock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const wizard = useRef<HTMLDivElement>(null);
  const serviceQuery = searchParams.get("service");

  useEffect(() => {
    if (serviceQuery === "drone" || serviceQuery === "tractor" || serviceQuery === "combined") setFields(f => ({ ...f, serviceType: serviceQuery }));
  }, [serviceQuery]);
  useEffect(() => {
    const updateDate = () => setToday(bookingDate());
    window.addEventListener("focus", updateDate);
    return () => window.removeEventListener("focus", updateDate);
  }, []);
  function update<K extends keyof BookingFields>(key: K, value: BookingFields[K]) {
    setFields(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
    setSubmissionError("");
  }
  function moveTo(next: number) {
    setStep(next);
    setFurthest(f => Math.max(f, next));
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      if (wizard.current && wizard.current.getBoundingClientRect().top < 100) wizard.current.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }
  function validate(section: number): Errors {
    const e: Errors = {};
    if (section === 0) {
      if (!fields.crop.trim()) e.crop = t("form.err.crop");
      if (!Number.isFinite(Number(fields.acres)) || Number(fields.acres) < 0.5) e.acres = t("form.err.acres");
    }
    if (section === 1) {
      if (!validBookingDate(fields.date)) e.date = c("Choose today or a future date.", "నేటి లేదా భవిష్యత్ తేదీని ఎంచుకోండి.");
      if (!fields.village.trim()) e.village = t("form.err.village");
    }
    if (section === 2) {
      if (!fields.fullname.trim()) e.fullname = t("form.err.name");
      if (!/^[6-9]\d{9}$/.test(fields.mobile.trim())) e.mobile = t("form.err.mobile");
    }
    return e;
  }
  function nextStep() {
    const e = validate(step); setErrors(e);
    if (!Object.keys(e).length) moveTo(step + 1);
  }
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (step < 2) { nextStep(); return; }
    if (submitLock.current) return;
    for (let section = 0; section < 3; section++) {
      const e = validate(section);
      if (Object.keys(e).length) { setErrors(e); moveTo(section); return; }
    }
    submitLock.current = true; setLoading(true); setSubmissionError("");
    try {
      await submitBooking(bookingPayload(fields)); setDone(true);
      requestAnimationFrame(() => { wizard.current?.scrollIntoView({ block: "start" }); heading.current?.focus({ preventScroll: true }); });
    } catch (error) {
      console.error("Booking error:", error);
      setSubmissionError(c("We couldn’t send your request. Your details are still here — try again or contact us on WhatsApp.", "మీ అభ్యర్థన పంపలేకపోయాము. వివరాలు ఇక్కడే ఉన్నాయి — మళ్లీ ప్రయత్నించండి లేదా వాట్సాప్‌లో సంప్రదించండి."));
    } finally { submitLock.current = false; setLoading(false); }
  }
  function detectGPS() {
    if (!navigator.geolocation) { setErrors(e => ({ ...e, village: c("GPS is unavailable. Please enter your village.", "GPS అందుబాటులో లేదు. మీ గ్రామాన్ని నమోదు చేయండి.") })); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(position => {
      update("village", `GPS: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`); setGpsLoading(false);
    }, () => {
      setGpsLoading(false); setErrors(e => ({ ...e, village: c("Couldn’t detect your location. Type your village instead.", "ప్రాంతాన్ని గుర్తించలేకపోయాము. మీ గ్రామాన్ని నమోదు చేయండి.") }));
    }, { timeout: 10000, enableHighAccuracy: true });
  }
  const service = SERVICES.find(s => s.id === fields.serviceType)!;
  const estimate = bookingEstimate(fields.serviceType, fields.acres);
  const currency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
  const dateLabel = fields.date && validBookingDate(fields.date, "0000-01-01") ? new Date(`${fields.date}T12:00:00`).toLocaleDateString(locale === "te" ? "te-IN" : "en-IN", { day: "numeric", month: "short" }) : c("Choose a date", "తేదీ ఎంచుకోండి");
  const steps = [c("Service & field", "సేవ & పొలం"), c("Plan your visit", "సందర్శన వివరాలు"), c("Review & request", "సమీక్ష & అభ్యర్థన")];
  const titles = [c("What does your field need?", "మీ పొలానికి ఏ సేవ కావాలి?"), c("Let’s plan the field visit.", "పొలం సందర్శనను ప్లాన్ చేద్దాం."), c("A few details, and you’re ready.", "కొన్ని వివరాలతో సిద్ధం అవ్వండి.")];
  const waMessage = `Hello Manakrishi! ${done ? "I submitted a booking request." : "I need help planning a booking."}\nService: ${service.en}\nCrop: ${fields.crop}\nAcres: ${fields.acres}\nDate: ${fields.date}\nPreferred time: ${fields.preferredTime}\nLocation: ${fields.village}\nName: ${fields.fullname}\nMobile: ${fields.mobile}\nOptions: ${bookingPayload(fields).chemicalOrImplement}\nContact: ${fields.contactPreference}\nNotes: ${fields.notes}`;
  const waLink = `${SITE.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div ref={wizard} className="booking-workspace grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]">
      <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-green/15 bg-white shadow-[0_12px_50px_-30px_rgba(35,92,56,0.25)]">
        {done ? (
          <div className="px-6 py-12 text-center sm:px-12">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-green/10 text-green"><CheckCircle2 className="h-10 w-10" /></motion.div>
            <h2 ref={heading} tabIndex={-1} className="font-heading text-3xl font-semibold">{c("Your request is in!", "మీ అభ్యర్థన అందింది!")}</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">{c("Our team will contact you to confirm availability, pricing, and your visit. Your preferred date and time are requests until confirmed.", "అందుబాటు, ధర మరియు సందర్శనను నిర్ధారించడానికి మా బృందం సంప్రదిస్తుంది. తేదీ, సమయం నిర్ధారణకు లోబడి ఉంటాయి.")}</p>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="farm-button mt-7"><MessageCircle className="h-4 w-4" />{c("Discuss on WhatsApp", "వాట్సాప్‌లో మాట్లాడండి")}</a>
            <button type="button" onClick={() => { setFields({ ...INITIAL_BOOKING, serviceType: service.id }); setDone(false); setErrors({}); setCustomCrop(false); setStep(0); setFurthest(0); }} className="mx-auto mt-5 block text-sm font-semibold text-green underline underline-offset-4">{t("form.success.again")}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
            <fieldset disabled={loading} className="min-w-0">
              <nav aria-label={c("Booking steps", "బుకింగ్ దశలు")} className="grid grid-cols-3 gap-2 border-b border-green/10 bg-[#f8faf5] p-4 sm:px-7 sm:py-5">
                {steps.map((label, index) => <button key={index} type="button" disabled={index > furthest} onClick={() => moveTo(index)} aria-current={step === index ? "step" : undefined} className={cn("flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition-colors sm:text-sm", step === index ? "bg-white text-green shadow-sm ring-1 ring-green/15" : "text-muted disabled:opacity-50")}><span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs", index <= step ? "bg-green text-white" : "bg-green/10 text-green")}>{index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span>{label}</span></button>)}
              </nav>
              <div className="p-5 sm:p-8">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald">{c(`Step ${step + 1} of 3`, `దశ ${step + 1} / 3`)}</p>
                <h2 ref={heading} tabIndex={-1} className="font-heading text-2xl font-semibold tracking-tight outline-none sm:text-3xl">{titles[step]}</h2>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-7 space-y-7">
                    {step === 0 && <>
                      <fieldset><legend className="booking-label">{c("Choose your service", "మీ సేవను ఎంచుకోండి")}</legend><div className="grid gap-3 sm:grid-cols-3">
                        {SERVICES.map(option => <button key={option.id} type="button" aria-pressed={fields.serviceType === option.id} onClick={() => update("serviceType", option.id)} className={cn("booking-service group overflow-hidden rounded-2xl border text-left transition-all", fields.serviceType === option.id && "is-selected")}>
                          <div className="relative aspect-[16/9] overflow-hidden"><Image src={`/assets/${option.image}`} alt="" fill sizes="(max-width: 640px) 85vw, 230px" className="object-cover transition-transform duration-500 group-hover:scale-105" /><span className={cn("absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full border", fields.serviceType === option.id ? "border-green bg-green text-white" : "border-white/80 bg-white/90")}>{fields.serviceType === option.id && <Check className="h-3.5 w-3.5" />}</span></div>
                          <div className="p-3"><span className="flex items-center gap-1.5 text-sm font-semibold"><option.icon className="h-4 w-4 shrink-0 text-green" />{c(option.en, option.te)}</span><span className="mt-1.5 block text-[11px] leading-5 text-muted">{c(option.sub, option.subTe)}</span></div>
                        </button>)}
                      </div></fieldset>
                      <fieldset aria-describedby={errors.crop ? "crop-error" : undefined}><legend className="booking-label">{c("What are you growing?", "మీ పంట ఏమిటి?")} <span className="text-red-700">*</span></legend><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {CROPS.map(crop => <button key={crop.name.en} type="button" aria-pressed={!customCrop && fields.crop === crop.name.en} onClick={() => { setCustomCrop(false); update("crop", crop.name.en); }} className={cn("booking-crop rounded-xl border p-2 text-center transition-all", !customCrop && fields.crop === crop.name.en && "is-selected")}><div className="relative mx-auto mb-2 aspect-square w-full max-w-16 overflow-hidden rounded-lg"><Image src={`/assets/${crop.image}`} alt="" fill sizes="64px" className="object-cover" /></div><span className="text-[11px] font-semibold">{t(crop.name)}</span></button>)}
                      </div><button type="button" aria-expanded={customCrop} onClick={() => { setCustomCrop(!customCrop); update("crop", ""); }} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-green"><Plus className="h-3.5 w-3.5" />{c("Another crop", "ఇతర పంట")}</button>{customCrop && <div className="mt-3"><InputField id="crop" label={c("Crop name", "పంట పేరు")} value={fields.crop} onChange={e => update("crop", e.target.value)} maxLength={80} placeholder={c("e.g. Groundnut", "ఉదా. వేరుశెనగ")} /></div>}<ErrorMessage id="crop-error">{errors.crop}</ErrorMessage></fieldset>
                      <fieldset><legend className="booking-label">{t("form.acres")} <span className="text-red-700">*</span></legend><div className="flex flex-wrap items-center gap-4"><div className="flex items-center overflow-hidden rounded-xl border border-green/20"><button type="button" aria-label={c("Decrease acreage", "ఎకరాలు తగ్గించండి")} onClick={() => update("acres", String(Math.max(0.5, Math.round(((Number(fields.acres) || 0.5) - 0.5) * 100) / 100)))} disabled={Number(fields.acres) <= 0.5} className="grid h-12 w-12 place-items-center text-green transition-colors hover:bg-green/10 disabled:opacity-30"><Minus className="h-4 w-4" /></button><input id="acres" aria-label={t("form.acres")} aria-invalid={Boolean(errors.acres)} aria-describedby={errors.acres ? "acres-error" : undefined} type="number" inputMode="decimal" min="0.5" step="0.5" value={fields.acres} onChange={e => update("acres", e.target.value)} className="h-12 w-20 border-x border-green/10 text-center text-base font-semibold outline-none" /><button type="button" aria-label={c("Increase acreage", "ఎకరాలు పెంచండి")} onClick={() => update("acres", String(Math.round(((Number(fields.acres) || 0) + 0.5) * 100) / 100))} className="grid h-12 w-12 place-items-center text-green transition-colors hover:bg-green/10"><Plus className="h-4 w-4" /></button></div><span className="text-xs text-muted">{c("Minimum 0.5 acre · use the buttons or type", "కనీసం 0.5 ఎకరం · బటన్లు వాడండి లేదా నమోదు చేయండి")}</span></div><div className="mt-3 flex flex-wrap gap-2">{[1, 2, 5, 10, 20].map(area => <Choice key={area} selected={Number(fields.acres) === area} onClick={() => update("acres", String(area))}>{area} {c("ac", "ఎకరాలు")}</Choice>)}</div><ErrorMessage id="acres-error">{errors.acres}</ErrorMessage></fieldset>
                    </>}
                    {step === 1 && <>
                      {fields.serviceType !== "tractor" && <fieldset><legend className="booking-label">{c("Spray preference", "స్ప్రే ఎంపిక")}</legend><div className="grid gap-2 sm:grid-cols-2">{CHEMICALS.map(option => <Choice key={option.value} selected={fields.chemical === option.value} onClick={() => update("chemical", option.value)} className="text-left"><span><span className="block">{c(option.en, option.te)}</span><span className="mt-1 block text-[11px] font-normal text-muted">{c(option.sub, option.subTe)}</span></span></Choice>)}</div><p className="mt-2 text-[11px] leading-5 text-muted">{c("The team will verify crop suitability and dosage before spraying.", "స్ప్రేయింగ్ ముందు పంట అనుకూలత మరియు మోతాదును బృందం పరిశీలిస్తుంది.")}</p></fieldset>}
                      {fields.serviceType !== "drone" && <fieldset><legend className="booking-label">{c("Choose an implement", "పరికరం ఎంచుకోండి")}</legend><div className="flex flex-wrap gap-2">{IMPLEMENTS.map(option => <Choice key={option.value} selected={fields.implement === option.value} onClick={() => update("implement", option.value)}>{c(option.en, option.te)}</Choice>)}</div></fieldset>}
                      <div className="grid gap-5 sm:grid-cols-2"><div><InputField id="date" label={`${t("form.date")} *`} type="date" min={today} value={fields.date} onChange={e => update("date", e.target.value)} error={errors.date} /><div className="mt-2 flex flex-wrap gap-2">{[{ days: 1, en: "Tomorrow", te: "రేపు" }, { days: 2, en: "In 2 days", te: "2 రోజుల్లో" }, { days: 7, en: "Next week", te: "వచ్చే వారం" }].map(option => <Choice key={option.days} selected={fields.date === bookingDate(option.days)} onClick={() => update("date", bookingDate(option.days))}>{c(option.en, option.te)}</Choice>)}</div></div><fieldset><legend className="booking-label">{c("Preferred time", "ఇష్టమైన సమయం")}</legend><div className="flex flex-wrap gap-2">{[{ value: "Any time", en: "Flexible", te: "ఏ సమయమైనా", icon: Clock3 }, { value: "Morning", en: "Morning", te: "ఉదయం", icon: Sunrise }, { value: "Afternoon", en: "Afternoon", te: "మధ్యాహ్నం", icon: Sunset }].map(option => <Choice key={option.value} selected={fields.preferredTime === option.value} onClick={() => update("preferredTime", option.value)}><option.icon className="h-4 w-4" />{c(option.en, option.te)}</Choice>)}</div><p className="mt-3 text-[11px] leading-5 text-muted">{c("Timing depends on weather and operator availability.", "సమయం వాతావరణం మరియు ఆపరేటర్ అందుబాటుపై ఆధారపడి ఉంటుంది.")}</p></fieldset></div>
                      <div><InputField id="village" label={`${t("form.village")} *`} value={fields.village} onChange={e => update("village", e.target.value)} error={errors.village} maxLength={250} autoComplete="address-level2" placeholder={c("Village, mandal and district", "గ్రామం, మండలం, జిల్లా")} /><button type="button" disabled={gpsLoading} onClick={detectGPS} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-green/5 px-3 text-xs font-semibold text-green disabled:opacity-50">{gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}{c("Use my current location", "నా ప్రస్తుత ప్రాంతాన్ని వాడండి")}</button><p className="mt-2 text-[11px] text-muted">{c("Use GPS only when you’re at your field.", "మీ పొలం వద్ద ఉన్నప్పుడు మాత్రమే GPS వాడండి.")}</p></div>
                    </>}
                    {step === 2 && <>
                      <div className="rounded-2xl border border-green/15 bg-[#f6f9f1] p-5"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-green" />{c("Your field plan", "మీ పొలం ప్రణాళిక")}</h3><button type="button" onClick={() => moveTo(0)} className="text-xs font-semibold text-green underline underline-offset-4">{c("Edit", "మార్చండి")}</button></div><p className="text-sm font-semibold">{c(service.en, service.te)} · {fields.crop} · {fields.acres} {c("acres", "ఎకరాలు")}</p><p className="mt-2 text-xs leading-6 text-muted">{bookingPayload(fields).chemicalOrImplement}<br />{dateLabel} · {fields.preferredTime} · {fields.village}</p></div>
                      <div className="grid gap-5 sm:grid-cols-2"><InputField id="fullname" label={`${t("form.name")} *`} value={fields.fullname} onChange={e => update("fullname", e.target.value)} error={errors.fullname} autoComplete="name" maxLength={100} placeholder={c("Your full name", "మీ పూర్తి పేరు")} /><InputField id="mobile" label={`${t("form.mobile")} *`} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={fields.mobile} onChange={e => update("mobile", e.target.value.replace(/\D/g, ""))} error={errors.mobile} placeholder="10-digit mobile" /></div>
                      <fieldset><legend className="booking-label">{c("How should we contact you?", "మిమ్మల్ని ఎలా సంప్రదించాలి?")}</legend><div className="flex gap-3">{[{ value: "WhatsApp", icon: MessageCircle, en: "WhatsApp", te: "వాట్సాప్" }, { value: "Phone call", icon: Phone, en: "Phone call", te: "ఫోన్ కాల్" }].map(option => <Choice key={option.value} selected={fields.contactPreference === option.value} onClick={() => update("contactPreference", option.value)}><option.icon className="h-4 w-4" />{c(option.en, option.te)}</Choice>)}</div></fieldset>
                      <div><label htmlFor="notes" className="booking-label">{c("Anything we should know?", "మేము తెలుసుకోవాల్సిన వివరాలు?")} <span className="font-normal text-muted">{c("(optional)", "(ఐచ్ఛికం)")}</span></label><textarea id="notes" rows={3} maxLength={1000} value={fields.notes} onChange={e => update("notes", e.target.value)} className="booking-input resize-y" placeholder={c("Field access, nearby landmarks, crop concerns…", "పొలం దారి, సమీప గుర్తులు, పంట సమస్యలు…")} /><p className="mt-1 text-right text-[10px] text-muted">{fields.notes.length}/1000</p></div>
                      <p className="text-xs leading-6 text-muted">{c("Submitting sends a service request. Our team confirms the final quote and schedule. Your details are used to coordinate your visit.", "ఇది సేవ అభ్యర్థన మాత్రమే. తుది ధర మరియు సమయాన్ని మా బృందం నిర్ధారిస్తుంది. మీ వివరాలు సందర్శన సమన్వయానికి ఉపయోగిస్తాము.")} <Link href="/privacy-policy" className="text-green underline">{t("footer.privacy")}</Link></p>
                    </>}
                  </motion.div>
                </AnimatePresence>
                {Object.values(errors).some(Boolean) && <p role="alert" className="mt-5 text-xs font-medium text-red-700">{c("Please check the highlighted details above.", "పైన సూచించిన వివరాలను సరిచూడండి.")}</p>}
                {submissionError && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{submissionError}<a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-2 block font-semibold underline">{c("Contact us on WhatsApp", "వాట్సాప్‌లో సంప్రదించండి")}</a></div>}
                <div className="mt-8 flex items-center justify-between gap-3 border-t border-green/10 pt-6">
                  {step > 0 ? <button type="button" onClick={() => moveTo(step - 1)} className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-semibold text-muted"><ArrowLeft className="h-4 w-4" />{c("Back", "వెనుకకు")}</button> : <span className="flex items-center gap-1.5 text-[11px] text-muted"><ShieldCheck className="h-4 w-4 text-green" />{c("No online payment", "ఆన్‌లైన్ చెల్లింపు లేదు")}</span>}
                  <button type="submit" className="farm-button min-w-36 disabled:opacity-60">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("form.processing")}</> : <>{step === 2 ? c("Send booking request", "బుకింగ్ అభ్యర్థన పంపండి") : c("Continue", "కొనసాగించండి")}<ArrowRight className="h-4 w-4" /></>}</button>
                </div>
              </div>
            </fieldset>
          </form>
        )}
      </div>
      <aside className="space-y-4 lg:sticky lg:top-28" aria-label={c("Booking summary", "బుకింగ్ సారాంశం")}>
        <div className="overflow-hidden rounded-[1.75rem] border border-green/15 bg-white">
          <div className="relative aspect-[16/8] overflow-hidden"><Image key={service.image} src={`/assets/${service.image}`} alt={c(service.en, service.te)} fill sizes="(max-width: 1024px) 90vw, 370px" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-forest/85 to-transparent" /><span className="absolute bottom-4 left-5 flex items-center gap-2 text-xs font-semibold text-white"><Leaf className="h-4 w-4" />{c("Made for your field", "మీ పొలం కోసం")}</span></div>
          <div className="p-5 sm:p-6"><div className="flex items-center justify-between"><h3 className="font-heading text-xl font-semibold">{done ? c("Request summary", "అభ్యర్థన సారాంశం") : c("Your booking", "మీ బుకింగ్")}</h3><Sparkles className="h-4 w-4 text-emerald" /></div><p className="mt-1 text-xs text-muted">{c("A little planning. A healthier field.", "చిన్న ప్రణాళిక. ఆరోగ్యమైన పొలం.")}</p>
            <dl className="my-5 space-y-4 text-xs">{[{ icon: service.icon, label: c("Service", "సేవ"), value: c(service.en, service.te) }, { icon: Sprout, label: c("Crop & area", "పంట & విస్తీర్ణం"), value: `${fields.crop || c("Choose a crop", "పంట ఎంచుకోండి")} · ${fields.acres || "—"} ac` }, { icon: CalendarDays, label: c("Preferred visit", "ఇష్టమైన సందర్శన"), value: fields.date ? `${dateLabel} · ${fields.preferredTime === "Any time" ? c("Flexible", "ఏ సమయమైనా") : fields.preferredTime === "Morning" ? c("Morning", "ఉదయం") : c("Afternoon", "మధ్యాహ్నం")}` : dateLabel }, { icon: MapPin, label: c("Location", "ప్రాంతం"), value: fields.village || c("Add your village", "మీ గ్రామం చేర్చండి") }].map(row => <div key={row.label} className="flex gap-3"><row.icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald" /><div className="min-w-0"><dt className="text-muted">{row.label}</dt><dd className="mt-1 break-words font-semibold leading-5">{row.value}</dd></div></div>)}</dl>
            <div className="rounded-2xl bg-[#edf4e6] p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{c("Indicative service estimate", "అంచనా సేవా ధర")}</p><p aria-live="polite" className="mt-2 font-heading text-2xl font-semibold text-green">{estimate ? `${currency(estimate.min)} – ${currency(estimate.max)}` : c("Quote from our team", "మా బృందం ధర తెలియజేస్తుంది")}</p><p className="mt-2 text-[11px] leading-5 text-muted">{c("Final price depends on field conditions, selected options and availability. This is not a confirmed quote.", "తుది ధర పొలం పరిస్థితులు, ఎంపికలు మరియు అందుబాటుపై ఆధారపడి ఉంటుంది. ఇది నిర్ధారిత ధర కాదు.")}</p></div>
            {step > 0 && !done && <button type="button" disabled={loading} onClick={() => moveTo(0)} className="mt-4 flex items-center gap-1 text-xs font-semibold text-green">{c("Change service or acreage", "సేవ లేదా ఎకరాలు మార్చండి")}<ChevronRight className="h-3.5 w-3.5" /></button>}
          </div>
        </div>
        <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-green/15 bg-[#f4f8ee] p-4 transition-colors hover:bg-green/10"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-green"><MessageCircle className="h-5 w-5" /></span><span><span className="block text-sm font-semibold">{c("Prefer a little help?", "సహాయం కావాలా?")}</span><span className="mt-1 block text-xs text-muted">{c("Talk to our local team", "మా స్థానిక బృందంతో మాట్లాడండి")}</span></span><ArrowRight className="ml-auto h-4 w-4 shrink-0 text-green" /></a>
      </aside>
    </div>
  );
}

export function BookingForm() {
  return <Suspense fallback={<div className="grid min-h-80 place-items-center rounded-3xl border border-green/15 bg-white"><Loader2 className="h-8 w-8 animate-spin text-green" aria-label="Loading booking form" /></div>}><BookingFormInner /></Suspense>;
}
