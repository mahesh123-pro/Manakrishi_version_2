"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wrench, ArrowRight, Gauge, CheckCircle2, ShieldAlert } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { TRACTORS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { fadeUp, stagger } from "@/lib/motion";

export function Machinery() {
  const t = useT();

  return (
    <Section id="machinery" className="bg-[var(--background-2)]/40">
      <GradientOrb className="right-[-6rem] top-1/4" color="green" size={480} />
      
      <SectionHeading
        eyebrow={t("machinery.eyebrow")}
        title={t("machinery.title")}
        description="Heavy-duty Indian agricultural tractors and implements for primary tillage, soil rotavation, and laser land levelling — booked on demand."
      />

      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {TRACTORS.map((tr) => (
          <motion.div
            key={tr.id}
            variants={fadeUp}
            className="group flex flex-col overflow-hidden rounded-[2rem] glass transition-all duration-300 hover:border-[var(--border-strong)] hover:shadow-lg"
          >
            {/* Image Container with 16:9 Aspect Ratio */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
              <Image
                src={`/assets/${tr.image}`}
                alt={t(tr.name)}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a07] via-[#050a07]/20 to-transparent" />
              
              {/* Badge & HP pill */}
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="rounded-full bg-emerald/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-md">
                  {t(tr.badge)}
                </span>
              </div>
              <div className="absolute right-4 top-4">
                <span className="rounded-full glass-strong px-3 py-1 text-[11px] font-mono font-bold text-gold">
                  {tr.hp}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <div className="mb-3 flex items-center gap-2 text-xs text-emerald">
                <Wrench className="h-3.5 w-3.5" />
                <span className="font-semibold uppercase tracking-wider">{t(tr.attachment)}</span>
              </div>

              <h3 className="font-heading text-xl font-bold leading-snug group-hover:text-emerald transition-colors">
                {t(tr.name)}
              </h3>

              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">
                {t(tr.description)}
              </p>

              {/* Specs Grid */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[var(--border)] py-4">
                {tr.specs.map((sp) => (
                  <div key={sp.label.en} className="flex flex-col text-center">
                    <span className="text-[10px] uppercase text-muted-2">{t(sp.label)}</span>
                    <span className="mt-0.5 text-xs font-semibold text-foreground">{sp.value}</span>
                  </div>
                ))}
              </div>

              {/* Card Footer CTA */}
              <div className="mt-6 flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <CheckCircle2 className="h-4 w-4 text-emerald" /> Verified Operator
                </span>

                <Link
                  href="/book?service=tractor"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald/15 px-4 py-2 text-xs font-semibold text-emerald transition-all duration-300 hover:bg-emerald hover:text-white"
                >
                  Book Tractor <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Notice Banner */}
      <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl glass p-6 sm:flex-row sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
            <Gauge className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold">Combined Drone & Tractor Package</p>
            <p className="text-xs text-muted">Book field preparation together with drone spraying to save up to 15% on total farm operations.</p>
          </div>
        </div>
        <Link
          href="/book?service=combined"
          className="whitespace-nowrap rounded-full bg-gradient-to-br from-green to-emerald px-6 py-2.5 text-xs font-semibold text-white shadow-md transition-transform hover:scale-[1.03]"
        >
          Book Combined Package
        </Link>
      </div>
    </Section>
  );
}
