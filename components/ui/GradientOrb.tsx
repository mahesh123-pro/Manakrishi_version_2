import { cn } from "@/lib/utils";

interface GradientOrbProps {
  className?: string;
  color?: "green" | "cyan" | "gold";
  size?: number;
}

const colorMap = {
  green: "rgba(49,118,71,0.15)",
  cyan: "rgba(49,118,71,0.12)",
  gold: "rgba(35,92,56,0.16)",
};

/** Decorative blurred gradient blob for section backgrounds. */
export function GradientOrb({ className, color = "green", size = 480 }: GradientOrbProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute -z-10 rounded-full blur-[110px]", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${colorMap[color]}, transparent 70%)`,
      }}
    />
  );
}
