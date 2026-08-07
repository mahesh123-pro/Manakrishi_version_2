"use client";

import Image from "next/image";
import { useT } from "@/lib/i18n/context";
import { CROPS } from "@/lib/content";
import { Marquee } from "@/components/ui/Marquee";

export function CropsStrip() {
  const t = useT();
  return (
    <div className="relative border-y border-[var(--border)] bg-[var(--background-2)]/50 py-10">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-2">
        Precision spraying for every crop
      </p>
      <Marquee>
        {CROPS.map((c) => (
          <div key={c.image} className="flex items-center gap-4 rounded-2xl glass px-5 py-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl">
              <Image src={`/assets/${c.image}`} alt={c.name.en} fill sizes="56px" className="object-cover" />
            </div>
            <span className="whitespace-nowrap font-heading text-lg font-semibold">{t(c.name)}</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
