import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Linkedin } from "lucide-react";
import { TEAM } from "@/lib/content";

export const metadata: Metadata = {
  title: "Visionaries & Partners",
  description:
    "Meet the team behind Manakrishi — building India's next-generation drone agriculture platform, farmer-first.",
};

export default function PartnersPage() {
  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-emerald/10 blur-[130px]" />

      <div className="mx-auto w-[92%] max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mt-8 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            Our Leadership
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold leading-tight sm:text-5xl">
            Meet the <span className="text-gradient">Visionaries &amp; Partners</span>
          </h1>
          <p className="mt-4 text-muted">
            &ldquo;Technology should empower every farmer, not replace them.&rdquo; The team behind
            Manakrishi is building precision agriculture that puts farmers first.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {TEAM.map((m) => (
            <div key={m.name} className="group overflow-hidden rounded-[2rem] glass">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={`/assets/${m.image}`}
                  alt={m.name}
                  fill
                  sizes="(max-width: 640px) 92vw, 45vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a07] to-transparent" />
              </div>
              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="font-heading text-xl font-semibold">{m.name}</h2>
                  <p className="text-sm text-emerald">{m.role.en}</p>
                </div>
                {m.linkedin && (
                  <a
                    href={m.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${m.name} on LinkedIn`}
                    className="grid h-10 w-10 place-items-center rounded-full glass text-muted transition-colors hover:text-emerald"
                  >
                    <Linkedin className="h-4.5 w-4.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
