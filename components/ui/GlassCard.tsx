"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Enables a subtle pointer-tracking glow highlight. */
  interactive?: boolean;
}

export function GlassCard({ children, className, interactive = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -6 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl glass p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      {/* top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald/50 to-transparent opacity-70" />
      {interactive && (
        <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(600px_circle_at_var(--x,50%)_var(--y,0%),rgba(74,222,128,0.12),transparent_40%)]" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
