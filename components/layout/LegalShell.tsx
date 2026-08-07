import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-24">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-emerald/10 blur-[130px]" />
      <div className="mx-auto w-[92%] max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="mt-8 font-heading text-4xl font-bold sm:text-5xl">{title}</h1>
        {updated && <p className="mt-3 text-sm text-muted-2">Last updated: {updated}</p>}
        <div className="legal-prose mt-10 flex flex-col gap-6 text-[15px] leading-relaxed text-muted">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-heading text-xl font-semibold text-foreground">{heading}</h2>
      {children}
    </section>
  );
}
