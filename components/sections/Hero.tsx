"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Leaf, MapPin, Sprout } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { FarmImage } from "@/components/ui/FarmImage";

export function Hero() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 45]);
  return (
    <section ref={ref} className="farm-hero relative overflow-hidden pt-32 pb-12 sm:pt-40 lg:pb-20">
      <div className="mx-auto grid w-[90%] max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="hero-copy relative z-10 py-3 lg:py-10">
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-green/15 bg-white px-4 py-2 text-xs font-semibold text-green">
            <Sprout className="h-4 w-4" /> {t("hero.badge")}
          </span>
          <h1 className="max-w-xl font-heading text-[clamp(2.8rem,5.1vw,4.8rem)] font-semibold leading-[1.08] tracking-[-0.045em]">
            {t("hero.title.1")}<br /><span className="text-emerald">{t("hero.title.2")}</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-muted sm:text-lg">{t("hero.sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="farm-button">{t("hero.cta.book")} <ArrowUpRight className="h-4 w-4" /></Link>
            <a href="#services" className="farm-button-secondary">{t("hero.cta.services")} <ArrowDown className="h-4 w-4" /></a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-muted">
            {["hero.trust.operators", "hero.trust.booking", "hero.trust.support"].map((key) => (
              <span key={key} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald" />{t(key)}</span>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-3 border-t border-green/10 pt-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-green/10 text-green"><MapPin className="h-5 w-5" /></span>
            <div><p className="text-sm font-semibold">{t("hero.local.title")}</p><p className="mt-0.5 text-xs text-muted">{t("hero.local.sub")}</p></div>
          </div>
        </div>
        <motion.div style={{ y: reduceMotion ? 0 : imageY }} className="relative mx-auto w-full max-w-xl pb-6 lg:max-w-none">
          <div className="absolute -right-5 -top-5 h-36 w-36 rounded-full border border-green/15 sm:-right-7" aria-hidden />
          <div className="relative aspect-[1/1.08] overflow-hidden rounded-[2rem_2rem_6rem_2rem] bg-green/10">
            <FarmImage src="/assets/field-drone-editorial.webp" alt="Agricultural spraying drone working above green Indian paddy fields in the morning" priority fill sizes="(max-width: 1024px) 90vw, 48vw" imageClassName="object-[88%_center]" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-green/65 to-transparent" />
            <div className="absolute bottom-20 left-6 right-6 flex items-end justify-between gap-4 text-white sm:bottom-16 sm:left-7 sm:right-7">
              <div><p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em]">{t("hero.image.eyebrow")}</p><p className="font-heading text-xl font-medium sm:text-2xl">{t("hero.image.title")}</p></div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/40"><Sprout className="h-5 w-5" /></span>
            </div>
          </div>
          <div className="hero-field-card absolute -bottom-1 left-3 flex items-center gap-3 rounded-2xl border border-green/10 bg-white p-4 shadow-[0_12px_40px_rgba(25,65,38,0.12)] sm:-left-6 sm:px-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf5e7] text-green"><Leaf className="h-6 w-6" /></span>
            <div><p className="text-sm font-semibold">{t("hero.card.title")}</p><p className="mt-1 text-xs text-muted">{t("hero.card.sub")}</p></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
