import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

/** Standard section wrapper with consistent vertical rhythm + centered container. */
export function Section({ id, children, className, containerClassName }: SectionProps) {
  return (
    <section id={id} className={cn("relative overflow-hidden py-24 sm:py-28 lg:py-32", className)}>
      <div className={cn("mx-auto w-[92%] max-w-7xl", containerClassName)}>{children}</div>
    </section>
  );
}
