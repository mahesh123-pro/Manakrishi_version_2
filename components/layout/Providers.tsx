"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { LanguageProvider } from "@/lib/i18n/context";
import { SmoothScroll } from "./SmoothScroll";
import { ScrollProgress } from "./ScrollProgress";
import { FloatingWhatsApp } from "./FloatingWhatsApp";
import { Preloader } from "./Preloader";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <Preloader />
        <SmoothScroll />
        <ScrollProgress />
        {children}
        <FloatingWhatsApp />
      </LanguageProvider>
    </MotionConfig>
  );
}
