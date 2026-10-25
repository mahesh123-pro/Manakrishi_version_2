"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ArrowRight,
  Leaf,
  Handshake,
  Truck,
  X,
  Sprout,
  Wheat,
  Bean,
  Carrot,
  Cherry,
  Flower2,
  Sun,
  ArrowUpRight,
} from "lucide-react";
import { CATEGORIES, type Listing, type User } from "@/lib/marketplace/types";
import { useMarket, PageHeading, Empty, Skeleton } from "./MarketProvider";
import { ProductCard } from "./ProductCard";

const CATEGORY_ICONS: Record<string, typeof Sprout> = {
  grains: Wheat,
  rice: Sprout,
  wheat: Wheat,
  pulses: Bean,
  vegetables: Carrot,
  fruits: Cherry,
  oilseeds: Sun,
  spices: Flower2,
  commercial: Flower2,
  organic: Leaf,
};
const CROP_PREVIEWS = [
  { id: "tomato", en: "Tomato", te: "టమాటా", price: 30, description: "Juicy red tomatoes for everyday curries, salads and sauces.", descriptionTe: "రోజువారీ కూరలు, సలాడ్లు మరియు సాస్‌ల కోసం ఎర్రని టమాటాలు." },
  { id: "chilli", en: "Green chilli", te: "పచ్చిమిర్చి", price: 60, description: "Fresh green chillies for a bright, spicy touch in your cooking.", descriptionTe: "మీ వంటకు ఘాటైన రుచిని అందించే తాజా పచ్చిమిర్చి." },
  { id: "onion", en: "Onion", te: "ఉల్లిపాయ", price: 35, description: "Red onions with crisp layers for curries, chutneys and salads.", descriptionTe: "కూరలు, పచ్చళ్లు మరియు సలాడ్ల కోసం ఎర్ర ఉల్లిపాయలు." },
] as const;
function CategoryIcon({ id }: { id: string }) {
  const Icon = CATEGORY_ICONS[id] || Sprout;
  return <Icon size={29} strokeWidth={1.45} />;
}

