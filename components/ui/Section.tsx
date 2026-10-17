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
    <section id={id} className={cn("farm-section relative overflow-hidden py-16 sm:py-20 lg:py-24", className)}>
      <div className={cn("mx-auto w-[92%] max-w-7xl", containerClassName)}>{children}</div>
    </section>
  );
}
