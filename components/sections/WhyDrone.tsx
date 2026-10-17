"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { WHY_PILLARS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { fadeUp, stagger } from "@/lib/motion";
import { FarmImage } from "@/components/ui/FarmImage";

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
      <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-80 overflow-hidden rounded-3xl">
          <FarmImage src="/assets/dronespraying.jpeg" alt="Close view of an agricultural drone spraying a fine mist above a green field" sizes="(max-width: 1024px) 92vw, 42vw" fill />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/90 via-transparent to-transparent" />
          <div className="absolute bottom-7 left-7 right-7 text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-white/80">{t("field.photo.eyebrow")}</p>
            <p className="mt-2 max-w-xs font-heading text-2xl font-semibold">{t("field.photo.title")}</p>
          </div>
        </div>
        <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-5 sm:grid-cols-2"
      >
        {WHY_PILLARS.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title.en}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-3xl glass p-7"
            >
              <span className="absolute right-5 top-5 font-heading text-5xl font-bold text-green/10">
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
      </div>
    </Section>
  );
}
