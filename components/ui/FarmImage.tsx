"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FarmImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  fill?: boolean;
}

/** A short image reveal that runs once, with a still reduced-motion version. */
export function FarmImage({ src, alt, sizes, className, imageClassName, priority = false, fill = false }: FarmImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} className={cn("group overflow-hidden bg-green/5", fill ? "absolute inset-0" : "relative", className)}>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ scale: visible || reduceMotion ? 1 : 1.08 }}
        transition={{ duration: reduceMotion ? 0 : 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("farm-photo object-cover", imageClassName)}
        />
      </motion.div>
    </div>
  );
}
