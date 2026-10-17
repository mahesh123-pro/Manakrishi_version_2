"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { SITE } from "@/lib/content";
import { useT } from "@/lib/i18n/context";

export function Footer() {
  const t = useT();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--background-2)]">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-emerald/10 blur-[120px]" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        {/* Brand */}
        <div className="flex flex-col gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/assets/manakrishi-logo.png"
              alt="Manakrishi"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg object-contain"
            />
            <span className="font-heading text-xl font-bold">
              Mana<span className="text-emerald">krishi</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted">{t("footer.tagline")}</p>
          <div className="flex gap-3">
            {[
              { icon: Instagram, href: SITE.instagram, label: "Instagram" },
              { icon: Linkedin, href: SITE.linkedin, label: "LinkedIn" },
              { icon: Mail, href: `mailto:${SITE.email}`, label: "Email" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full glass text-muted transition-colors hover:text-emerald"
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-2">
            {t("footer.quick")}
          </h4>
          {[
            { label: t("nav.tech"), href: "/#technology" },
            { label: t("nav.how"), href: "/#how-it-works" },
            { label: t("nav.services"), href: "/#services" },
            { label: t("nav.book"), href: "/book" },
          ].map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-muted transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </div>

        {/* Company */}
        <div className="flex flex-col gap-3">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-2">
            {t("footer.company")}
          </h4>
          {[
            { label: "Partners", href: "/partners" },
            { label: t("footer.privacy"), href: "/privacy-policy" },
            { label: t("footer.terms"), href: "/terms" },
            { label: t("footer.support"), href: "/support" },
            { label: "Delete Account", href: "/delete-account" },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="text-sm text-muted transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Contact + newsletter */}
        <div className="flex flex-col gap-4">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-2">
            {t("footer.contact")}
          </h4>
          <a href={SITE.whatsapp} className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
            <Phone className="h-4 w-4 text-emerald" /> {SITE.phone}
          </a>
          <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
            <Mail className="h-4 w-4 text-emerald" /> {SITE.email}
          </a>
          <p className="flex items-start gap-2 text-sm text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald" /> {SITE.address}
          </p>
          <form
            action={`mailto:${SITE.email}`}
            method="post"
            encType="text/plain"
            className="mt-1 flex items-center gap-2 rounded-full glass p-1.5"
          >
            <input
              type="email"
              name="email"
              required
              placeholder={t("footer.newsletter")}
              aria-label={t("footer.newsletter")}
              className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-2"
            />
            <button
              type="submit"
              aria-label={t("footer.subscribe")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-2 sm:flex-row lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE.legalName}. {t("footer.rights")}
          </p>
          <p>Empowering every farmer with modern drone technology.</p>
        </div>
      </div>
    </footer>
  );
}
