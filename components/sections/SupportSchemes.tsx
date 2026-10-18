"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Landmark, Check } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { fadeUp, stagger } from "@/lib/motion";

export function SupportSchemes() {
  const t = useT();
  return (
    <Section id="schemes" className="bg-[var(--background-2)]/40">
      <GradientOrb className="right-[-6rem] top-10" color="gold" />
      <SectionHeading eyebrow={t("schemes.eyebrow")} title={t("schemes.title")} />

      <motion.div
        variants={stagger(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-16 grid gap-6 lg:grid-cols-2"
      >
        {/* Insurance */}
        <motion.div variants={fadeUp} className="group overflow-hidden rounded-[2rem] glass transition-all duration-300 hover:shadow-lg hover:border-[var(--border-strong)]">
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src="/assets/farmer-family-insurance.webp"
              alt="Indian farming family discussing insurance paperwork with a support advisor"
              fill
              sizes="(max-width: 1024px) 92vw, 45vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/15 to-transparent" />
            <span className="absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-2xl glass-strong text-gold shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="p-7">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="font-heading text-xl font-semibold">Secure Your Future</h3>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-gold">₹399 / Year</span>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Comprehensive coverage with the Post Office Insurance Scheme — accessible, affordable and
              reliable protection for you and your family.
            </p>
          </div>
        </motion.div>

        {/* Government schemes */}
        <motion.div variants={fadeUp} className="group overflow-hidden rounded-[2rem] glass transition-all duration-300 hover:shadow-lg hover:border-[var(--border-strong)]">
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src="/assets/farmer-scheme-assistance.webp"
              alt="Farmer receiving help with scheme application paperwork at a rural support office"
              fill
              sizes="(max-width: 1024px) 92vw, 45vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/15 to-transparent" />
            <span className="absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-2xl glass-strong text-emerald shadow-md">
              <Landmark className="h-5 w-5" />
            </span>
          </div>
          <div className="p-7">
            <h3 className="mb-3 font-heading text-xl font-semibold">Unlock Government Benefits</h3>
            <p className="text-sm leading-relaxed text-muted">
              We help you navigate and apply for essential government schemes to maximise your benefits:
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {["PM-Kisan", "Soil Health Cards", "Crop Insurance"].map((s) => (
                <li
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald"
                >
                  <Check className="h-3.5 w-3.5" /> {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
