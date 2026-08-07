"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/content";

export function FloatingWhatsApp() {
  return (
    <motion.a
      href={SITE.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.8, type: "spring", stiffness: 200, damping: 15 }}
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)]"
    >
      <span className="absolute inset-0 -z-10 animate-[pulse-ring_2.5s_ease-out_infinite] rounded-full bg-whatsapp/50" />
      <MessageCircle className="h-7 w-7" />
    </motion.a>
  );
}
