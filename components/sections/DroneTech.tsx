"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Droplets, Focus, Layers, Leaf, Move3d, Pause, Play, RotateCcw, Rotate3d } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { DRONE_SPECS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DroneView } from "@/components/three/DroneCanvas";

const DroneCanvas = dynamic(() => import("@/components/three/DroneCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center bg-[#edf3e6] text-xs text-green"><span className="flex items-center gap-2"><Rotate3d className="h-4 w-4 animate-spin" />Preparing the drone preview…</span></div>,
});
const features = [
  { id: "airframe", icon: Layers, en: "Built for the field", te: "పొలం కోసం నిర్మాణం", title: "Purpose-built airframe", titleTe: "వ్యవసాయం కోసం నిర్మాణం", body: "Explore the six-rotor layout, reinforced arms, landing skids and central spray tank. Drag the model to see how the parts fit together.", bodyTe: "ఆరు రోటర్లు, బలమైన భుజాలు, ల్యాండింగ్ భాగాలు మరియు స్ప్రే ట్యాంకును చూడండి. మోడల్‌ను తిప్పి భాగాలను పరిశీలించండి." },
  { id: "spray", icon: Droplets, en: "Spray system", te: "స్ప్రే వ్యవస్థ", title: "A closer look at every drop", titleTe: "ప్రతి చుక్కపై ప్రత్యేక దృష్టి", body: "Toggle the spray to see the nozzle layout and a visual mist demonstration. Actual dosage and droplet size are set by the operator for the crop and conditions.", bodyTe: "నాజిళ్లు, స్ప్రే నమూనాను చూడటానికి స్ప్రే ఆన్ చేయండి. అసలు మోతాదు మరియు చుక్క పరిమాణాన్ని పంట, పరిస్థితులకు అనుగుణంగా ఆపరేటర్ నిర్ణయిస్తారు." },
  { id: "guidance", icon: Focus, en: "Field guidance", te: "క్షేత్ర మార్గదర్శనం", title: "Planned passes. Consistent coverage.", titleTe: "ప్రణాళికాబద్ధమైన స్ప్రే మార్గాలు", body: "GPS-guided routes help the operator organise field passes. Before each job, the team checks boundaries, obstacles and weather conditions.", bodyTe: "GPS మార్గాలు పొలంలో స్ప్రేయింగ్ ప్రణాళికకు సహాయపడతాయి. పని ముందు సరిహద్దులు, అడ్డంకులు మరియు వాతావరణాన్ని బృందం పరిశీలిస్తుంది." },
] as const;

