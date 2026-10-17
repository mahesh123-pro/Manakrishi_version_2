import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Infinite horizontal marquee (CSS keyframe). Duplicates children for seamless loop. */
export function Marquee({
  children,
  className,
  reverse,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div className={cn("farm-marquee mask-fade-x flex overflow-hidden", className)}>
      <div
        className="flex shrink-0 items-center gap-10 pr-10"
        style={{ animation: `marquee 32s linear infinite ${reverse ? "reverse" : ""}` }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="flex shrink-0 items-center gap-10 pr-10"
        style={{ animation: `marquee 32s linear infinite ${reverse ? "reverse" : ""}` }}
      >
        {children}
      </div>
    </div>
  );
}
