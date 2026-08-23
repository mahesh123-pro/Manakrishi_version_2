"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { PRECISION } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, stagger } from "@/lib/motion";

export function PrecisionFarming() {
  const t = useT();
  return (
    <Section id="precision" className="bg-[var(--background-2)]/40">
      <SectionHeading
        eyebrow={t("precision.eyebrow")}
        title={t("precision.title")}
        description="AI maps the field, plots the route and adapts the dose in real time — so every drop lands where the crop needs it and nowhere it doesn't."
      />

      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-16 grid gap-4 md:grid-cols-3 lg:grid-cols-6 lg:grid-rows-2"
      >
        {/* Feature image tile */}
        <motion.div
          variants={fadeUp}
          className="group relative col-span-1 min-h-[260px] overflow-hidden rounded-[2rem] glass md:col-span-3 lg:col-span-3 lg:row-span-2 shadow-2xl"
        >
          <Image
            src="/assets/drone-spraying-banner.png"
            alt="Photorealistic commercial spraying drone hovering and applying fine spray over green crop fields"
            fill
            sizes="(max-width: 1024px) 92vw, 45vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050a07] via-[#050a07]/40 to-transparent" />
          <div className="absolute bottom-0 p-7">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald/20 px-3 py-1 text-xs font-semibold text-emerald backdrop-blur-md">
              AI Precision Dosing
            </span>
            <p className="font-heading text-2xl font-bold sm:text-3xl">Autonomous. Accurate. Adaptive.</p>
            <p className="mt-2 max-w-md text-sm text-muted">
              Variable-rate spraying guided by GPS and AI keeps chemical dosage precise, preventing chemical burn and eliminating waste.
            </p>
          </div>
        </motion.div>

        {PRECISION.map((f) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title.en}
              variants={fadeUp}
              className="rounded-3xl glass p-6 md:col-span-1 lg:col-span-1"
            >
              <Icon className="mb-3 h-6 w-6 text-emerald" />
              <h3 className="font-heading text-base font-semibold">{t(f.title)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(f.body)}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