export function DroneTech() {
  const t = useT();
  const c = (en: string, te: string) => t({ en, te });
  const viewer = useRef<HTMLDivElement>(null);
  const visible = useInView(viewer, { margin: "100px" });
  const [mounted, setMounted] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const reduceMotion = useReducedMotion();
  const [playOverride, setPlayOverride] = useState<boolean | null>(null);
  const [spraying, setSpraying] = useState(true);
  const [view, setView] = useState<DroneView>("perspective");
  const [resetKey, setResetKey] = useState(0);
  const [feature, setFeature] = useState<(typeof features)[number]["id"]>("airframe");
  const [unavailable, setUnavailable] = useState(false);
  const running = playOverride ?? !reduceMotion;
  useEffect(() => { if (visible) setMounted(true); }, [visible]);
  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update(); document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const selected = features.find(item => item.id === feature)!;
  return (
    <Section id="technology">
      <SectionHeading eyebrow={t("tech.eyebrow")} title={t("tech.title")} description={c("Get closer to the technology caring for your crops. Explore the airframe, watch the rotors in motion and see the spray system at work.", "మీ పంటలను సంరక్షించే సాంకేతికతను దగ్గరగా చూడండి. డ్రోన్ నిర్మాణం, రోటర్ల కదలిక మరియు స్ప్రే వ్యవస్థను పరిశీలించండి.")} />
      <div className="mt-12 grid items-start gap-7 lg:grid-cols-[1.35fr_1fr]">
        <div ref={viewer} className="overflow-hidden rounded-[2rem] border border-green/15 bg-white shadow-[0_15px_45px_-25px_rgba(35,92,56,0.2)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green/10 px-5 py-4">
            <span className="flex items-center gap-2 text-xs font-semibold text-green"><Move3d className="h-4 w-4" />{c("Explore the agricultural drone", "వ్యవసాయ డ్రోన్‌ను పరిశీలించండి")}</span>
            <span className="rounded-full bg-green/5 px-3 py-1 text-[10px] font-medium text-muted">{c("Interactive 3D preview", "ఇంటరాక్టివ్ 3D ప్రివ్యూ")}</span>
          </div>
          <div role="group" aria-label={c("Interactive drone viewer", "ఇంటరాక్టివ్ డ్రోన్ ప్రివ్యూ")} className="drone-studio relative h-[340px] sm:h-[440px]">
            <div className="pointer-events-none absolute inset-x-8 bottom-8 h-28 rounded-[50%] border border-green/10 bg-green/[0.025]" aria-hidden />
            {mounted ? <DroneCanvas key={resetKey} running={running} spraying={spraying} active={visible && pageVisible} view={view} onUnavailable={() => setUnavailable(true)} /> : <Image src="/assets/field-drone-editorial.webp" alt="Agricultural spraying drone above green fields" fill sizes="(max-width: 1024px) 92vw, 55vw" className="object-cover" />}
            {!unavailable && <span aria-live="polite" className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-green/10 bg-white/95 px-3 py-1.5 text-[10px] font-medium text-green"><span className={cn("h-1.5 w-1.5 rounded-full", running ? "bg-green" : "bg-muted-2")} />{running ? spraying ? c("Rotors & spray demo", "రోటర్లు & స్ప్రే డెమో") : c("Hover demonstration", "హోవర్ డెమో") : c("Animation paused", "యానిమేషన్ ఆగింది")}</span>}
          </div>
          <div className="space-y-4 border-t border-green/10 bg-[#f8faf5] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2"><button type="button" disabled={unavailable} aria-pressed={Boolean(running)} onClick={() => setPlayOverride(!running)} className="drone-control bg-green text-white">{running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{running ? c("Pause", "ఆపు") : c("Play", "ప్రారంభించు")}</button><button type="button" disabled={unavailable} aria-pressed={spraying} onClick={() => setSpraying(value => !value)} className={cn("drone-control border border-green/15", spraying ? "bg-green/10 text-green" : "bg-white text-muted")}><Droplets className="h-3.5 w-3.5" />{spraying ? c("Spray on", "స్ప్రే ఆన్") : c("Spray off", "స్ప్రే ఆఫ్")}</button></div>
              <button type="button" disabled={unavailable} onClick={() => { setView("perspective"); setResetKey(key => key + 1); }} className="drone-control text-muted"><RotateCcw className="h-3.5 w-3.5" />{c("Reset view", "మళ్లీ చూడండి")}</button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3"><div role="group" aria-label={c("Viewing angle", "వీక్షణ కోణం")} className="flex gap-1 rounded-xl border border-green/10 bg-white p-1">{([{ id: "perspective", en: "3D angle", te: "3D కోణం" }, { id: "front", en: "Front", te: "ముందు" }, { id: "top", en: "Top", te: "పైన" }] as const).map(option => <button key={option.id} type="button" disabled={unavailable} aria-pressed={view === option.id} onClick={() => setView(option.id)} className={cn("rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors", view === option.id ? "bg-green/10 text-green" : "text-muted hover:bg-green/5")}>{c(option.en, option.te)}</button>)}</div><span className="flex items-center gap-1.5 text-[10px] text-muted"><Rotate3d className="h-3.5 w-3.5" />{t("tech.hint")}</span></div>
          </div>
          <p className="px-5 py-3 text-[10px] leading-5 text-muted">{c("Illustrative drone model and spray animation. Equipment and configuration vary by operator; the preview is not a flight or dosage simulation.", "ఇది నమూనా డ్రోన్ మరియు స్ప్రే యానిమేషన్. పరికరాలు ఆపరేటర్‌ను బట్టి మారుతాయి; ఇది అసలు ఫ్లైట్ లేదా మోతాదు సిమ్యులేషన్ కాదు.")}</p>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2" role="group" aria-label={c("Explore drone features", "డ్రోన్ లక్షణాలు")}>
            {features.map(item => <button key={item.id} type="button" aria-pressed={feature === item.id} aria-controls="drone-feature-detail" onClick={() => { setFeature(item.id); if (item.id === "spray") setSpraying(true); }} className={cn("inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors", feature === item.id ? "border-green bg-green/5 text-green" : "border-green/10 bg-white text-muted hover:border-green/30")}><item.icon className="h-4 w-4" />{c(item.en, item.te)}</button>)}
          </div>
          <div id="drone-feature-detail" aria-live="polite" className="my-5 rounded-2xl border border-green/10 bg-[#f3f7ed] p-6"><selected.icon className="mb-4 h-6 w-6 text-green" /><h3 className="font-heading text-2xl font-semibold">{c(selected.title, selected.titleTe)}</h3><p className="mt-3 text-sm leading-7 text-muted">{c(selected.body, selected.bodyTe)}</p></div>
          <motion.div variants={stagger(0.05)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className="grid grid-cols-2 gap-3">
            {DRONE_SPECS.map(spec => <motion.div key={spec.label.en} variants={fadeUp} className="rounded-2xl border border-green/10 bg-white p-4"><spec.icon className="mb-2 h-4 w-4 text-emerald" /><p className="text-[10px] font-medium uppercase tracking-wider text-muted">{t(spec.label)}</p><p className="mt-1 font-heading text-base font-semibold">{t(spec.value)}</p></motion.div>)}
          </motion.div>
          <Link href="/book?service=drone" className="farm-button mt-6">{t("cta.book")}<ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>
      <div className="mt-8 grid overflow-hidden rounded-[2rem] border border-green/10 bg-[#f4f8ef] md:grid-cols-[0.85fr_1.15fr]">
        <div className="relative min-h-64"><Image src="/assets/dronespraying.jpeg" alt="Agricultural drone spraying a crop field" fill sizes="(max-width: 768px) 92vw, 40vw" className="object-cover" /></div>
        <div className="p-7 sm:p-10"><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green"><Leaf className="h-4 w-4" />{c("Care that reaches every acre", "ప్రతి ఎకరానికి సంరక్షణ")}</span><h3 className="mt-4 font-heading text-2xl font-semibold sm:text-3xl">{c("Modern equipment. Practical field support.", "ఆధునిక పరికరాలు. క్షేత్ర సహాయం.")}</h3><div className="mt-5 space-y-3">{[{ en: "A trained operator coordinates your field visit.", te: "శిక్షణ పొందిన ఆపరేటర్ పొలం సందర్శనను సమన్వయం చేస్తారు." }, { en: "Crop, acreage and conditions guide the spraying plan.", te: "పంట, ఎకరాలు, పరిస్థితులను బట్టి స్ప్రే ప్రణాళిక ఉంటుంది." }, { en: "Our local team confirms the schedule with you.", te: "మా స్థానిక బృందం మీతో సమయాన్ని నిర్ధారిస్తుంది." }].map(item => <p key={item.en} className="flex items-start gap-2 text-sm leading-6 text-muted"><Check className="mt-1 h-4 w-4 shrink-0 text-green" />{c(item.en, item.te)}</p>)}</div></div>
      </div>
    </Section>
  );
}
