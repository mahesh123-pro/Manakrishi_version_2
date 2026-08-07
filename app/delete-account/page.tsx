import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Clock, Trash2 } from "lucide-react";
import { DeleteAccountForm } from "@/components/booking/DeleteAccountForm";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Delete Account & Data",
  description:
    "Request deletion of your Manakrishi account and personal data. Submit your details and our team will process the request.",
  robots: { index: false, follow: true },
};

const notes = [
  { icon: Trash2, text: "We delete your personal details and booking history." },
  { icon: Clock, text: "Processed within a few business days." },
  { icon: ShieldAlert, text: "This action is permanent and cannot be undone." },
];

export default function DeleteAccountPage() {
  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-red-500/10 blur-[130px]" />

      <div className="mx-auto grid w-[92%] max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-6">
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
            Delete your <span className="text-gradient">account &amp; data</span>
          </h1>
          <p className="max-w-md text-muted">
            You can request deletion of your Manakrishi account and all associated personal data at any
            time. Fill in the details you booked with and confirm below.
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {notes.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.text} className="flex items-center gap-3 text-sm text-muted">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-500/12 text-red-400">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  {n.text}
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-2">
            Questions? Email{" "}
            <a href={`mailto:${SITE.email}`} className="text-emerald hover:underline">
              {SITE.email}
            </a>{" "}
            or WhatsApp {SITE.phone}.
          </p>
        </div>

        <DeleteAccountForm />
      </div>
    </div>
  );
}
