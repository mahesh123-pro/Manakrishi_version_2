# Manakrishi Marketplace

## Architecture and operating model

This extends the existing Next.js 15 / React 19 app. Firebase Firestore, Realtime Database and Google Sheets service-booking writes remain intact. The prior website had no login or operational farmer/admin dashboard; the existing dashboard section is a marketing preview. Marketplace accounts are a new, separate system.

The marketplace uses durable Postgres on Neon for Vercel production. Server-only DATABASE_URL selects Postgres; local development without it uses Node 24 SQLite in MARKETPLACE_DATA_DIR (default .marketplace/). Vercel explicitly refuses the SQLite fallback. Images are stored as sanitized WebP bytea records in Postgres, with the same owner/admin and published-listing access checks as before. No uploads or personal data depend on Vercel's temporary filesystem.

The pg pool uses Vercel's attachDatabasePool lifecycle integration. Every marketplace transaction runs on one checked-out connection and a shared transaction-scoped advisory lock. This preserves the previous single-writer semantics across Vercel instances, including stock reservations, order expiry and idempotency. This is intentionally conservative; the global transaction lock can become a throughput bottleneck at higher traffic.

Schema migration is explicit and versioned in lib/marketplace/schema-postgres.ts. Run npm run marketplace:migrate with MARKETPLACE_MIGRATION_DATABASE_URL set to the direct connection string before deploying, and configure a pooled DATABASE_URL for application traffic. The migration is additive and runs in a transaction; it does not copy local SQLite accounts or stock automatically. Never point tests at production. Use an isolated database branch for tests.

This is a purchase-request marketplace. Checkout reserves inventory and asks each farmer to confirm. It does not collect marketplace payments or assume cash on delivery, delivery pricing, tax treatment or platform fees. Buyers and farmers agree those terms directly before payment. Existing Razorpay integration continues to apply only to service-booking advances. There is no marketplace refund or payment-success state to falsely trust.

## Run locally

1. Use Node 24 and `npm install`.
2. Keep existing booking environment settings in `.env.local`.
3. Development: `npm run dev`; open `/marketplace`.
4. On Vercel, configure DATABASE_URL, run marketplace:migrate against the direct connection, then deploy. For a local SQLite production preview set `MARKETPLACE_DATA_DIR` to an absolute persistent directory in the process environment, run `npm run build`, then `npm run start`.
5. If behind a reverse proxy set `MARKETPLACE_ORIGIN` to the exact HTTPS public origin. Configure forwarded host handling correctly. Cookies are Secure in production except an HTTP localhost development preview.

PowerShell production-preview example:

```powershell
$env:MARKETPLACE_DATA_DIR = 'D:\manakrishi-data\marketplace'
npm run build
npm run start
```

No live listings, orders, reviews, statistics or verified users are seeded. The catalogue starts empty. Homepage/category photography is illustrative. Public inventory photos must be uploaded by the seller.

## Administrator setup

Administrators cannot self-select that role during registration. On the trusted host, set `MARKETPLACE_ADMIN_EMAIL` and `MARKETPLACE_ADMIN_PASSWORD` (16–128 characters) in the process environment. Use the same `MARKETPLACE_DATA_DIR` as the website, then run `npm run marketplace:admin`. The command refuses to overwrite an existing account or silently upgrade its role. Clear the password environment variable afterwards. Sign in at `/marketplace/account`, then open `/admin/marketplace`.

For a real first listing: register a farmer, upload actual crop photos, save and preview the crop, submit it, then sign in as admin to review and approve it. Public verification is separate: record actual verification evidence through the admin account action before a badge is displayed.

## Routes and components

Public: `/marketplace`, `/marketplace/product/[id]`, `/marketplace/farmer/[id]`, `/marketplace/policies`.

Private: `/marketplace/account`, `/marketplace/sell?edit=<id>`, `/marketplace/my-listings`, `/marketplace/cart`, `/marketplace/checkout`, `/marketplace/wishlist`, `/marketplace/orders`, `/marketplace/notifications`, `/admin/marketplace`.

`components/marketplace/MarketProvider.tsx` owns session-aware navigation, bilingual errors and notices. Discover, ProductCard, Account, Sell, Buy and Manage components implement the individual workflows. Product metadata and JSON-LD use published listing data only. Private pages have noindex metadata and robots exclusions; APIs enforce permissions regardless of indexing settings. Farmer storefronts currently use noindex until product operations are established.

## Database schema (migration 1)

