"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Target, Eye } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { ABOUT_HIGHLIGHTS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { fadeUp, stagger } from "@/lib/motion";

export function About() {
  const t = useT();

  return (
    <Section id="about">
      <GradientOrb className="right-[-8rem] top-10" color="green" />
      <SectionHeading
        eyebrow={t("about.eyebrow")}
        title={t("about.title")}
        description="Manakrishi helps farmers spray pesticides faster, safer, cheaper and more accurately with autonomous agricultural drones — booked through a simple digital experience."
      />

      <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
        {/* Image */}
        <Reveal className="relative order-2 lg:order-1">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] glass shadow-lg">
            <Image
              src="/assets/about-real-drone.png"
              alt="High resolution realistic agricultural hexacopter spraying drone operating in Indian farmland"
              fill
              sizes="(max-width: 1024px) 92vw, 45vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a07]/70 via-transparent to-transparent" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute -bottom-6 -right-4 max-w-[15rem] rounded-2xl glass-strong p-5 shadow-xl"
          >
            <p className="font-heading text-sm font-semibold text-emerald">
              &ldquo;The drone listens, the farm responds.&rdquo;
            </p>
          </motion.div>
        </Reveal>

        {/* Mission / Vision */}
        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="order-1 flex flex-col gap-6 lg:order-2"
        >
          <motion.div variants={fadeUp} className="rounded-3xl glass p-7">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald/12 text-emerald">
                <Target className="h-5 w-5" />
              </span>
              <h3 className="font-heading text-xl font-semibold">Our Mission</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Empowering every farmer with modern drone technology — reducing chemical exposure,
              increasing productivity, saving water and time, and making precision farming affordable.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-3xl glass p-7">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/12 text-cyan">
                <Eye className="h-5 w-5" />
              </span>
              <h3 className="font-heading text-xl font-semibold">Our Vision</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              To become India&rsquo;s largest AI-powered drone agriculture platform, serving millions of
              farmers across the country.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Highlights */}
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-20 grid gap-5 md:grid-cols-3"
      >
        {ABOUT_HIGHLIGHTS.map((h) => {
          const Icon = h.icon;
          return (
            <motion.div key={h.title.en} variants={fadeUp}>
              <GlassCard className="h-full">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-green to-emerald text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-heading text-lg font-semibold">{t(h.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(h.body)}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
