"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** Decorative trailing cursor glow. Desktop + fine-pointer only; keeps the
 *  native cursor visible for accessibility. */
export function LiquidCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 150, damping: 18, mass: 0.4 });
  const ry = useSpring(y, { stiffness: 150, damping: 18, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      setActive(Boolean(el?.closest("a, button, [role='button'], input, textarea, select")));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x: rx, y: ry }}
      className="pointer-events-none fixed left-0 top-0 z-[70] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
    >
      <motion.div
        animate={{ scale: active ? 1.8 : 1, opacity: active ? 0.9 : 0.6 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="h-8 w-8 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(74,222,128,0.5), rgba(0,188,212,0.25) 55%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
    </motion.div>
  );
}
