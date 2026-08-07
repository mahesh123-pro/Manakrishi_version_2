"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { ROADMAP } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Marquee } from "@/components/ui/Marquee";

export function Roadmap() {
  const t = useT();
  return (
    <Section id="roadmap">
      <SectionHeading eyebrow={t("roadmap.eyebrow")} title={t("roadmap.title")} />

      {/* Desktop: horizontal timeline */}
      <div className="mt-16 hidden lg:block">
        <div className="relative">
          <div className="absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-emerald via-cyan to-gold" />
          <div className="grid grid-cols-5 gap-4">
            {ROADMAP.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.div
                  key={r.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <span className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl glass-strong text-emerald">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="mt-5 font-heading text-2xl font-bold text-gradient">{r.year}</span>
                  <p className="mt-2 font-heading text-sm font-semibold">{t(r.title)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{t(r.body)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: marquee cards */}
      <div className="mt-14 lg:hidden">
        <Marquee>
          {ROADMAP.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.year} className="w-64 shrink-0 rounded-3xl glass p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald/12 text-emerald">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-heading text-xl font-bold text-gradient">{r.year}</span>
                </div>
                <p className="font-heading text-sm font-semibold">{t(r.title)}</p>
                <p className="mt-1 text-xs text-muted">{t(r.body)}</p>
              </div>
            );
          })}
        </Marquee>
      </div>
    </Section>
  );
}
