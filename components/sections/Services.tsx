"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";
import { SERVICES, type ServiceStatus } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

const badge: Record<ServiceStatus, { label: string; cls: string }> = {
  live: { label: "Live", cls: "bg-emerald/15 text-emerald" },
  soon: { label: "Coming Soon", cls: "bg-gold/15 text-gold" },
  future: { label: "On the Roadmap", cls: "bg-cyan/12 text-cyan" },
};

export function Services() {
  const t = useT();
  return (
    <Section id="services">
      <SectionHeading
        eyebrow={t("services.eyebrow")}
        title={t("services.title")}
        description="Drone spraying is live today. The rest of the platform is being built to cover the entire crop lifecycle."
      />

      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {SERVICES.map((s) => {
          const Icon = s.icon;
          const b = badge[s.status];
          return (
            <motion.div
              key={s.title.en}
              variants={fadeUp}
              className={cn(
                "group relative flex flex-col gap-3 overflow-hidden rounded-3xl glass p-6",
                s.status === "live" && "ring-1 ring-emerald/25"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-green/40 to-emerald/20 text-emerald transition-transform duration-500 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>
                <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", b.cls)}>
                  {b.label}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold">{t(s.title)}</h3>
              <p className="text-sm leading-relaxed text-muted">{t(s.body)}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
