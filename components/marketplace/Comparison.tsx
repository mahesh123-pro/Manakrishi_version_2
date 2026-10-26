"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Columns3, RefreshCw, X } from "lucide-react";
import { UNITS, money, type Listing } from "@/lib/marketplace/types";
import {
  cropPricePerKg,
  minimumProduceCost,
  readCompareIds,
} from "@/lib/marketplace/browse-tools";

type Comparison = {
  items: Listing[];
  busy: boolean;
  toggle: (listing: Listing) => void;
  open: () => void;
};
const Context = createContext<Comparison | null>(null);
export function useComparison() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing comparison provider");
  return value;
}

export function ComparisonProvider({
  children,
  api,
  c,
  notice,
}: {
  children: ReactNode;
  api: <T>(path: string) => Promise<T>;
  c: (en: string, te: string) => string;
  notice: (message: string) => void;
}) {
  const [items, setItems] = useState<Listing[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(true);
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let alive = true;
    setBusy(true);
    setReady(false);
    let ids: string[] = [];
    try {
      ids = readCompareIds(localStorage.getItem("mk-compare"));
    } catch {}
    Promise.all(
      ids.map(async (id) => {
        try {
          const data = await api<{ listing: Listing }>(`product/${id}`);
          return data.listing.status === "published" ? data.listing : null;
        } catch {
          return null;
        }
      }),
    ).then((listings) => {
      if (!alive) return;
      setItems(listings.filter((l): l is Listing => l !== null));
      setReady(true);
      setBusy(false);
      if (listings.some((l) => !l))
        notice(
          c(
            "Some comparison crops could not be loaded. Add them again when available.",
            "కొన్ని పోలిక పంటలు లోడ్ కాలేదు. అందుబాటులో ఉన్నప్పుడు మళ్లీ జోడించండి.",
          ),
        );
    });
    return () => {
      alive = false;
    };
  }, [api, c, notice]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        "mk-compare",
        JSON.stringify(items.map((l) => l.id)),
      );
    } catch {
      /* Comparison still works for this visit when storage is disabled. */
    }
  }, [items, ready]);

  useEffect(() => {
    if (opened) dialog.current?.showModal();
    else dialog.current?.close();
  }, [opened]);

  function toggle(listing: Listing) {
    if (busy) return;
    if (items.some((l) => l.id === listing.id)) {
      setItems((prev) => prev.filter((l) => l.id !== listing.id));
      return;
    }
    if (listing.status !== "published") return;
    if (items.length >= 3) {
      notice(
        c(
          "Compare up to three crops. Remove one to add another.",
          "మూడు పంటలను పోల్చవచ్చు. మరొకటి జోడించడానికి ఒకటి తొలగించండి.",
        ),
      );
      return;
    }
    setItems((prev) => [...prev, listing]);
    notice(c("Crop added to comparison", "పోలికకు పంట జోడించబడింది"));
  }

  async function refresh() {
    if (busy || !items.length) return;
    setBusy(true);
    setError("");
    try {
      const fresh = await Promise.all(
        items.map(async (l) => {
          const data = await api<{ listing: Listing }>(`product/${l.id}`);
          if (data.listing.status !== "published")
            throw new Error(
              c(
                "A selected crop is no longer published. Remove it and retry.",
                "ఎంచుకున్న పంట ఇప్పుడు ప్రచురణలో లేదు. దాన్ని తొలగించి మళ్లీ ప్రయత్నించండి.",
              ),
            );
          return data.listing;
        }),
      );
      setItems(fresh);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const rows: [string, (listing: Listing) => ReactNode][] = [
    [
      c("Price per kg", "కిలో ధర"),
      (l) => (
        <strong className="text-green">
          {money(Math.round(cropPricePerKg(l) * 100))}
        </strong>
      ),
    ],
    [
      c("Listed unit price", "యూనిట్ ధర"),
      (l) => `${money(Math.round(l.price * 100))} / ${l.unit}`,
    ],
    [
      c("Minimum order", "కనీస ఆర్డర్"),
      (l) =>
        `${l.minimum} ${l.unit} (${(l.minimum * UNITS[l.unit]).toLocaleString("en-IN", { maximumFractionDigits: 3 })} kg)`,
    ],
    [
      c("Minimum produce subtotal", "కనీస పంట ఉపమొత్తం"),
      (l) => money(minimumProduceCost(l)),
    ],
    [
      c("Available stock", "అందుబాటులో స్టాక్"),
      (l) => `${l.quantity} ${l.unit}`,
    ],
    [
      c("Variety / grade", "రకం / గ్రేడ్"),
      (l) => [l.variety, l.grade].filter(Boolean).join(" · ") || "—",
    ],
    [c("Seller", "విక్రేత"), (l) => l.seller],
    [
      c("Location", "ప్రాంతం"),
      (l) => [l.village, l.district, l.state].filter(Boolean).join(", "),
    ],
    [
      c("Seller verified", "విక్రేత ధృవీకరణ"),
      (l) =>
        l.verified === 1
          ? c("Verified", "ధృవీకరించారు")
          : c("Not verified", "ధృవీకరించలేదు"),
    ],
    [
      c("Growing method", "సాగు పద్ధతి"),
      (l) =>
        l.organic
          ? c("Organic · seller declared", "సేంద్రియ · విక్రేత తెలిపినది")
          : c("Conventional / unspecified", "సాధారణ / తెలియజేయలేదు"),
    ],
    [
      c("Harvest date", "కోత తేదీ"),
      (l) => l.harvest || c("Ask the farmer", "రైతును అడగండి"),
    ],
    [
      c("Available from", "అందుబాటులో తేదీ"),
      (l) => l.availableFrom || c("Ask the farmer", "రైతును అడగండి"),
    ],
    [
      c("Collection", "సేకరణ"),
      (l) =>
        l.fulfillment === "both"
          ? c("Pickup or seller delivery", "పికప్ లేదా విక్రేత డెలివరీ")
          : l.fulfillment === "delivery"
            ? c("Seller delivery", "విక్రేత డెలివరీ")
            : c("Buyer pickup", "కొనుగోలుదారు పికప్"),
    ],
  ];

  return (
    <Context.Provider
      value={{
        items,
        busy,
        toggle,
        open: () => {
          setOpened(true);
          void refresh();
        },
      }}
    >
      {children}
      {items.length > 0 && (
        <aside
          className="fixed bottom-24 left-1/2 z-40 flex w-[calc(100%-32px)] max-w-xl -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-2xl border border-green/20 bg-white p-4 text-forest shadow-xl"
          aria-label={c("Crop comparison", "పంటల పోలిక")}
        >
          <div>
            <p className="text-sm font-semibold">
              {c("Compare crops", "పంటలను పోల్చండి")} · {items.length}/3
            </p>
            <p className="mt-1 max-w-64 truncate text-xs text-muted">
              {items.map((l) => l.crop).join(" · ")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="mk-btn"
              disabled={busy || items.length < 2}
              onClick={() => {
                setOpened(true);
                void refresh();
              }}
            >
              <Columns3 size={15} />
              {c("Compare", "పోల్చండి")}
            </button>
            <button
              className="mk-secondary"
              disabled={busy}
              onClick={() => setItems([])}
            >
              {c("Clear", "తొలగించండి")}
            </button>
          </div>
        </aside>
      )}
      <dialog
        ref={dialog}
        className="mk-comparison-dialog"
        aria-labelledby="comparison-title"
        onCancel={() => setOpened(false)}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mk-eyebrow">
              {c("Make an informed choice", "తెలుసుకొని ఎంచుకోండి")}
            </p>
            <h2
              id="comparison-title"
              className="mt-2 font-heading text-2xl font-semibold"
            >
              {c("Compare your crops", "మీ పంటలను పోల్చండి")}
            </h2>
          </div>
          <button
            className="mk-icon"
            aria-label={c("Close comparison", "పోలిక మూసివేయండి")}
            onClick={() => setOpened(false)}
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-xs leading-6 text-muted">
          {c(
            "Prices per kg are rounded for comparison. Subtotals cover produce only; confirm availability, quality, delivery, taxes and all charges with the seller before ordering.",
            "పోలిక కోసం కిలో ధరలు రౌండ్ చేయబడ్డాయి. ఉపమొత్తం పంటకు మాత్రమే; ఆర్డర్‌కు ముందు లభ్యత, నాణ్యత, డెలివరీ, పన్నులు, అన్ని ఛార్జీలను విక్రేతతో నిర్ధారించండి.",
          )}
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {items.map((l) => (
            <button
              key={l.id}
              disabled={busy}
              className="mk-secondary"
              onClick={() => toggle(l)}
              aria-label={c(
                `Remove ${l.crop} from comparison`,
                `${l.crop} పోలిక నుండి తొలగించండి`,
              )}
            >
              {l.crop}
              <X size={13} />
            </button>
          ))}
        </div>
        {busy ? (
          <p role="status" className="py-8 text-sm">
            {c("Refreshing crop details…", "పంట వివరాలు రిఫ్రెష్ అవుతున్నాయి…")}
          </p>
        ) : error ? (
          <div role="alert" className="mk-error mb-4">
            {error}
          </div>
        ) : !items.length ? (
          <p className="py-8 text-sm">
            {c(
              "Choose crops from listings to compare them.",
              "పోల్చడానికి లిస్టింగ్‌ల నుండి పంటలు ఎంచుకోండి.",
            )}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <caption className="sr-only">
                {c(
                  "Crop prices, minimum orders and seller details",
                  "పంట ధరలు, కనీస ఆర్డర్లు, విక్రేత వివరాలు",
                )}
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="min-w-40 border-b border-green/15 p-3"
                  >
                    {c("Details", "వివరాలు")}
                  </th>
                  {items.map((l) => (
                    <th
                      scope="col"
                      key={l.id}
                      className="min-w-48 border-b border-green/15 p-3"
                    >
                      <Image
                        src={l.images[0] || "/assets/drone-paddy.png"}
                        alt=""
                        width={160}
                        height={100}
                        unoptimized
                        className="mb-3 h-24 w-40 rounded-xl object-cover"
                      />
                      <Link
                        href={`/marketplace/product/${l.id}`}
                        className="font-heading text-lg text-green"
                        onClick={() => setOpened(false)}
                      >
                        {l.crop}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label}>
                    <th
                      scope="row"
                      className="border-b border-green/10 p-3 font-medium text-muted"
                    >
                      {label}
                    </th>
                    {items.map((l) => (
                      <td
                        key={l.id}
                        className="border-b border-green/10 p-3 leading-6"
                      >
                        {value(l)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            className="mk-secondary"
            disabled={busy || !items.length}
            onClick={() => void refresh()}
          >
            <RefreshCw size={14} />
            {c("Refresh details", "వివరాలు రిఫ్రెష్ చేయండి")}
          </button>
          <button className="mk-btn" onClick={() => setOpened(false)}>
            {c("Continue browsing", "బ్రౌజింగ్ కొనసాగించండి")}
          </button>
        </div>
      </dialog>
    </Context.Provider>
  );
}
