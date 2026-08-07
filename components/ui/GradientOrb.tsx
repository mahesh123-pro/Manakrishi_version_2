import { cn } from "@/lib/utils";

interface GradientOrbProps {
  className?: string;
  color?: "green" | "cyan" | "gold";
  size?: number;
}

const colorMap = {
  green: "rgba(74,222,128,0.35)",
  cyan: "rgba(0,188,212,0.30)",
  gold: "rgba(255,179,0,0.28)",
};

/** Decorative blurred gradient blob for section backgrounds. */
export function GradientOrb({ className, color = "green", size = 480 }: GradientOrbProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute -z-10 rounded-full blur-[110px] animate-drift", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${colorMap[color]}, transparent 70%)`,
      }}
    />
  );
}
