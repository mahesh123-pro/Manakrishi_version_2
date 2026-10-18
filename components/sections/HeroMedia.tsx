"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Film, Pause, Play } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const scenes = [
  { src: "/assets/home-drone-flight.webp", en: "Precision in flight", te: "కచ్చితమైన డ్రోన్ స్ప్రే", alt: "Agricultural drone spraying over green paddy fields at sunrise", position: "62% center", video: false },
  { src: "/assets/home-drone-operator.webp", en: "People behind the precision", te: "సాంకేతికత వెనుక మనుషులు", alt: "Drone operator checking equipment beside a paddy field", position: "50% center", video: false },
  { src: "/assets/field-drone-editorial.webp", en: "Care for every acre", te: "ప్రతి ఎకరానికి సంరక్షణ", alt: "Spraying drone above a wide green field in morning light", position: "78% center", video: false },
  { src: "/assets/home-drone-flight.webp", en: "The field story · Photo reel", te: "క్షేత్ర కథ · ఫోటో రీల్", alt: "Animated photographic reel of agricultural drone scenes", position: "center", video: true },
];

export function HeroMedia({ children }: { children: ReactNode }) {
  const t = useT();
  const c = (en: string, te: string) => t({ en, te });
  const [scene, setScene] = useState(0);
  const [playOverride, setPlayOverride] = useState<boolean | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [focused, setFocused] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const reduceMotion = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const inView = useInView(media, { amount: 0.1 });
  const playing = playOverride ?? (reduceMotion === false);
  const active = playing && inView && pageVisible && !focused;
  const current = scenes[scene];
  const advance = () => setScene(value => (value + 1) % scenes.length);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update(); document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!active) return;
    // Photos linger for nine seconds; a video advances on end, with a timeout for blocked playback.
    const timer = window.setTimeout(() => setScene(value => (value + 1) % scenes.length), current.video && !videoError ? 20000 : 9000);
    return () => window.clearTimeout(timer);
  }, [scene, active, current.video, videoError]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (active && current.video && !videoError) element.play().catch(() => { /* Keep the poster visible if autoplay is blocked. */ });
    else element.pause();
  }, [active, scene, current.video, videoError]);

  function choose(index: number) { setScene(index); setVideoError(false); }
  return <div ref={media} className="fullscreen-hero-media relative" role="region" aria-roledescription="carousel" aria-label={c("Farm photographs and video slideshow", "వ్యవసాయ ఫోటోలు మరియు వీడియో స్లైడ్‌షో")}>
    <div className="absolute inset-0 overflow-hidden" aria-live="off">
      <AnimatePresence initial={false} mode="sync">
        <motion.div key={scene} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 1.8, ease: "easeInOut" }} className="absolute inset-0" role="group" aria-roledescription="slide" aria-label={`${scene + 1} / ${scenes.length}: ${c(current.en, current.te)}`}>
          {current.video && !videoError ? <video ref={video} muted playsInline preload="metadata" poster={current.src} className="absolute inset-0 h-full w-full object-cover" aria-label={c("Fifteen-second illustrative drone photo reel", "పదిహేను సెకన్ల నమూనా డ్రోన్ ఫోటో రీల్")} onEnded={advance} onError={() => setVideoError(true)}><source src="/videos/manakrishi-field-reel.mp4" type="video/mp4" /></video> : <div className={cn("absolute inset-0", !reduceMotion && "hero-slow-zoom")} style={{ animationPlayState: active ? "running" : "paused" }}><Image src={current.src} alt={current.alt} fill priority={scene === 0} sizes="100vw" className="object-cover" style={{ objectPosition: current.position }} /></div>}
        </motion.div>
      </AnimatePresence>
    </div>
    <div className="fullscreen-hero-shade pointer-events-none absolute inset-0" />
    {children}
    <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/15 bg-[#10291b]/25 backdrop-blur-sm">
      <div className="mx-auto flex w-[92%] max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4 pr-16 sm:py-5" onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
        <div className="min-w-0 text-white"><p className="mb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-white/65">{c("From the field", "క్షేత్రం నుండి")} · {String(scene + 1).padStart(2, "0")} / 04</p><p className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">{current.video && <Film className="h-3.5 w-3.5" />}{c(current.en, current.te)}</p></div>
        <div className="flex items-center gap-3 sm:gap-5">
          <div role="group" aria-label={c("Choose a slide", "స్లైడ్ ఎంచుకోండి")} className="flex gap-1.5">{scenes.map((item, index) => <button key={index} type="button" aria-label={c(`Show ${item.en}`, `${item.te} చూపించు`)} aria-pressed={scene === index} onClick={() => choose(index)} className="grid h-10 w-8 place-items-center rounded-lg focus-visible:outline-white"><span className={cn("h-1 rounded-full transition-all duration-500", scene === index ? "w-7 bg-white" : "w-3 bg-white/40")} /></button>)}</div>
          <div className="flex gap-1.5"><button type="button" onClick={() => choose((scene + scenes.length - 1) % scenes.length)} className="hero-media-control" aria-label={c("Previous slide", "మునుపటి స్లైడ్")}><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-pressed={!playing} onClick={() => { setFocused(false); setPlayOverride(!playing); }} className="hero-media-control" aria-label={playing ? c("Pause slideshow", "స్లైడ్‌షో ఆపు") : c("Play slideshow", "స్లైడ్‌షో ప్రారంభించు")}>{playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</button><button type="button" onClick={() => choose((scene + 1) % scenes.length)} className="hero-media-control" aria-label={c("Next slide", "తదుపరి స్లైడ్")}><ChevronRight className="h-4 w-4" /></button></div>
        </div>
      </div>
    </div>
  </div>;
}
