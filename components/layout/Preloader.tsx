"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setDone(true), reduce ? 200 : 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center bg-[var(--background)]"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative h-20 w-20">
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-emerald/30"
                animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-cyan/30"
                animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.35 }}
              />
              <motion.div
                className="absolute inset-3 grid place-items-center rounded-full bg-gradient-to-br from-green to-emerald"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#06120b]" fill="currentColor">
                  <path d="M12 2l1.8 4.6L18.5 5l-1.6 4.7L21 12l-4.1 2.3L18.5 19l-4.7-1.6L12 22l-1.8-4.6L5.5 19l1.6-4.7L3 12l4.1-2.3L5.5 5l4.7 1.6L12 2z" />
                </svg>
              </motion.div>
            </div>
            <motion.p
              className="font-heading text-lg font-semibold tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Mana<span className="text-emerald">krishi</span>
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
