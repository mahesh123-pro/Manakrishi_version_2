import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/layout/LegalShell";
import { SITE } from "@/lib/content";
import { MessageCircle, Mail, Phone, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with booking drone spraying, rescheduling, or any question about Manakrishi.",
};

export default function SupportPage() {
  return (
    <LegalShell title="Support">
      <p>
        Need a hand with a booking, a reschedule, or have a question about drone spraying? We&rsquo;re
        here to help — the fastest way to reach us is WhatsApp.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={SITE.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl glass px-5 py-4 transition-colors hover:border-[var(--border-strong)]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-whatsapp/15 text-whatsapp">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">WhatsApp</p>
            <p className="text-xs">{SITE.phone}</p>
          </div>
        </a>
        <a
          href={`tel:${SITE.phoneRaw}`}
          className="flex items-center gap-4 rounded-2xl glass px-5 py-4 transition-colors hover:border-[var(--border-strong)]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald/12 text-emerald">
            <Phone className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Call us</p>
            <p className="text-xs">{SITE.phone}</p>
          </div>
        </a>
        <a
          href={`mailto:${SITE.email}`}
          className="flex items-center gap-4 rounded-2xl glass px-5 py-4 transition-colors hover:border-[var(--border-strong)]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan/12 text-cyan">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Email</p>
            <p className="text-xs">{SITE.email}</p>
          </div>
        </a>
        <Link
          href="/book"
          className="flex items-center gap-4 rounded-2xl glass px-5 py-4 transition-colors hover:border-[var(--border-strong)]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold">
            <Send className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Book a drone</p>
            <p className="text-xs">Start a new booking</p>
          </div>
        </Link>
      </div>

      <p className="text-sm">
        Our team typically responds during business hours. For urgent spraying windows, WhatsApp is
        the quickest way to reach us.
      </p>
    </LegalShell>
  );
}
