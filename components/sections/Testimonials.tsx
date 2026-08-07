"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { TESTIMONIALS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, stagger } from "@/lib/motion";

export function Testimonials() {
  const t = useT();
  return (
    <Section id="testimonials">
      <SectionHeading eyebrow={t("testimonials.eyebrow")} title={t("testimonials.title")} />

      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-16 grid gap-5 md:grid-cols-3"
      >
        {TESTIMONIALS.map((tm) => (
          <motion.figure
            key={tm.name}
            variants={fadeUp}
            className="flex flex-col gap-5 rounded-3xl glass p-7"
          >
            <Quote className="h-8 w-8 text-emerald/60" />
            <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
              &ldquo;{t(tm.quote)}&rdquo;
            </blockquote>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
            <figcaption className="flex items-center gap-3 border-t border-[var(--border)] pt-5">
              <div className="relative h-11 w-11 overflow-hidden rounded-full">
                <Image src={`/assets/${tm.image}`} alt={tm.name} fill sizes="44px" className="object-cover" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold">{tm.name}</p>
                <p className="text-xs text-muted">{tm.place}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </Section>
  );
}
