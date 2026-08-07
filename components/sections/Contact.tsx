"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { SITE } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GradientOrb } from "@/components/ui/GradientOrb";
import { Reveal } from "@/components/ui/Reveal";

export function Contact() {
  const t = useT();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = `Hello Manakrishi! I'm ${form.name || "a farmer"} (${form.phone}). ${form.message}`;
    window.open(`${SITE.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <Section id="contact">
      <GradientOrb className="left-1/2 top-0 -translate-x-1/2" color="green" size={560} />

      {/* CTA banner */}
      <Reveal className="mb-16">
        <div className="relative overflow-hidden rounded-[2rem] glass-strong p-10 text-center sm:p-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,179,0,0.14),transparent_60%)]" />
          <h2 className="font-heading text-3xl font-bold sm:text-5xl">
            Ready to <span className="text-gradient-gold">transform your farm?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Book precision drone spraying in minutes. Our team will confirm your slot on WhatsApp.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-400 to-gold px-8 py-4 text-sm font-semibold text-[#1a1200] shadow-[0_14px_44px_-12px_rgba(255,179,0,0.7)] transition-transform hover:scale-[1.04]"
            >
              <Send className="h-4 w-4" /> {t("cta.book")}
            </a>
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold text-whatsapp ring-1 ring-whatsapp/40 transition-colors hover:bg-whatsapp/10"
            >
              <MessageCircle className="h-4 w-4" /> {t("cta.whatsapp")}
            </a>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* details */}
        <div>
          <SectionHeading align="left" eyebrow={t("contact.eyebrow")} title={t("contact.title")} />
          <div className="mt-8 flex flex-col gap-4">
            {[
              { icon: Phone, label: SITE.phone, sub: "Call / WhatsApp", href: SITE.whatsapp },
              { icon: Mail, label: SITE.email, sub: "Email us", href: `mailto:${SITE.email}` },
              { icon: MapPin, label: SITE.address, sub: "Visit us", href: undefined },
            ].map((c) => {
              const Icon = c.icon;
              const inner = (
                <div className="flex items-center gap-4 rounded-2xl glass px-5 py-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald/12 text-emerald">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-2">{c.sub}</p>
                    <p className="text-sm font-medium">{c.label}</p>
                  </div>
                </div>
              );
              return c.href ? (
                <a key={c.sub} href={c.href} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <div key={c.sub}>{inner}</div>
              );
            })}
          </div>
        </div>

        {/* form */}
        <Reveal>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl glass p-7">
            <div className="flex flex-col gap-2">
              <label htmlFor="c-name" className="text-sm font-medium">Name</label>
              <input
                id="c-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border border-[var(--border)] bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors focus:border-emerald"
                placeholder="Your name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="c-phone" className="text-sm font-medium">Mobile</label>
              <input
                id="c-phone"
                required
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-xl border border-[var(--border)] bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors focus:border-emerald"
                placeholder="10-digit mobile"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="c-msg" className="text-sm font-medium">Message</label>
              <textarea
                id="c-msg"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="resize-none rounded-xl border border-[var(--border)] bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors focus:border-emerald"
                placeholder="Tell us about your crop and field size…"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-green to-emerald px-6 py-3.5 text-sm font-semibold text-[#06120b] transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="h-4 w-4" /> Send via WhatsApp
            </button>
            <p className="text-center text-xs text-muted-2">
              This opens WhatsApp with your message pre-filled.
            </p>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