- `users`: email, salted scrypt password, buyer/farmer/admin role, suspension, verified flag, public farm profile. Public projections omit email and password.
- `sessions`: hashed opaque random token, user reference, expiry. The token itself exists only in an HttpOnly SameSite cookie.
- `listings`: UUID, seller, crop/category/unit, integer paise price, integer milli-unit inventory/minimum/maximum, status, version, views, timestamps; additional structured crop/location/harvest/contact fields in validated JSON.
- `images`: UUID, owner and sanitized WebP bytes. Exact pickup/contact/GPS information is excluded from public listing responses.
- `cart`, `wishlist`: per-user listing references. Cart stock is validated again at checkout.
- `orders`, `order_items`: per-seller requests, buyer contact/fulfillment, idempotency key, state and immutable item price/name/unit/quantity snapshots.
- `enquiries`: buyer/seller-scoped questions and farmer replies.
- `reports`: signed-in listing reports, review status and admin resolution.
- `notifications`: persistent in-app updates only.
- `audit`: admin and important listing/order action history.
- `rate_limits`: persistent request counters; `settings`: enabled categories/units and public rules; `migrations`: applied schema versions.

Indexes cover listing status/category/recent date, seller, price, district/state and buyer/seller order access. SQLite WAL, foreign keys, constraints, prepared statements and `BEGIN IMMEDIATE` transactions enforce inventory consistency. Search currently filters the live catalogue in the Node process; large catalogues need indexed full-text search, query-based pagination and a managed database.

## Backend API

All marketplace JSON endpoints return no-store responses. Mutations require the expected Origin, validate session/role and apply account write limits.

| Endpoint under `/api/marketplace` | Methods | Purpose |
| --- | --- | --- |
| `session` | GET | Current authenticated user |
| `auth/register`, `auth/login`, `logout` | POST | Accounts and session lifecycle |
| `listings` | GET / POST | Filter/search/page published crops; farmer create/edit/draft/submit |
| `product/<id>` | GET | Public published crop, or owner/admin preview; count page views |
| `farmer/<id>` | GET | Public farm projection and published crops |
| `my-listings` | GET | Owner's private listings |
| `listing-action` | POST | Pause, resubmit, unavailable, eligible soft delete |
| `upload`, `media/<id>` | POST / GET | Restricted upload; publish-aware image delivery |
| `profile` | POST | Own farm profile and explicitly public business contact |
| `cart`, `wishlist` | GET / POST | Persist buyer collections |
| `orders`, `order-action` | GET / POST | Transactional requests and authorized transitions |
| `enquiries`, `enquiry-reply` | GET / POST | Buyer/farmer questions and replies |
| `report` | POST | Create listing concern |
| `notifications` | GET / POST | Read in-app notifications and mark seen |
| `admin`, `admin-settings` | GET / POST | Admin-only moderation, account actions, report resolution, rules |
| `rules` | GET | Public marketplace rules and supported category/unit switches |

Images: JPEG/PNG/WebP only, at most 5 MB input, 20M pixels, sanitized to WebP at a maximum of 1600 px, EXIF removed. Up to five crop photos per listing and 100 uploaded images per account; upload rate limits apply. Pending/draft images are readable only by the owner/admin, unless explicitly used as a public farm profile image. Private image responses are never cached publicly.

## Inventory and order behavior

Quantities support up to three decimal places in kg, quintal (100 kg) and tonne (1,000 kg). Prices use at most two decimal places and are stored as integer paise. Sorting/filtering prices and stock normalizes to kg, rather than incorrectly comparing a tonne price to a kilogram price.

Checkout validates every listing's current price, version, availability date, minimum, maximum, fulfillment and stock. It uses one transaction to split by seller, snapshot all items, reserve stock, insert orders and clear the cart. A repeated idempotency key returns the same order IDs. A failure rolls back every seller group. Purchase requests expire after 24 hours; expiry runs on marketplace/cart/order access, not via an external scheduler. Stock release happens once on rejection, eligible cancellation or expiry. Seller confirmations refer to already-reserved stock. Inventory edits adjust **unreserved** stock; units cannot change while orders are active.

Allowed progression: awaiting confirmation → confirmed or rejected; confirmed → preparing; preparing → ready; pickup ready → collected/delivered; delivery ready → shipped → delivered. The buyer may cancel only while awaiting confirmation; administrators may cancel awaiting/confirmed requests with a reason. Later disputes are handled through support. Cancelled/rejected/delivered states are terminal. Historical order snapshots and fulfilled order records remain after listing soft deletion.

Buyer address and phone are visible only to the order buyer, that seller and administrators. Seller contact and exact pickup snapshot are released to the buyer only after confirmation. Farm GPS is not public. General location filters are supported; distance sorting is deliberately absent because buyer geolocation/distance computation is not implemented.

## Integrations and remaining production work

Implemented: persisted marketplace operations, durable database image storage, account sessions, in-app notifications, moderation, stock reservation and purchase requests.

Not connected: marketplace Razorpay payments/webhooks/refunds; courier/delivery quotes; tax calculation; SMS, WhatsApp, email or push delivery; email verification, self-service password reset, MFA and external identity providers. There are no customer reviews or fake rating widgets. Farmer contact/profile fields are user-supplied; administrator verification must be a real operational process.

