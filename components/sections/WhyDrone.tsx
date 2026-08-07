"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { WHY_PILLARS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { fadeUp, stagger } from "@/lib/motion";

export function WhyDrone() {
  const t = useT();
  return (
    <Section id="why">
      <GradientOrb className="left-1/2 top-0 -translate-x-1/2" color="gold" size={520} />
      <SectionHeading
        eyebrow={t("why.eyebrow")}
        title={t("why.title")}
        description="Manual spraying is slow, costly and dangerous. Drones change the equation on every axis that matters to a farmer."
      />
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {WHY_PILLARS.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title.en}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-3xl glass p-7"
            >
              <span className="absolute right-5 top-5 font-heading text-5xl font-bold text-white/5">
                0{i + 1}
              </span>
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-emerald/12 text-emerald transition-transform duration-500 group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="font-heading text-lg font-semibold">{t(p.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(p.body)}</p>
              <div className="mt-5 h-px w-full bg-gradient-to-r from-emerald/40 to-transparent" />
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
