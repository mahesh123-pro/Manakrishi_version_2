# Manakrishi — Drone Agriculture Platform (Website)

India's next-generation drone agriculture platform. A premium, cinematic marketing site
for **Manakrishi** — book precision drone pesticide spraying online.

Built with **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion ·
GSAP · Lenis · React Three Fiber**.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the booking backend values
npm run dev                  # http://localhost:3000
```

## Booking backend

The booking form (`/book`) writes to the **same** pipeline as the previous live site, so bookings
keep flowing to the existing operations tools:

1. **Firestore** (`manakrishi-booking`) → `bookings` collection (`status: "new"`) — primary.
2. **Realtime Database** (`db-vt-gsocp`) → `bookings` ref — feeds the WhatsApp Automator.
3. **Google Apps Script** `/exec` → appends a row to the bookings Google Sheet.

All configuration lives in environment variables — see [`.env.example`](.env.example). The values
are provided in `.env.local` for local development.

### Security note (recommended)

Firebase web config values are **public by design** (they ship to the browser). Security comes from
**Firestore Rules**, not from hiding the keys. Add a rule that only allows *creating* bookings:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /bookings/{doc} {
      allow create: if true;   // anyone can submit a booking
      allow read, update, delete: if false;  // no public read/edit
    }
  }
}
```

## Content

All copy, stats, crops, services, testimonials, roadmap and FAQ live in a single typed source of
truth: [`lib/content.ts`](lib/content.ts). UI microcopy (English + Telugu) is in
[`lib/i18n/dictionaries.ts`](lib/i18n/dictionaries.ts). The language toggle persists to
`localStorage` (`manakrishi_lang`); the theme toggle persists to `manakrishi_theme`.

Images are the real assets from the previous site, in [`public/assets`](public/assets), served
through `next/image` (AVIF/WebP, responsive).

## Structure

```
app/            routes (/, /book, /partners, /privacy-policy, /terms, /support) + sitemap/robots
components/
  sections/     the 18 landing sections
  layout/       Nav, Footer, providers, smooth scroll, cursor, toggles
  ui/           GlassCard, MagneticButton, AnimatedCounter, Reveal, ParticleField, …
  three/        DroneModel + DroneCanvas (lazy-loaded R3F drone)
  booking/      BookingForm (wired to lib/firebase)
lib/            content, i18n, firebase, motion, utils
```

## Deploy (Vercel)

1. Push to Git and import the repo in Vercel.
2. Add the `NEXT_PUBLIC_*` environment variables from `.env.example`.
3. Deploy. Point `manakrishi.in` / `www.manakrishi.in` DNS to Vercel and retire the old GitHub Pages
   hosting once verified. Old `.html` routes redirect to their new paths (see `next.config.ts`).

## Scripts

- `npm run dev` — local dev
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — lint
