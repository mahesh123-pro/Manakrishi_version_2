"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { STATS_VERIFIED } from "@/lib/content";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { Section } from "@/components/ui/Section";
import { fadeUp, stagger } from "@/lib/motion";

export function Stats() {
  const t = useT();
  return (
    <Section id="impact" className="py-20 sm:py-24">
      <GradientOrb className="left-[-6rem] top-0" color="green" />
      <GradientOrb className="right-[-6rem] bottom-0" color="cyan" size={420} />

      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("stats.title")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{t("stats.note")}</p>
      </div>

      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
      >
        {STATS_VERIFIED.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label.en}
              variants={fadeUp}
              className="relative flex flex-col items-center gap-3 rounded-3xl glass p-6 text-center sm:p-8"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald/12 text-emerald">
                <Icon className="h-6 w-6" />
              </span>
              <div className="font-heading text-4xl font-bold text-gradient sm:text-5xl">
                {s.prefix}
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm font-medium text-muted">{t(s.label)}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