type Results = {
  items: Listing[];
  count: number;
  page: number;
  hasMore: boolean;
};
const initial = {
  q: "",
  category: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  quantity: "",
  maxMinimum: "",
  variety: "",
  grade: "",
  harvest: "",
  organic: "",
  verified: "",
  sort: "recent",
};
export function Discover() {
  const { c, api } = useMarket();
  const [filters, setFilters] = useState(initial),
    [results, setResults] = useState<Results>({
      items: [],
      count: 0,
      page: 1,
      hasMore: false,
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [page, setPage] = useState(1),
    [drawer, setDrawer] = useState(false),
    [recent, setRecent] = useState<Listing[]>([]),
    [retry, setRetry] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (drawer) dialog.current?.showModal();
    else dialog.current?.close();
  }, [drawer]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ ...filters, page: String(page) });
        const data = await api<Results>(`listings?${params}`);
        if (alive) {
          setResults((prev) => ({
            ...data,
            items: page > 1 ? [...prev.items, ...data.items] : data.items,
          }));
          setError("");
        }
      } catch (e) {
        if (alive) setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [api, filters, page, retry]);
  useEffect(() => {
    let alive = true;
    try {
      const ids: string[] = JSON.parse(
        localStorage.getItem("mk-recent") || "[]",
      );
      Promise.all(
        ids.slice(0, 4).map((id) =>
          api<{ listing: Listing }>(`product/${id}`)
            .then((d) => d.listing)
            .catch(() => null),
        ),
      ).then((items) => {
        if (alive) setRecent(items.filter((v): v is Listing => Boolean(v)));
      });
    } catch {}
    return () => {
      alive = false;
    };
  }, [api]);
  const set = (key: keyof typeof initial, value: string) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };
  const seasonal = results.items
    .filter(
      (l) =>
        l.harvest &&
        l.harvest <= new Date().toISOString().slice(0, 10) &&
        Date.parse(l.harvest) > Date.now() - 90 * 86400000,
    )
    .slice(0, 3);
  const filterFields = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">
          {c("Find your harvest", "మీ పంటను కనుగొనండి")}
        </h2>
        <button
          onClick={() => {
            setFilters(initial);
            setPage(1);
          }}
          className="text-xs font-semibold text-green underline"
        >
          {c("Clear all", "అన్నీ తొలగించు")}
        </button>
      </div>
      <label className="mk-label">
        {c("Category", "వర్గం")}
        <select
          className="mk-input"
          value={filters.category}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="">{c("All crops", "అన్ని పంటలు")}</option>
          {CATEGORIES.map((v) => (
            <option value={v[0]} key={v[0]}>
              {c(v[1], v[2])}
            </option>
          ))}
        </select>
      </label>
      {(
        [
          [
            "location",
            "Village, district or state",
            "గ్రామం, జిల్లా లేదా రాష్ట్రం",
          ],
          ["minPrice", "Minimum price / kg (₹)", "కనీస ధర / కిలో (₹)"],
          ["maxPrice", "Maximum price / kg (₹)", "గరిష్ట ధర / కిలో (₹)"],
          [
            "quantity",
            "Available stock: at least (kg)",
            "కనీస స్టాక్ (కిలోలు)",
          ],
          [
            "maxMinimum",
            "Maximum minimum order (kg)",
            "గరిష్ట కనీస ఆర్డర్ (కిలోలు)",
          ],
          ["variety", "Crop variety", "పంట రకం"],
          ["grade", "Quality grade", "నాణ్యత గ్రేడ్"],
          ["harvest", "Harvest on or after", "ఈ తేదీ తర్వాత కోత"],
        ] as const
      ).map(([key, en, te]) => (
        <label key={key} className="mk-label">
          {c(en, te)}
          <input
            className="mk-input"
            type={
              key === "harvest"
                ? "date"
                : ["minPrice", "maxPrice", "quantity", "maxMinimum"].includes(
                      key,
                    )
                  ? "number"
                  : "text"
            }
            min="0"
            value={filters[key]}
            onChange={(e) => set(key, e.target.value)}
          />
        </label>
      ))}
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={Boolean(filters.organic)}
          onChange={(e) => set("organic", e.target.checked ? "1" : "")}
        />
        {c("Organic (seller declared)", "సేంద్రియ (విక్రేత తెలిపినది)")}
      </label>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={Boolean(filters.verified)}
          onChange={(e) => set("verified", e.target.checked ? "1" : "")}
        />
        {c("Verified sellers only", "ధృవీకరించిన విక్రేతలు")}
      </label>
      <p className="text-[10px] leading-5 text-muted">
        {c(
          "Prices and quantities are compared per kilogram. Delivery is arranged with the seller.",
          "ధరలు, పరిమాణాలు కిలోకు పోల్చబడతాయి. డెలివరీని విక్రేతతో నిర్ధారించండి.",
        )}
      </p>
    </div>
  );
  return (
    <>
      <section className="mk-hero">
        <div className="mk-hero-inner">
          <div>
            <span className="mk-hero-tag">
              <Sprout size={14} />
              {c("From Farmers to Families", "రైతుల నుండి కుటుంబాలకు")}
            </span>
            <h1 className="mk-hero-title">
              {c("Fresh from Our Farms.", "మన పొలాల తాజా పంటలు.")}
              <span className="mk-hero-title-accent">
                {c("Fair Prices for Everyone.", "అందరికీ న్యాయమైన ధరలు.")}
              </span>
            </h1>
            <p className="mk-hero-description">
              {c(
                "Discover quality crops directly from farmers. Compare prices, explore local produce, and build a better connection between farms and markets.",
                "రైతుల నుండి నేరుగా నాణ్యమైన పంటలను కనుగొనండి. ధరలు పోల్చి స్థానిక ఉత్పత్తులను చూడండి. రైతులు, మార్కెట్ల మధ్య మెరుగైన బంధం నిర్మించండి.",
              )}
            </p>
            <form
              className="mk-search mt-7"
              onSubmit={(e) => {
                e.preventDefault();
                document
                  .getElementById("crop-results")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Search className="ml-3 shrink-0 text-green" size={19} />
              <label htmlFor="crop-search" className="sr-only">
                {c(
                  "Search crops, farmers or locations",
                  "పంటలు, రైతులు లేదా ప్రాంతాలు వెతకండి",
                )}
              </label>
              <input
                id="crop-search"
                className="min-w-0 flex-1 bg-transparent p-3 text-sm outline-none"
                placeholder={c(
                  "Try paddy, chilli, or your district…",
                  "వరి, మిరప లేదా మీ జిల్లా…",
                )}
                value={filters.q}
                onChange={(e) => set("q", e.target.value)}
              />
              <button className="mk-btn" type="submit">
                {c("Explore crops", "పంటలు చూడండి")}
                <ArrowRight size={16} />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {c(
                  "Discover by district or state",
                  "జిల్లా లేదా రాష్ట్రం ద్వారా చూడండి",
                )}
              </span>
              <Link
                href="/marketplace/sell"
                className="font-semibold text-green underline underline-offset-4"
              >
                {c("Sell your harvest", "మీ పంట అమ్మండి")}
              </Link>
            </div>
          </div>
          <div className="mk-hero-art">
            <div className="mk-harvest-image">
              <Image
                src="/assets/marketplace-harvest-editorial.webp"
                alt={c(
                  "A basket of fresh vegetables, mangoes and grains at an Indian farm",
                  "భారత పొలంలో తాజా కూరగాయలు, మామిడి పండ్లు మరియు ధాన్యాల బుట్ట",
                )}
                fill
                priority
                sizes="(max-width:1024px) 92vw, 50vw"
                className="object-cover"
              />
              <span className="mk-photo-label">
                {c("A little closer to the farm.", "పొలానికి మరింత చేరువగా.")}
              </span>
            </div>
            <div className="mk-farm-note">
              <span className="mk-farm-note-icon">
                <Sprout size={26} strokeWidth={1.4} />
              </span>
              <div>
                <p className="font-heading text-lg font-semibold">
                  {c(
                    "Good food. Good connections.",
                    "మంచి ఆహారం. మంచి బంధాలు.",
                  )}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {c(
                    "Meet the people behind your harvest.",
                    "మీ పంట వెనుక రైతులను కలవండి.",
                  )}
                </p>
              </div>
              <ArrowUpRight
                className="ml-auto shrink-0 text-green/60"
                size={20}
              />
            </div>
            <span className="mk-image-caption">
              {c("Illustrative harvest photography", "సూచన కోసం పంట చిత్రం")}
            </span>
          </div>
        </div>
      </section>
      <div className="mk-value-strip">
        {[
          [Sprout, "Direct from growers", "నేరుగా రైతుల నుండి"],
          [Leaf, "Compare crops & prices", "పంటలు, ధరలను పోల్చండి"],
          [
            Handshake,
            "Collection agreed together",
            "కలిసి సేకరణను నిర్ధారించండి",
          ],
        ].map(([Icon, en, te]) => {
          const I = Icon as typeof Sprout;
          return (
            <span key={String(en)}>
              <I size={18} strokeWidth={1.6} />
              {c(String(en), String(te))}
            </span>
          );
        })}
      </div>
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mk-eyebrow">
              {c("Something for every season", "ప్రతి కాలానికి పంటలు")}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold">
              {c("Explore by category", "వర్గాల వారీగా చూడండి")}
            </h2>
          </div>
        </div>
        <div className="mk-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat[0]}
              onClick={() => {
                set("category", cat[0]);
                document
                  .getElementById("crop-results")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`mk-category ${filters.category === cat[0] ? "selected" : ""}`}
            >
              <span className={`mk-category-icon mk-category-${cat[0]}`}>
                <CategoryIcon id={cat[0]} />
              </span>
              <span className="mt-3 block text-xs font-semibold">
                {c(cat[1], cat[2])}
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-12" aria-labelledby="crop-preview-heading">
        <p className="mk-eyebrow">{c("From the vegetable basket", "కూరగాయల బుట్ట నుండి")}</p>
        <h2 id="crop-preview-heading" className="mt-2 font-heading text-3xl font-semibold">{c("Everyday crops, naturally colourful", "రోజువారీ పంటలు, సహజ రంగులు")}</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">{c("Explore sample crops below. Prices are illustrative examples, not current market rates or offers. Availability and final prices come from published farmer listings.", "క్రింద నమూనా పంటలను చూడండి. ధరలు ఉదాహరణలు మాత్రమే; ప్రస్తుత మార్కెట్ ధరలు లేదా ఆఫర్లు కావు. అందుబాటు, తుది ధరలు రైతుల లిస్టింగ్‌లలో చూడండి.")}</p>
        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CROP_PREVIEWS.map((crop) => (
            <article key={crop.id} className="group overflow-hidden rounded-3xl border border-green/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
              <div className="relative aspect-[4/3] overflow-hidden bg-green/5">
                <Image src={`/assets/marketplace-${crop.id}.webp`} alt={c(crop.en, crop.te)} fill sizes="(max-width:640px) 92vw, (max-width:1024px) 46vw, 31vw" className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-green">{c("Sample crop", "నమూనా పంట")}</span>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-2xl font-semibold">{c(crop.en, crop.te)}</h3>
                  <p className="font-semibold text-green">₹{crop.price}<span className="text-xs font-normal text-muted"> / {c("kg", "కిలో")}</span></p>
                </div>
                <p className="mt-1 text-[11px] text-muted">{c("Illustrative price", "ఉదాహరణ ధర")}</p>
                <p className="mt-3 min-h-12 text-sm leading-relaxed text-muted">{c(crop.description, crop.descriptionTe)}</p>
                <button className="mk-secondary mt-5 w-full justify-center" onClick={() => {
                  setPage(1);
                  setFilters({ ...initial, q: crop.en });
                  document.getElementById("crop-results")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
                }}>{c("Find farmer listings", "రైతుల లిస్టింగ్‌లు చూడండి")}<ArrowRight size={16} /></button>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">{c("AI-generated crop photography for illustration.", "సూచన కోసం AI రూపొందించిన పంట చిత్రాలు.")}</p>
      </section>
      <section
        id="crop-results"
        className="mk-results mx-auto max-w-7xl scroll-mt-24 px-5"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mk-eyebrow">
              {c("Meet your next harvest", "మీ తదుపరి పంటను కలవండి")}
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold">
              {c("Freshly listed crops", "తాజా పంట లిస్టింగ్‌లు")}
            </h2>
            <p className="mt-2 text-xs text-muted">
              {results.count} {c("matching listings", "సరిపోయే లిస్టింగ్‌లు")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="mk-secondary lg:hidden"
              onClick={() => setDrawer(true)}
            >
              <SlidersHorizontal size={16} />
              {c("Filters", "ఫిల్టర్లు")}
            </button>
            <select
              aria-label={c("Sort crops", "పంటలు క్రమబద్ధీకరించు")}
              className="mk-input !mt-0 !w-auto"
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value)}
            >
              {[
                ["recent", "Recently listed", "ఇటీవలి లిస్టింగ్‌లు"],
                [
                  "price-asc",
                  "Price: low to high / kg",
                  "ధర: తక్కువ నుండి / కిలో",
                ],
                [
                  "price-desc",
                  "Price: high to low / kg",
                  "ధర: ఎక్కువ నుండి / కిలో",
                ],
                ["quantity", "Quantity available", "అందుబాటులో పరిమాణం"],
              ].map((v) => (
                <option key={v[0]} value={v[0]}>
                  {c(v[1], v[2])}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(filters)
            .filter(([key, value]) => value && key !== "sort")
            .map(([key, value]) => (
              <button
                key={key}
                className="mk-chip"
                onClick={() => set(key as keyof typeof initial, "")}
              >
                {key === "category"
                  ? c(
                      ...((CATEGORIES.find((x) => x[0] === value)?.slice(
                        1,
                        3,
                      ) as [string, string]) || [value, value]),
                    )
                  : value === "1"
                    ? c(
                        key === "organic" ? "Organic" : "Verified",
                        key === "organic" ? "సేంద్రియ" : "ధృవీకరించారు",
                      )
                    : value}
                <X size={12} />
              </button>
            ))}
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[225px_minmax(0,1fr)]">
          <aside className="mk-panel mk-filter-panel hidden lg:block">
            {filterFields}
          </aside>
          <div>
            {error ? (
              <Empty
                title={c("We couldn’t load crops", "పంటలు లోడ్ కాలేదు")}
                body={error}
                action={
                  <button
                    className="mk-btn"
                    onClick={() => setRetry((x) => x + 1)}
                  >
                    {c("Try again", "మళ్లీ ప్రయత్నించు")}
                  </button>
                }
              />
            ) : loading && page === 1 ? (
              <Skeleton />
            ) : results.items.length ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {results.items.map((l) => (
                    <ProductCard key={l.id} listing={l} />
                  ))}
                </div>
                {results.hasMore && (
                  <button
                    disabled={loading}
                    className="mk-secondary mx-auto mt-7 flex"
                    onClick={() => setPage((x) => x + 1)}
                  >
                    {loading
                      ? c("Loading…", "లోడ్ అవుతోంది…")
                      : c("Load more crops", "మరిన్ని పంటలు")}
                  </button>
                )}
              </>
            ) : (
              <Empty
                title={c(
                  "Your next harvest is on its way",
                  "మీ తదుపరి పంట రాబోతోంది",
                )}
                body={c(
                  "No published crops match your search yet. Try another location, clear your filters, or be the first farmer to list a harvest.",
                  "మీ శోధనకు సరిపోయే పంటలు ఇంకా లేవు. వేరే ప్రాంతం ఎంచుకోండి, ఫిల్టర్లు తొలగించండి లేదా మొదటి పంట లిస్టింగ్ జోడించండి.",
                )}
                action={
                  <Link href="/marketplace/sell" className="mk-btn">
                    {c("Sell your harvest", "మీ పంట అమ్మండి")}
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>
      <dialog
        ref={dialog}
        onCancel={() => setDrawer(false)}
        className="mk-drawer"
      >
        <div className="mb-5 flex justify-end">
          <button
            aria-label={c("Close filters", "ఫిల్టర్లు మూసివేయి")}
            onClick={() => setDrawer(false)}
            className="mk-icon"
          >
            <X />
          </button>
        </div>
        {filterFields}
        <button className="mk-btn mt-6 w-full" onClick={() => setDrawer(false)}>
          {c("Show crops", "పంటలు చూపించు")}
        </button>
      </dialog>
      {filters.location && results.items.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-14">
          <h2 className="mb-2 font-heading text-2xl font-semibold">
            {c("From your area", "మీ ప్రాంతం నుండి")}
          </h2>
          <p className="mb-5 text-xs text-muted">
            {c(
              "Matching the location you selected",
              "మీరు ఎంచుకున్న ప్రాంతానికి సరిపోయేవి",
            )}
            : {filters.location}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.items.slice(0, 3).map((l) => (
              <ProductCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
      {seasonal.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-14">
          <h2 className="mb-2 font-heading text-2xl font-semibold">
            {c("This season’s harvest", "ఈ కాలపు పంట")}
          </h2>
          <p className="mb-5 text-xs text-muted">
            {c(
              "Harvest dates within the last 90 days, as supplied by farmers.",
              "రైతులు తెలిపిన గత 90 రోజుల కోత తేదీల ఆధారంగా.",
            )}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {seasonal.map((l) => (
              <ProductCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-14">
          <h2 className="mb-6 font-heading text-2xl font-semibold">
            {c("Recently viewed", "ఇటీవల చూసినవి")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((l) => (
              <ProductCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
      <section className="mx-auto mt-14 max-w-7xl px-5">
        <div className="mk-sell-banner">
          <div>
            <p className="text-xs uppercase tracking-[.15em] text-white/70">
              {c(
                "Your harvest deserves a wider market",
                "మీ పంటకు విస్తృత మార్కెట్",
              )}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold">
              {c(
                "Grow with care. Sell with confidence.",
                "శ్రద్ధతో పండించండి. నమ్మకంతో అమ్మండి.",
              )}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-white/75">
              {c(
                "Add crop photos, set your price and connect with buyers. You stay in control of your harvest.",
                "పంట చిత్రాలు జోడించండి, ధర నిర్ణయించి కొనుగోలుదారులతో కలవండి. మీ పంటపై మీ నియంత్రణ.",
              )}
            </p>
          </div>
          <Link
            href="/marketplace/sell"
            className="mk-btn !bg-[#facc15] !text-forest"
          >
            {c("List your first crop", "మీ మొదటి పంట లిస్టింగ్")}
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pt-12 sm:grid-cols-3">
        {[
          [
            Sprout,
            "Choose your crops",
            "మీ పంటలు ఎంచుకోండి",
            "Explore farm listings and compare price per kilogram.",
            "లిస్టింగ్‌లు చూసి కిలో ధరలను పోల్చండి.",
          ],
          [
            Handshake,
            "Connect with the farmer",
            "రైతుతో కలవండి",
            "Send a purchase request or ask a question before committing.",
            "కొనుగోలు అభ్యర్థన పంపండి లేదా ముందుగా ప్రశ్న అడగండి.",
          ],
          [
            Truck,
            "Agree on collection",
            "సేకరణను నిర్ధారించండి",
            "Confirm quality, pickup, delivery and all charges with your seller.",
            "నాణ్యత, పికప్, డెలివరీ, ఛార్జీలను విక్రేతతో నిర్ధారించండి.",
          ],
        ].map(([Icon, title, te, body, bte], i) => {
          const I = Icon as typeof Sprout;
          return (
            <div key={i} className="mk-panel">
              <I size={25} className="mb-4 text-green" />
              <h3 className="font-semibold">
                {c(title as string, te as string)}
              </h3>
              <p className="mt-2 text-xs leading-6 text-muted">
                {c(body as string, bte as string)}
              </p>
            </div>
          );
        })}
      </section>
    </>
  );
}
export function Storefront({ id }: { id: string }) {
  const { api, c } = useMarket();
  const [data, setData] = useState<{
      farmer: User;
      items: Listing[];
      hasMore: boolean;
    } | null>(null),
    [error, setError] = useState(""),
    [page, setPage] = useState(1);
  useEffect(() => {
    api<{ farmer: User; items: Listing[]; hasMore: boolean }>(
      `farmer/${id}?page=${page}`,
    )
      .then((d) =>
        setData((p) => ({
          ...d,
          items: page > 1 ? [...(p?.items || []), ...d.items] : d.items,
        })),
      )
      .catch((e) => setError(e.message));
  }, [id, page, api]);
  return (
    <div className="mk-container">
      {error ? (
        <Empty
          title={c("Farm unavailable", "పొలం అందుబాటులో లేదు")}
          body={error}
        />
      ) : !data ? (
        <Skeleton />
      ) : (
        <>
          <PageHeading
            eyebrow={c("Farmer storefront", "రైతు దుకాణం")}
            title={data.farmer.name}
            body={`${data.farmer.village} ${data.farmer.district} ${data.farmer.state}`}
          />
          {data.farmer.photo && (
            <Image
              src={data.farmer.photo}
              alt={data.farmer.name}
              width={160}
              height={120}
              unoptimized
              className="mb-5 rounded-2xl"
            />
          )}
          <p className="mb-6 text-sm leading-7 text-muted">{data.farmer.bio}</p>
          {data.farmer.verified === 1 && (
            <p className="mb-5 text-sm font-semibold text-green">
              {c("Seller verified by Manakrishi", "మనకృషి ధృవీకరించిన విక్రేత")}
            </p>
          )}
          {data.farmer.publicContact && (
            <a
              href={`tel:${data.farmer.publicContact}`}
              className="mk-secondary mb-6"
            >
              {c(
                "Call farm business number",
                "పొలం వ్యాపార నంబర్‌కు కాల్ చేయండి",
              )}
            </a>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((l) => (
              <ProductCard key={l.id} listing={l} />
            ))}
          </div>
          {!data.items.length && (
            <Empty
              title={c(
                "No crops available today",
                "ఈ రోజు పంటలు అందుబాటులో లేవు",
              )}
              body={c(
                "Check back for this farm’s next harvest.",
                "ఈ రైతు తదుపరి పంట కోసం మళ్లీ చూడండి.",
              )}
            />
          )}
          {data.hasMore && (
            <button
              className="mk-secondary mt-5"
              onClick={() => setPage((p) => p + 1)}
            >
              {c("Load more", "మరిన్ని చూడండి")}
            </button>
          )}
        </>
      )}
    </div>
  );
}
