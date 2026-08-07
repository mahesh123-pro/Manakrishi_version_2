"use client";

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
        <div className="relative order-1 h-[360px] overflow-hidden rounded-[2rem] glass sm:h-[440px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,188,212,0.14),transparent_60%)]" />
          <DroneCanvas />
          <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted">
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
                className="rounded-2xl glass p-5 transition-colors hover:border-[var(--border-strong)]"
              >
                <Icon className="mb-3 h-5 w-5 text-emerald" />
                <p className="text-xs uppercase tracking-wide text-muted-2">{t(spec.label)}</p>
                <p className="mt-1 font-heading text-lg font-semibold">{t(spec.value)}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}
