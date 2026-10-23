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
- `npm run test:booking` — booking date, estimate and dispatch-payload checks (Node.js 22.18+)

## Booking experience

The `/book` flow has three steps: service and field, visit preferences, then review and contact details. Service links can preselect `?service=drone`, `?service=tractor`, or `?service=combined`.

Time and contact preferences and optional notes are sent with the existing booking payload. The legacy `chemicalOrImplement` field remains available to dispatch integrations. Combined bookings include both selections in that field. Existing external spreadsheets or automations may need their own column/template updates to display the added preferences.

Estimates use the existing indicative drone and tractor rates; combined services require a team quote. A submitted request does not reserve a slot until the team confirms availability, pricing and weather conditions.

## Drone technology viewer

The homepage's `#technology` section includes a procedural six-rotor agricultural drone with a spray tank, landing skids, sensor pod, rotating propellers and a mist demonstration. Visitors can pause, toggle the spray, drag to orbit, select front/top views and reset the camera. Feature buttons explain the airframe, spray system and field guidance.

The viewer loads near the viewport and stops continuous rendering when off-screen, paused or in a hidden tab. Reduced-motion preferences disable autoplay; visitors can explicitly start it. Devices without WebGL receive a photo fallback. This is an illustrative equipment model, not a vendor-specific digital twin or flight/dosage simulator.

## Homepage media

The homepage hero fills the viewport with a four-slide background: three photographs shown for nine seconds each, followed by a silent 15-second MP4 photo reel. Slides crossfade over 1.8 seconds. Pause/play, previous/next and individual slide controls are provided. Rotation and video playback pause off-screen, when the tab is hidden, or while keyboard focus is in the carousel controls. Reduced-motion preferences disable automatic rotation until the visitor explicitly starts it. The MP4 loads when its slide is reached. The reel animates generated photographs; it is not generated flight footage.

Image prompts are saved in `public/assets/homepage-image-prompts.md`. The reel recipe and source notes are in `public/videos/README.md`; its reproducible FFmpeg script is `scripts/create-homepage-reel.cjs`. No video-generation account is connected. Replacing the photo reel with generated motion footage requires a video provider connection, such as Runway.

## Razorpay booking advances

Bookings are saved to the existing Firebase pipeline before optional payment. The success screen displays the Firestore booking reference and offers Razorpay Checkout when configured. The advance is a fixed, server-configured amount credited toward the final service bill; the indicative acreage estimate is never charged automatically. Agree your advance and cancellation/refund policy before enabling live payments.

Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_BOOKING_ADVANCE_PAISE` in the server environment (see `.env.example`). Start with Razorpay test keys. A blank or invalid configuration disables checkout while keeping booking requests available. Restart/redeploy after setting variables. Never expose the secret in a `NEXT_PUBLIC_` variable. Configure automatic capture in the Razorpay Dashboard.

The server creates INR orders, signs a checkout token, verifies the checkout signature and fetches the order/payment from Razorpay to match amount, currency and booking reference. Only a captured payment displays as received. Authorized payments remain pending. A failed verification offers a status retry against the same payment, rather than starting a second charge. Closing checkout keeps the booking request. A new checkout uses the existing order during that page session.

Razorpay is the durable payment ledger: each order has `notes.booking_id` and a `booking_<id>` receipt. Reconcile payments against the matching Firestore document in the Razorpay Dashboard. Firebase booking records are not marked paid by the browser. If the page closes before verification, use the booking/payment references to reconcile in the Dashboard before requesting another payment. This version does not add a Firebase payment ledger or webhook-driven reconciliation; add an authenticated server-side database integration if automated dispatch must depend on payment status.

Before live use, exercise test-mode checkout success, failure, cancellation and pending capture; confirm the order notes point to the saved booking. No live payment was submitted during implementation.

## Agricultural marketplace

The new `/marketplace` extension includes farmer listings, crop discovery, buyer carts and purchase requests, order management and administrator review. Marketplace storage uses Node 24 SQLite on a persistent disk; it does not replace Firebase service bookings. See [Marketplace setup, schema, API and deployment requirements](docs/marketplace.md) before hosting. No live stock or test accounts are seeded.
