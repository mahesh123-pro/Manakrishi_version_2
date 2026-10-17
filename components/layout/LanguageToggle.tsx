"use client";

import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full glass p-0.5 text-xs font-semibold",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {(["en", "te"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            "rounded-full px-3 py-1.5 transition-colors",
            locale === l ? "bg-emerald text-white" : "text-muted hover:text-foreground"
          )}
        >
          {l === "en" ? "EN" : "తెలుగు"}
        </button>
      ))}
    </div>
  );
}
