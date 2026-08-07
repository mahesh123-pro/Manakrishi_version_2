"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
  type?: "button" | "submit";
}

const styles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-gold-400 to-gold text-[#1a1200] shadow-[0_10px_40px_-10px_rgba(255,179,0,0.6)] hover:shadow-[0_16px_50px_-10px_rgba(255,179,0,0.75)]",
  secondary:
    "glass-strong text-foreground hover:border-[var(--border-strong)]",
  ghost:
    "text-foreground/90 hover:text-foreground",
};

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  external,
  ariaLabel,
  type = "button",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  const tx = useTransform(sx, (v) => v * 0.35);
  const ty = useTransform(sy, (v) => v * 0.35);

  function handleMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  const inner = (
    <motion.span
      style={{ x: tx, y: ty }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-colors duration-300",
        styles[variant]
      )}
    >
      {children}
    </motion.span>
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={cn("inline-block", className)}
    >
      {href ? (
        <a
          href={href}
          aria-label={ariaLabel}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="inline-block"
        >
          {inner}
        </a>
      ) : (
        <button type={type} onClick={onClick} aria-label={ariaLabel} className="inline-block">
          {inner}
        </button>
      )}
    </motion.div>
  );
}
