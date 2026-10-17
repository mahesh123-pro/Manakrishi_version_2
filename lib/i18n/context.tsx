"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { dict, tl, type Locale, type Localized } from "./dictionaries";

const STORAGE_KEY = "manakrishi_lang";

interface LanguageCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  /** Translate a dictionary key OR a Localized object. */
  t: (key: string | Localized) => string;
}

const Ctx = createContext<LanguageCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Hydrate from storage on mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "te") setLocaleState(saved);
    } catch {
      // Keep the default language when browser storage is unavailable.
    }
  }, []);

  // Reflect on <html lang> + persist.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setLocale(locale === "en" ? "te" : "en");
  }, [locale, setLocale]);

  const t = useCallback(
    (key: string | Localized): string => {
      if (typeof key === "string") {
        const entry = dict[key];
        return entry ? tl(entry, locale) : key;
      }
      return tl(key, locale);
    },
    [locale]
  );

  return (
    <Ctx.Provider value={{ locale, setLocale, toggle, t }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLanguage(): LanguageCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** Convenience: just the translate function. */
export function useT() {
  return useLanguage().t;
}
