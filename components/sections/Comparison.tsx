"use client";

import { motion } from "framer-motion";
import { Hand, Plane } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { COMPARE_ROWS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, stagger } from "@/lib/motion";

function Bar({ score, tone }: { score: number; tone: "manual" | "drone" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${score}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={
          tone === "drone"
            ? "h-full rounded-full bg-gradient-to-r from-green to-emerald"
            : "h-full rounded-full bg-gradient-to-r from-red-500/70 to-orange-400/70"
        }
      />
    </div>
  );
}

export function Comparison() {
  const t = useT();
  return (
    <Section id="comparison" className="bg-[var(--background-2)]/40">
      <SectionHeading eyebrow={t("compare.eyebrow")} title={t("compare.title")} />

      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-3xl glass"
      >
        {/* header */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr] items-center gap-4 border-b border-[var(--border)] px-5 py-5 sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-2">Metric</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-orange-300">
            <Hand className="h-4 w-4" /> {t("compare.manual")}
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold text-emerald">
            <Plane className="h-4 w-4" /> {t("compare.drone")}
          </span>
        </div>

        {COMPARE_ROWS.map((row) => (
          <motion.div
            key={row.metric.en}
            variants={fadeUp}
            className="grid grid-cols-[1.2fr_1fr_1fr] items-center gap-4 border-b border-[var(--border)] px-5 py-5 last:border-0 sm:px-8"
          >
            <span className="font-heading text-sm font-semibold sm:text-base">{t(row.metric)}</span>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted">{t(row.manual)}</span>
              <Bar score={row.manualScore} tone="manual" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-foreground">{t(row.drone)}</span>
              <Bar score={row.droneScore} tone="drone" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
