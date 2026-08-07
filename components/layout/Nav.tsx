"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Send } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/content";
import { useT } from "@/lib/i18n/context";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

export function Nav() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-2.5" : "py-4"
      )}
    >
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-4 transition-all duration-500 sm:px-5",
          scrolled ? "glass-strong py-2.5" : "py-2"
        )}
        style={{ width: "min(94%, 80rem)" }}
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="Manakrishi home">
          <Image
            src="/assets/manakrishi-logo.png"
            alt="Manakrishi"
            width={38}
            height={38}
            className="h-9 w-9 rounded-lg object-contain"
            priority
          />
          <span className="font-heading text-lg font-bold tracking-tight">
            Mana<span className="text-emerald">krishi</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.key}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {t(l.key)}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle className="hidden sm:inline-flex" />
          <ThemeToggle />
          <Link
            href="/book"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-br from-gold-400 to-gold px-5 py-2.5 text-sm font-semibold text-[#1a1200] shadow-[0_8px_30px_-8px_rgba(255,179,0,0.6)] transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            <Send className="h-4 w-4" />
            {t("nav.book")}
          </Link>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-full glass lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[var(--background)]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-heading text-lg font-bold">
                Mana<span className="text-emerald">krishi</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full glass"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
              className="flex flex-col gap-2 px-6 pt-6"
            >
              {NAV_LINKS.map((l) => (
                <motion.li
                  key={l.key}
                  variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-[var(--border)] py-4 font-heading text-2xl font-semibold"
                  >
                    {t(l.key)}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-8 flex flex-col gap-4 px-6">
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-gold-400 to-gold px-6 py-4 font-semibold text-[#1a1200]"
              >
                <Send className="h-4 w-4" />
                {t("nav.book")}
              </Link>
              <LanguageToggle />
              <a href={SITE.whatsapp} className="text-center text-sm text-muted">
                {SITE.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
