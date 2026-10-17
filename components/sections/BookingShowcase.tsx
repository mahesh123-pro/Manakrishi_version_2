"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, Sprout, MapPin, SprayCan, CheckCircle2, Send, Signal, BatteryFull, Wifi } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { cn } from "@/lib/utils";

const phoneSteps = [
  { icon: LogIn, title: "Your Details", body: "Share your name and mobile number so our team can reach you." },
  { icon: Sprout, title: "Choose Crop", body: "Pick paddy, cotton, chilli, maize and more." },
  { icon: MapPin, title: "Capture Location", body: "Share your village & field to map the route." },
  { icon: SprayCan, title: "Select Pesticide", body: "Choose your chemical or get an advisor pick." },
  { icon: CheckCircle2, title: "Book Drone", body: "Confirm — we reach out on WhatsApp to schedule." },
];

export function BookingShowcase() {
  const t = useT();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % phoneSteps.length), 2600);
    return () => clearInterval(id);
  }, []);

  const Step = phoneSteps[active];
  const Icon = Step.icon;

  return (
    <Section id="booking">
      <GradientOrb className="left-[-6rem] top-1/4" color="gold" />
      <div className="grid items-center gap-14 lg:grid-cols-2">
        {/* copy */}
        <div>
          <SectionHeading
            align="left"
            eyebrow={t("booking.eyebrow")}
            title={t("booking.title")}
            description="A mobile-first flow designed for farmers — bilingual, simple, and fast. No app store, no jargon."
          />
          <ul className="mt-8 flex flex-col gap-3">
            {phoneSteps.map((s, i) => {
              const SIcon = s.icon;
              return (
                <li key={s.title}>
                  <button
                    onClick={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all",
                      active === i
                        ? "glass-strong border-[var(--border-strong)]"
                        : "border-transparent hover:glass"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
                        active === i ? "bg-emerald text-white" : "bg-green/5 text-muted"
                      )}
                    >
                      <SIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-heading text-sm font-semibold">
                        Step {i + 1} · {s.title}
                      </p>
                      <p className="text-xs text-muted">{s.body}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link
            href="/book"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-green to-emerald px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(35,92,56,0.16)] transition-transform hover:scale-[1.03]"
          >
            <Send className="h-4 w-4" /> {t("cta.book")}
          </Link>
        </div>

        {/* phone */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 -z-10 mx-auto h-[70%] w-[70%] self-center rounded-full bg-emerald/15 blur-[90px]" />
          <div className="relative h-[560px] w-[280px] rounded-[2.6rem] border border-green/15 bg-[#e6eddf] p-3 shadow-lg">
            {/* notch */}
            <div className="absolute left-1/2 top-3 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-black/70" />
            <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-white to-[#f1f6ed]">
              {/* status bar */}
              <div className="flex items-center justify-between px-6 pt-4 text-[10px] text-muted">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <Signal className="h-3 w-3" /> <Wifi className="h-3 w-3" /> <BatteryFull className="h-3 w-3" />
                </div>
              </div>

              {/* app header */}
              <div className="px-6 pt-6">
                <p className="font-heading text-lg font-bold">
                  Mana<span className="text-emerald">krishi</span>
                </p>
                <p className="text-[11px] text-muted">Book drone spraying</p>
              </div>

              {/* progress dots */}
              <div className="mt-5 flex justify-center gap-1.5">
                {phoneSteps.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === active ? "w-6 bg-emerald" : "w-1.5 bg-green/15"
                    )}
                  />
                ))}
              </div>

              {/* step card */}
              <div className="px-6 pt-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-3xl glass p-6"
                  >
                    <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-green to-emerald text-white">
                      <Icon className="h-7 w-7" />
                    </span>
                    <p className="font-heading text-xl font-bold">{Step.title}</p>
                    <p className="mt-2 text-sm text-muted">{Step.body}</p>
                    <div className="mt-6 rounded-full bg-green py-3 text-center text-sm font-semibold text-white">
                      {active === phoneSteps.length - 1 ? "Confirm Booking" : "Continue"}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
