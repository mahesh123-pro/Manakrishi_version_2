"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/context";
import { SmoothScroll } from "./SmoothScroll";
import { ScrollProgress } from "./ScrollProgress";
import { LiquidCursor } from "./LiquidCursor";
import { Preloader } from "./Preloader";
import { FloatingWhatsApp } from "./FloatingWhatsApp";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Preloader />
        <SmoothScroll />
        <ScrollProgress />
        <LiquidCursor />
        {children}
        <FloatingWhatsApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}
