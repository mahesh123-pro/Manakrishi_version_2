"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { STEPS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 65%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.3 });

  return (
    <Section id="how-it-works">
      <SectionHeading
        eyebrow={t("how.eyebrow")}
        title={t("how.title")}
        description="A seamless journey from a tap on your phone to a healthier, protected harvest."
      />

      <div ref={ref} className="relative mx-auto mt-16 max-w-4xl">
        {/* track */}
        <div className="absolute left-6 top-0 h-full w-px bg-[var(--border)] md:left-1/2 md:-translate-x-1/2" />
        <motion.div
          style={{ scaleY: fill }}
          className="absolute left-6 top-0 h-full w-px origin-top bg-gradient-to-b from-emerald via-cyan to-gold md:left-1/2 md:-translate-x-1/2"
        />

        <div className="flex flex-col gap-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const left = i % 2 === 0;
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "relative flex items-center gap-6 pl-16 md:w-1/2 md:pl-0",
                  left ? "md:self-start md:pr-12 md:text-right" : "md:self-end md:pl-12"
                )}
              >
                {/* node */}
                <span
                  className={cn(
                    "absolute left-6 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full bg-emerald ring-4 ring-[var(--background)] md:left-auto",
                    left ? "md:right-[-2.6rem] md:translate-x-1/2" : "md:left-[-2.6rem] md:-translate-x-1/2"
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-[#06120b]" />
                </span>

                <div
                  className={cn(
                    "flex-1 rounded-3xl glass p-6",
                    left ? "md:items-end" : ""
                  )}
                >
                  <div className={cn("mb-3 flex items-center gap-3", left ? "md:flex-row-reverse" : "")}>
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald/12 text-emerald">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-heading text-3xl font-bold text-white/10">{s.n}</span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{t(s.title)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(s.body)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
