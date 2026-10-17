"use client";

import { motion } from "framer-motion";
import { Plane, MapPin, TrendingUp, Users, Activity, Circle } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { DASHBOARD_BOOKINGS } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
  Spraying: "text-emerald bg-emerald/15",
  Assigned: "text-cyan bg-cyan/12",
  Completed: "text-gold bg-gold/15",
  New: "text-muted bg-green/10",
};

const kpis = [
  { icon: Activity, label: "Active Bookings", value: "18" },
  { icon: Plane, label: "Drones Deployed", value: "07" },
  { icon: Users, label: "Farmers Served", value: "142" },
  { icon: TrendingUp, label: "Acres This Week", value: "310" },
];

const bars = [40, 65, 52, 80, 72, 95, 88];

export function DashboardPreview() {
  const t = useT();
  return (
    <Section id="dashboard" className="bg-[var(--background-2)]/40">
      <SectionHeading eyebrow={t("dashboard.eyebrow")} title={t("dashboard.title")} />

      <Reveal className="mx-auto mt-14 max-w-6xl">
        <div className="overflow-hidden rounded-[1.6rem] glass-strong shadow-lg">
          {/* window chrome */}
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3.5">
            <span className="h-3 w-3 rounded-full bg-red-400/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <span className="h-3 w-3 rounded-full bg-green-400/70" />
            <span className="ml-3 flex items-center gap-2 text-xs text-muted-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
              manakrishi.in / operations
            </span>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[1.6fr_1fr]">
            {/* left column */}
            <div className="flex flex-col gap-5">
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {kpis.map((k) => {
                  const Icon = k.icon;
                  return (
                    <div key={k.label} className="rounded-2xl glass p-4">
                      <Icon className="mb-2 h-4 w-4 text-emerald" />
                      <p className="font-heading text-2xl font-bold">{k.value}</p>
                      <p className="text-[11px] text-muted-2">{k.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* chart */}
              <div className="rounded-2xl glass p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">Acres sprayed</p>
                  <p className="text-xs text-emerald">+24% this week</p>
                </div>
                <div className="flex h-32 items-end gap-2">
                  {bars.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${b}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-green to-emerald"
                    />
                  ))}
                </div>
              </div>

              {/* bookings */}
              <div className="rounded-2xl glass p-5">
                <p className="mb-3 text-sm font-semibold">Recent bookings</p>
                <div className="flex flex-col gap-2">
                  {DASHBOARD_BOOKINGS.map((b) => (
                    <div key={b.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-xl bg-green/[0.03] px-3 py-2.5 text-xs">
                      <span className="font-mono text-muted-2">{b.id}</span>
                      <span className="truncate">{b.farmer} · {b.crop}</span>
                      <span className="text-muted-2">{b.acres} ac</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", statusColor[b.status])}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* right: live map */}
            <div className="relative min-h-[280px] overflow-hidden rounded-2xl glass grid-bg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(49,118,71,0.15),transparent_60%)]" />
              <p className="absolute left-4 top-4 flex items-center gap-2 text-xs font-semibold">
                <MapPin className="h-3.5 w-3.5 text-emerald" /> Live field map
              </p>

              {/* flight path */}
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
                <motion.path
                  d="M30 150 L60 150 L60 110 L100 110 L100 70 L150 70 L150 40"
                  fill="none"
                  stroke="rgba(49,118,71,0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                />
              </svg>

              {/* moving drone */}
              <motion.span
                className="absolute grid h-7 w-7 place-items-center rounded-full bg-emerald text-white shadow-[0_0_20px_rgba(49,118,71,0.15)]"
                initial={{ offsetDistance: "0%" }}
                animate={{ left: ["15%", "75%", "75%"], top: ["75%", "35%", "20%"] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              >
                <Plane className="h-4 w-4" />
              </motion.span>

              {/* status dots */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 text-[11px] text-muted">
                <span className="flex items-center gap-2"><Circle className="h-2 w-2 fill-emerald text-emerald" /> 3 drones spraying</span>
                <span className="flex items-center gap-2"><Circle className="h-2 w-2 fill-cyan text-cyan" /> 2 en route</span>
                <span className="flex items-center gap-2"><Circle className="h-2 w-2 fill-gold text-gold" /> 2 charging</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-2">{t("dashboard.disclaimer")}</p>
      </Reveal>
    </Section>
  );
}
