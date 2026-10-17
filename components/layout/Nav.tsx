"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/content";
import { useT } from "@/lib/i18n/context";
import { LanguageToggle } from "./LanguageToggle";

export function Nav() {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hrefFor = (href: string) => pathname === "/" ? href : `/${href}`;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = menuRef.current?.querySelectorAll<HTMLElement>('a[href], button');
    controls?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const onResize = () => { if (window.innerWidth >= 1280) setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-green/10 bg-white/95 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex h-22 w-[90%] max-w-7xl items-center justify-between gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Manakrishi home">
          <Image src="/assets/manakrishi-logo.png" alt="" width={44} height={44} priority className="h-11 w-11 object-contain" />
          <span className="font-heading text-2xl font-semibold tracking-tight">Mana<span className="text-emerald">krishi</span><span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.2em] text-muted">{t("brand.tagline")}</span></span>
        </Link>
        <div className="hidden items-center gap-6 xl:flex">
          {NAV_LINKS.map((link) => <a key={link.key} href={hrefFor(link.href)} className="text-[13px] font-medium text-muted transition-colors hover:text-green">{t(link.key)}</a>)}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block"><LanguageToggle /></div>
          <Link href="/book" className="farm-button hidden px-5 py-3 text-xs sm:inline-flex">{t("nav.book")}<ArrowUpRight className="h-4 w-4" /></Link>
          <button ref={triggerRef} onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" className="grid h-11 w-11 place-items-center rounded-full border border-green/15 text-green xl:hidden"><Menu className="h-5 w-5" /></button>
        </div>
      </nav>
      {open && (
        <div ref={menuRef} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu" className="fixed inset-0 z-50 h-dvh overflow-y-auto bg-white p-6 xl:hidden">
          <div className="flex items-center justify-between"><span className="font-heading text-2xl font-semibold text-green">Manakrishi</span><button onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full bg-green/5 text-green"><X className="h-5 w-5" /></button></div>
          <div className="mt-10 flex flex-col">{NAV_LINKS.map((link) => <a key={link.key} href={hrefFor(link.href)} onClick={() => setOpen(false)} className="border-b border-green/10 py-5 font-heading text-2xl">{t(link.key)}</a>)}</div>
          <div className="mt-8 flex flex-col items-start gap-6"><Link href="/book" onClick={() => setOpen(false)} className="farm-button">{t("nav.book")}<ArrowUpRight className="h-4 w-4" /></Link><LanguageToggle /><a href={SITE.whatsapp} className="text-sm text-green">{SITE.phone}</a></div>
        </div>
      )}
    </header>
  );
}
