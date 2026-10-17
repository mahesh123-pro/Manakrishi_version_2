"use client";

import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { MAP_POINTS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

// Stylised, decorative India silhouette (normalised to a 100×100 viewBox).
const INDIA_PATH =
  "M38 6.7 L48 10 L62 18 L72 20 L80 25 L74 33 L70 38 L66 43 L62 50 L60 58 L57 66 L55 73 L52 84 L50 93 L46 82 L44 75 L42 66 L40 60 L36 54 L32 48 L26 45 L20 43 L24 39 L26 38 L23 33 L22 32 L26 28 L30 25 L32 21 L34 17 L36 11 Z";

export function IndiaMap() {
  const t = useT();

  return (
    <Section id="map" className="bg-[var(--background-2)]/40">
      <SectionHeading eyebrow={t("map.eyebrow")} title={t("map.title")} />

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* map */}
        <div className="relative mx-auto aspect-[5/6] w-full max-w-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_55%,rgba(49,118,71,0.15),transparent_60%)]" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="india-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(49,118,71,0.15)" />
                <stop offset="100%" stopColor="rgba(49,118,71,0.12)" />
              </linearGradient>
            </defs>
            <motion.path
              d={INDIA_PATH}
              fill="url(#india-fill)"
              stroke="rgba(110,231,160,0.6)"
              strokeWidth="0.5"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.4, ease: "easeInOut" }}
            />
          </svg>

          {/* points */}
          {MAP_POINTS.map((p) => (
            <div
              key={p.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {p.status === "current" && (
                <span className="absolute inset-0 -z-10 h-3 w-3 animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full bg-emerald/50" />
              )}
              <span
                className={cn(
                  "block h-2.5 w-2.5 rounded-full ring-2 ring-[var(--background)]",
                  p.status === "current" ? "bg-emerald shadow-[0_0_12px_rgba(49,118,71,0.15)]" : "bg-cyan/70"
                )}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium text-muted">
                {p.name}
              </span>
            </div>
          ))}

          {/* flying drone */}
          <motion.span
            className="absolute grid h-8 w-8 place-items-center rounded-full bg-emerald text-white shadow-[0_0_20px_rgba(49,118,71,0.15)]"
            animate={{ left: ["47%", "53%", "45%", "47%"], top: ["62%", "58%", "55%", "62%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{ translateX: "-50%", translateY: "-50%" }}
          >
            <Plane className="h-4 w-4" />
          </motion.span>
        </div>

        {/* legend / copy */}
        <div className="flex flex-col gap-6">
          <p className="text-lg leading-relaxed text-muted">
            Manakrishi is operating across <span className="text-foreground">Telangana</span> today —
            and mapping a route to serve farmers across India.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-2xl glass px-5 py-4">
              <span className="h-3 w-3 rounded-full bg-emerald shadow-[0_0_10px_rgba(49,118,71,0.15)]" />
              <div>
                <p className="text-sm font-semibold">{t("map.current")}</p>
                <p className="text-xs text-muted">Hyderabad · Warangal · Khammam · Nizamabad</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl glass px-5 py-4">
              <span className="h-3 w-3 rounded-full bg-cyan/70" />
              <div>
                <p className="text-sm font-semibold">{t("map.future")}</p>
                <p className="text-xs text-muted">Andhra Pradesh · Karnataka · Maharashtra</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