Before public rollout: establish backup/restore and schema-upgrade procedures, review data retention/deletion, add email verification/account recovery and abuse controls, configure TLS and deployment secrets, define support/refund/fulfillment policies, and validate mobile browser layouts. Admin category/unit controls enable or disable existing supported options; arbitrary new unit conversions, bulk-discount rules and category taxonomy editing require a future schema/UI extension. Runtime order expiry may be moved to a scheduled job when timely unattended release is required.

The managed database migration was verified on an isolated Neon branch with both the service suite and full HTTP workflow. Browser checks cover the public catalogue, sample-crop search and generated crop imagery.

## Validation

- `npm run test:booking`: existing booking date, rates and payload regressions.
- `npm run test:marketplace`: auth/roles, mandatory fields, image ownership, privacy, filters, reservations, price snapshots, idempotency, forbidden transitions, expiry, fulfillment and true two-process stock contention.
- `npm run build`: production compilation and type validation.
- `npm run test:marketplace:http` after build: launches a second production server against a temporary database, uses fixture accounts/images, exercises actual API auth/upload/moderation/checkout/fulfillment, and checks route responses. The database is removed afterwards. No test fixtures are inserted into the development marketplace or Firebase bookings.

`npm run lint` is the pre-existing interactive Next lint command and is not configured as a separate unattended check. No external messages or payment charges are sent by tests.

### Testing Postgres safely

Create an isolated database branch, migrate it, and supply its DATABASE_URL together with MARKETPLACE_TEST_DATABASE=1 when running either marketplace test suite. Tests refuse a Postgres URL without that explicit flag. Fixture data remains on that validation branch; the HTTP suite removes only its temporary local directory. Never use a production connection for these tests.

## Admin workspace

Open /admin (redirects to /admin/marketplace) after signing in with a provisioned administrator account. The workspace includes an overview and attention queues, searchable/filterable crop reviews and accounts, order progression, conversations, report resolution, settings and the latest 100 audit events. Record lists render in groups of 20.

Approvals, corrections, rejections and unpublishing use review dialogs. Admins can verify or suspend accounts, resolve reports, reply to buyer/farmer conversations and progress orders using the existing server-validated transitions. Cancel/reject releases stock exactly once; public crop details and images remain hidden when unpublished. Suspended sellers' crop details remain inspectable by admins only. Admin actions remain role-checked server-side. Credentials and role elevation are never offered through public registration.

The overview reports actual request/delivered values, not payment receipts or revenue. Admin credentials generated during setup stay in the ignored .marketplace folder; never commit them.

### Service booking administration

The Service bookings tab reads the existing primary Firestore bookings collection through the server-only Firebase Admin SDK. Configure FIREBASE_SERVICE_ACCOUNT_JSON as a Vercel production Secret using a service account authorized for this project's Firestore reads/writes. Set FIREBASE_BOOKINGS_PROJECT_ID to manakrishi-booking (or rely on the existing NEXT_PUBLIC_FB_PROJECT_ID). The account project must match; no personal Google credential is reused. Never commit the JSON or prefix it with NEXT_PUBLIC_. Redeploy after configuration. Without it, the tab shows a setup message while normal booking submissions remain available.

GET /api/admin/bookings returns 50 records plus an ID cursor. Filters/search apply to loaded records; load more to expand the search. Both GET and POST require a marketplace administrator session. POST validates origin, bounded body, rate limit, expected prior status, reason, operator details and schedule. Firestore transactions update status/adminDispatch and append booking_admin_audit together. Stale updates fail with 409. New → confirmed → assigned → in_progress → completed; eligible active jobs can be cancelled; completed/cancelled jobs cannot be reopened. Original customer fields are preserved. Historical unknown status values are read-only.

Booking administration updates primary Firestore records only. Existing RTDB/Sheets submission mirrors and WhatsApp automation are not changed or automatically synchronized by these actions. Dispatch updates do not send messages or trigger Razorpay captures/refunds; reconcile advances separately before cancellation. Configure audit collection access rules to deny public client writes/reads; use the server credential.

Validation: npm run test:admin-booking checks assignment requirements, schedule validation, terminal states and forbidden shortcuts. The HTTP suite checks admin-only booking endpoint access and explicit missing-credential handling. Real Firestore operations must also be verified after credentials are configured; no live customer bookings are changed during the disconnected checks.

### Booking desk tools

The service-booking desk includes queues for active jobs today (Asia/Kolkata), jobs past their service date, and jobs missing operator details. Date filters use the scheduled date or fall back to the requested date. Search, service/status/date filters, queues and sorting apply to loaded records; use Load more for additional records. CSV exports include only the visible filtered records, neutralize spreadsheet formula prefixes, and include private contact information for authorized operational use.

Customer WhatsApp links prepare messages for a staff member to review and send. Calls and calendar downloads are manual actions. Calendar files include a scheduled start in UTC converted from IST, without an assumed duration or automatic synchronization. Warnings identify matching operator phone/date/start-time values among loaded active records; they do not check job durations, prevent assignments, or replace schedule confirmation.
