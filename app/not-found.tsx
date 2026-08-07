import Link from "next/link";
import { Home, Send } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/12 blur-[120px]" />
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="font-heading text-8xl font-bold text-gradient">404</p>
        <h1 className="font-heading text-2xl font-semibold">This field is off the map</h1>
        <p className="max-w-sm text-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist. Let&rsquo;s get you back to solid ground.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full glass-strong px-6 py-3 text-sm font-semibold transition-colors hover:text-emerald"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-400 to-gold px-6 py-3 text-sm font-semibold text-[#1a1200]"
          >
            <Send className="h-4 w-4" /> Book a Drone
          </Link>
        </div>
      </div>
    </div>
  );
}
