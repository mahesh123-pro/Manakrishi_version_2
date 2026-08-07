"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Send, ChevronDown, Cpu } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { ParticleField } from "@/components/ui/ParticleField";
import { fadeUp, stagger } from "@/lib/motion";

export function Hero() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Background media with scroll-zoom */}
      <motion.div style={{ scale, y }} className="absolute inset-0 -z-20">
        <Image
          src="/assets/dronespraying.jpeg"
          alt="Agricultural drone spraying a green field at sunrise"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050a07]/70 via-[#050a07]/55 to-[var(--background)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_120%,rgba(74,222,128,0.18),transparent_55%)]" />
      <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
      <ParticleField className="-z-10 opacity-70" color="180,240,200" density={0.7} speed={1.2} />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto flex min-h-[100svh] w-[92%] max-w-5xl flex-col items-center justify-center pt-24 text-center"
      >
        <motion.div variants={stagger(0.12, 0.3)} initial="hidden" animate="show" className="flex flex-col items-center gap-6">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald"
          >
            <Cpu className="h-3.5 w-3.5" />
            {t("hero.badge")}
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="font-heading text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl"
          >
            {t("hero.title.1")}
            <br />
            <span className="text-gradient">{t("hero.title.2")}</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="max-w-2xl text-lg text-muted sm:text-2xl">
            {t("hero.sub")}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/book"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-400 to-gold px-8 py-4 text-sm font-semibold text-[#1a1200] shadow-[0_14px_44px_-12px_rgba(255,179,0,0.7)] transition-transform hover:scale-[1.04]"
            >
              <Send className="h-4 w-4" />
              {t("hero.cta.book")}
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full glass-strong px-7 py-4 text-sm font-semibold transition-colors hover:text-emerald"
            >
              <Play className="h-4 w-4" />
              {t("hero.cta.demo")}
            </a>
            <a
              href="#technology"
              className="inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-muted transition-colors hover:text-foreground"
            >
              {t("hero.cta.tech")} →
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.a
          href="#impact"
          style={{ opacity }}
          className="absolute bottom-8 flex flex-col items-center gap-2 text-xs text-muted"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {t("hero.scroll")}
          <ChevronDown className="h-4 w-4" />
        </motion.a>
      </motion.div>
    </section>
  );
}
