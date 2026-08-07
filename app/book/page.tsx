import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Clock, Leaf, MessageCircle } from "lucide-react";
import { BookingForm } from "@/components/booking/BookingForm";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Book Drone Spraying",
  description:
    "Book precision drone pesticide spraying with Manakrishi. Share your crop, location and acreage — our team confirms your slot on WhatsApp.",
};

const trust = [
  { icon: ShieldCheck, text: "Certified drone operators" },
  { icon: Clock, text: "Confirmed on WhatsApp" },
  { icon: Leaf, text: "Up to 30% less chemical" },
];

export default function BookPage() {
  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-[50rem] -translate-x-1/2 rounded-full bg-emerald/10 blur-[130px]" />

      <div className="mx-auto grid w-[92%] max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left: intro */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <span className="inline-flex w-fit items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Book a Drone
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
            Precision spraying,
            <br />
            <span className="text-gradient">booked in minutes.</span>
          </h1>
          <p className="max-w-md text-muted">
            Fill in a few details and our team confirms your drone spraying slot on WhatsApp. Faster,
            safer and cheaper than manual spraying.
          </p>

          <div className="mt-2 flex flex-col gap-3">
            {trust.map((tr) => {
              const Icon = tr.icon;
              return (
                <div key={tr.text} className="flex items-center gap-3 text-sm text-muted">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald/12 text-emerald">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  {tr.text}
                </div>
              );
            })}
          </div>

          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-medium text-whatsapp hover:underline"
          >
            <MessageCircle className="h-4 w-4" /> Prefer to chat? WhatsApp {SITE.phone}
          </a>
        </div>

        {/* Right: form */}
        <BookingForm />
      </div>
    </div>
  );
}
