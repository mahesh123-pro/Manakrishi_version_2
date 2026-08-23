"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Rotate3d } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { DRONE_SPECS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { fadeUp, stagger } from "@/lib/motion";

const DroneCanvas = dynamic(() => import("@/components/three/DroneCanvas"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="h-10 w-10 animate-spin-slow rounded-full border-2 border-emerald/30 border-t-emerald" />
        <span className="text-xs">Loading 3D drone…</span>
      </div>
    </div>
  ),
});

export function DroneTech() {
  const t = useT();
  return (
    <Section id="technology">
      <GradientOrb className="left-[-6rem] top-1/3" color="cyan" size={520} />
      <SectionHeading
        eyebrow={t("tech.eyebrow")}
        title={t("tech.title")}
        description="Purpose-built agricultural drones with centimetre-level GPS, obstacle avoidance and AI route planning — engineered for the realities of the Indian field."
      />

      <div className="mt-16 grid items-center gap-8 lg:grid-cols-2">
        {/* 3D viewer */}
        <div className="relative order-1 h-[360px] overflow-hidden rounded-[2rem] glass sm:h-[440px] shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,188,212,0.14),transparent_60%)]" />
          <DroneCanvas />
          <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted backdrop-blur-md">
            <Rotate3d className="h-3.5 w-3.5" /> {t("tech.hint")}
          </span>
        </div>

        {/* specs */}
        <motion.div
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="order-2 grid grid-cols-2 gap-4"
        >
          {DRONE_SPECS.map((spec) => {
            const Icon = spec.icon;
            return (
              <motion.div
                key={spec.label.en}
                variants={fadeUp}
                className="rounded-2xl glass p-5 transition-colors hover:border-[var(--border-strong)] hover:shadow-lg"
              >
                <Icon className="mb-3 h-5 w-5 text-emerald" />
                <p className="text-xs uppercase tracking-wide text-muted-2">{t(spec.label)}</p>
                <p className="mt-1 font-heading text-lg font-semibold">{t(spec.value)}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Precision Drone Spraying Feature Highlight */}
      <div className="mt-12 overflow-hidden rounded-[2rem] glass p-6 sm:p-8 lg:p-10 border border-emerald/20 bg-gradient-to-r from-emerald/10 via-transparent to-transparent">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald">
              Precision Drone Spraying
            </span>
            <h3 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
              High-Precision Crop Spraying for Every Indian Farm
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Our commercial agricultural drones deliver uniform coverage across tall and dense crops where tractor or manual sprayers cannot reach.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { title: "Faster field coverage", sub: "1 acre completed in ~7 minutes" },
                { title: "Uniform spraying", sub: "Ultra-fine atomised mist penetrates canopy" },
                { title: "Reduced crop damage", sub: "Zero soil compaction and zero trampling" },
                { title: "Efficient pesticide application", sub: "Cut chemical usage by up to 30%" },
                { title: "Location-based service booking", sub: "GPS field mapping & route dispatch" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-2.5 rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald/20 text-emerald text-xs">✓</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-2">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl glass lg:col-span-5 shadow-xl">
            <Image
              src="/assets/about-real-drone.png"
              alt="High precision spraying drone in action"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a07]/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl glass-strong p-3 text-xs">
              <p className="font-semibold text-emerald">Certified Operators & Fleet</p>
              <p className="text-[11px] text-muted">DGCA-registered drones with calibrated dosage valves.</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
