import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Leaf, ShieldCheck, MessageCircle } from "lucide-react";
import { BookingForm } from "@/components/booking/BookingForm";

export const metadata: Metadata = {
  title: "Book Farm Services",
  description: "Plan drone spraying, tractor tillage or a combined field visit. Choose your crop, acreage and preferences, then request a booking with Manakrishi.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <div className="booking-page min-h-screen pt-28 pb-20 sm:pt-32">
      <div className="mx-auto w-[92%] max-w-7xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-green"><ArrowLeft className="h-3.5 w-3.5" />Back to the farm</Link>
        <div className="mb-8 mt-6 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
          <div><span className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald"><Leaf className="h-3.5 w-3.5" />Let’s grow something better</span><h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-5xl">Your field. <span className="text-emerald">Your service. Your way.</span></h1><p className="mt-3 max-w-2xl text-sm leading-7 text-muted">A few simple choices for your next field visit. We’ll take care of the coordination.</p></div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-muted"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green" />Trusted operators</span><span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4 text-green" />Local team support</span></div>
        </div>
        <BookingForm />
      </div>
    </div>
  );
}
