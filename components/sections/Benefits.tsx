"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { BENEFITS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { fadeUp, stagger } from "@/lib/motion";

export function Benefits() {
  const t = useT();
  return (
    <Section id="benefits">
      <GradientOrb className="right-[-8rem] top-1/4" color="green" size={520} />
      <SectionHeading eyebrow={t("benefits.eyebrow")} title={t("benefits.title")} />

      <motion.div
        variants={stagger(0.06)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {BENEFITS.map((b) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.title.en}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl glass p-7"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
              <span className="mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-green to-emerald text-white">
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="font-heading text-lg font-semibold">{t(b.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(b.body)}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
