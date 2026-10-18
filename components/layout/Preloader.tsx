"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useT } from "@/lib/i18n/context";

/** One bounded brand intro per page load; route changes keep the provider mounted. */
export function Preloader() {
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();
  const t = useT();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      finishTimer = setTimeout(() => setDone(true), Math.max(0, (reduce ? 100 : 1200) - (performance.now() - start)));
    };
    const safetyTimer = setTimeout(() => setDone(true), reduce ? 350 : 2400);
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    return () => {
      clearTimeout(finishTimer);
      clearTimeout(safetyTimer);
      window.removeEventListener("load", finish);
    };
  }, []);

  return <AnimatePresence>
    {!done && <motion.div
      className="brand-preloader fixed inset-0 z-[100] grid place-items-center bg-[#fbfcf8]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      aria-label={t({ en: "Loading Manakrishi", te: "మనకృషి లోడ్ అవుతోంది" })}
    >
      <div className="flex flex-col items-center px-6 text-center">
        <motion.div initial={false} animate={reduceMotion ? {} : { scale: [0.96, 1] }} transition={{ duration: 1.1, ease: "easeOut" }}>
          <Image src="/assets/manakrishi-logo.png" alt="Manakrishi" width={288} height={288} priority sizes="(max-width: 640px) 240px, 288px" className="h-60 w-60 object-contain sm:h-72 sm:w-72" />
        </motion.div>
        <div aria-hidden="true" className="brand-loader-track mt-1 h-1 w-28 overflow-hidden rounded-full bg-green/10"><span className="brand-loader-fill block h-full w-full origin-left rounded-full bg-green" /></div>
        <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{t({ en: "Rooted in farming. Growing with you.", te: "వ్యవసాయమే పునాది. మీతో కలిసి ఎదుగుతాం." })}</p>
      </div>
    </motion.div>}
  </AnimatePresence>;
}
