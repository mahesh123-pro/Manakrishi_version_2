"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  money,
  type Listing,
  type Order,
  type User,
} from "@/lib/marketplace/types";
import {
  useMarket,
  AuthGate,
  Empty,
  PageHeading,
  Skeleton,
} from "./MarketProvider";
import { ProductCard } from "./ProductCard";

export function Saved() {
  return (
    <div className="mk-container">
      <AuthGate>
        <SavedInner />
      </AuthGate>
    </div>
  );
}
function SavedInner() {
  const { api, c, revision } = useMarket();
  const [items, setItems] = useState<Listing[] | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api<{ items: Listing[] }>("wishlist")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message));
  }, [api, revision]);
  return (
    <>
      <PageHeading title={c("Harvests worth saving", "సేవ్ చేయదగిన పంటలు")} />
      {error ? (
        <p className="mk-error" role="alert">
          {error}
        </p>
      ) : !items ? (
        <Skeleton />
      ) : !items.length ? (
        <Empty
          title={c(
            "Keep your favourites here",
            "మీకు నచ్చినవి ఇక్కడ సేవ్ చేయండి",
          )}
          body={c(
            "Tap the heart on a crop to save it for later.",
            "తర్వాత చూడడానికి పంటపై హృదయాన్ని నొక్కండి.",
          )}
          action={
            <Link className="mk-btn" href="/marketplace">
              {c("Explore crops", "పంటలు చూడండి")}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <ProductCard
              listing={l}
              key={l.id}
              onRemove={() => setItems(items.filter((i) => i.id !== l.id))}
            />
          ))}
        </div>
      )}
    </>
  );
}
export function MyListings() {
  return (
    <div className="mk-container">
      <AuthGate farmer>
        <MyListingsInner />
      </AuthGate>
    </div>
  );
}
function MyListingsInner() {
  const { api, c, status, notice, revision, changed } = useMarket();
  const [items, setItems] = useState<Listing[] | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api<{ items: Listing[] }>("my-listings")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message));
  }, [api, revision]);
  async function action(id: string, action: string) {
    if (
      action === "delete" &&
      !window.confirm(
        c(
          "Delete this listing? Its completed order history will be kept.",
          "లిస్టింగ్ తొలగించాలా? ఆర్డర్ చరిత్ర అలాగే ఉంటుంది.",
        ),
      )
    )
      return;
    try {
      await api("listing-action", { id, action });
      changed();
      notice(c("Listing updated", "లిస్టింగ్ నవీకరించబడింది"));
    } catch (e) {
      notice((e as Error).message);
    }
  }
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading
          title={c("Your harvest, your workspace", "మీ పంట, మీ కార్యస్థలం")}
          body={c(
            "Manage current stock and review status. Every change to a live listing goes back for approval.",
            "స్టాక్, సమీక్ష స్థితి నిర్వహించండి. లైవ్ లిస్టింగ్ మార్పులు మళ్లీ ఆమోదానికి వెళ్తాయి.",
          )}
        />
        <Link href="/marketplace/sell" className="mk-btn">
          + {c("New listing", "కొత్త లిస్టింగ్")}
        </Link>
      </div>
      {error ? (
        <p role="alert" className="mk-error">
          {error}
        </p>
      ) : !items ? (
        <Skeleton />
      ) : !items.length ? (
        <Empty
          title={c(
            "Let’s bring your harvest to market",
            "మీ పంటను మార్కెట్‌కు తీసుకువద్దాం",
          )}
          body={c(
            "Start with a few clear crop photos and accurate stock information.",
            "స్పష్టమైన పంట చిత్రాలు, ఖచ్చితమైన స్టాక్ వివరాలతో ప్రారంభించండి.",
          )}
          action={
            <Link className="mk-btn" href="/marketplace/sell">
              {c("List a crop", "పంట జోడించండి")}
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((l) => (
            <article key={l.id} className="mk-panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-semibold">
                    {l.crop || c("Untitled draft", "పేరు లేని డ్రాఫ్ట్")}
                  </h2>
                  <p className="mt-2 text-xs text-muted">
                    {money(Math.round(l.price * 100))} / {l.unit} · {l.quantity}{" "}
                    {l.unit} {c("available", "స్టాక్")} · {l.views}{" "}
                    {c("page views", "పేజీ వీక్షణలు")}
                  </p>
                </div>
                <span className="mk-chip">{status(l.status)}</span>
              </div>
              {l.moderation && (
                <p className="mt-4 rounded-xl bg-yellow-50 p-3 text-xs leading-6">
                  {c("Review note", "సమీక్ష సూచన")}: {l.moderation}
                </p>
              )}
              {l.quantity < l.minimum && (
                <p className="mt-3 text-xs text-amber-800">
                  {c(
                    "Low stock: below your minimum order. This crop is hidden from discovery.",
                    "తక్కువ స్టాక్: కనీస ఆర్డర్ కంటే తక్కువ. ఈ పంట శోధనలో కనిపించదు.",
                  )}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/marketplace/sell?edit=${l.id}`}
                  className="mk-secondary"
                >
                  {c("Edit / update stock", "సవరించు / స్టాక్ నవీకరించు")}
                </Link>
                <Link
                  href={`/marketplace/product/${l.id}`}
                  className="mk-secondary"
                >
                  {c("Preview", "ప్రివ్యూ")}
                </Link>
                {l.status === "published" && (
                  <button
                    className="mk-secondary"
                    onClick={() => action(l.id, "pause")}
                  >
                    {c("Pause", "నిలిపివేయి")}
                  </button>
                )}
                {["paused", "unavailable", "rejected"].includes(l.status) && (
                  <button
                    className="mk-secondary"
                    onClick={() => action(l.id, "resume")}
                  >
                    {c("Resubmit for review", "మళ్లీ సమీక్షకు పంపు")}
                  </button>
                )}
                <button
                  className="mk-secondary"
                  onClick={() => action(l.id, "unavailable")}
                >
                  {c("Mark unavailable", "అందుబాటులో లేదని గుర్తించు")}
                </button>
                <button
                  className="mk-secondary !text-red-700"
                  onClick={() => action(l.id, "delete")}
                >
                  {c("Delete", "తొలగించు")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <Link href="/marketplace/orders" className="mk-secondary mt-7">
        {c("Incoming orders & enquiries", "వచ్చిన ఆర్డర్లు & విచారణలు")}
      </Link>
    </>
  );
}
type Enquiry = {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  crop: string;
  buyerName: string;
  message: string;
  reply: string;
};
export function Orders() {
  return (
    <div className="mk-container">
      <AuthGate>
        <OrdersInner />
      </AuthGate>
    </div>
  );
}
function OrdersInner() {
  const { api, user, c, status, notice, changed, revision } = useMarket();
  const [items, setItems] = useState<Order[] | null>(null),
    [enquiries, setEnquiries] = useState<Enquiry[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([
      api<{ items: Order[] }>("orders"),
      api<{ items: Enquiry[] }>("enquiries"),
    ])
      .then(([o, e]) => {
        setItems(o.items);
        setEnquiries(e.items);
      })
      .catch((e) => setError(e.message));
  }, [api, revision]);
  async function action(id: string, target: string) {
    let reason = "";
    if (["rejected", "cancelled"].includes(target)) {
      reason =
        window.prompt(c("Please give a reason", "దయచేసి కారణం ఇవ్వండి")) || "";
      if (!reason) return;
    }
    setBusy(true);
    try {
      await api("order-action", { id, status: target, reason });
      changed();
      notice(c("Order updated", "ఆర్డర్ నవీకరించబడింది"));
    } catch (e) {
      notice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const actions: Record<string, string[]> = {
    awaiting_confirmation: ["confirmed", "rejected"],
    confirmed: ["preparing"],
    preparing: ["ready"],
    ready: ["shipped", "delivered"],
    shipped: ["delivered"],
  };
  return (
    <>
      <PageHeading
        title={c("Orders & conversations", "ఆర్డర్లు & సంభాషణలు")}
        body={c(
          "Purchase requests remain pending until the farmer confirms. Stock reservations expire after 24 hours.",
          "రైతు నిర్ధారణ వరకు కొనుగోలు అభ్యర్థనలు పెండింగ్‌లో ఉంటాయి. స్టాక్ రిజర్వేషన్ 24 గంటల తర్వాత ముగుస్తుంది.",
        )}
      />
      {error ? (
        <p role="alert" className="mk-error">
          {error}
        </p>
      ) : !items ? (
        <Skeleton />
      ) : !items.length ? (
        <Empty
          title={c("No orders yet", "ఇంకా ఆర్డర్లు లేవు")}
          body={c(
            "Your purchase requests and incoming farm orders will appear here.",
            "మీ కొనుగోలు అభ్యర్థనలు మరియు వచ్చిన ఆర్డర్లు ఇక్కడ కనిపిస్తాయి.",
          )}
        />
      ) : (
        <div className="space-y-5">
          {items.map((o) => (
            <article key={o.id} className="mk-panel">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted">
                    {c("Order request", "ఆర్డర్ అభ్యర్థన")}
                  </p>
                  <p className="mt-2 break-all text-xs font-semibold">{o.id}</p>
                  <p className="mt-2 text-xs text-muted">
                    {o.createdAt.slice(0, 10)} · {c("Farmer", "రైతు")}:{" "}
                    {o.seller}
                  </p>
                </div>
                <div className="text-right">
                  <span className="mk-chip">{status(o.status)}</span>
                  <p className="mt-2 font-semibold text-green">
                    {money(o.total)}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">
                    {c(
                      "Produce value · payment arranged separately",
                      "పంట విలువ · చెల్లింపు వేరుగా",
                    )}
                  </p>
                </div>
              </div>
              <div className="my-5 space-y-3 border-y border-green/10 py-4">
                {o.items.map((i) => (
                  <div
                    key={i.listingId}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span>
                      {i.crop} {i.variety}
                      <span className="mt-1 block text-[11px] text-muted">
                        {i.quantity} {i.unit} × {money(i.price)} / {i.unit}
                      </span>
                    </span>
                    <b>{money(i.subtotal)}</b>
                  </div>
                ))}
              </div>
              <div className="text-xs leading-7 text-muted">
                <p>
                  {c("Buyer contact", "కొనుగోలుదారు సంప్రదింపు")}: {o.name} ·{" "}
                  {o.phone}
                </p>
                <p>
                  {c("Collection method", "సేకరణ పద్ధతి")}:{" "}
                  {o.fulfillment === "pickup"
                    ? c("Buyer pickup", "కొనుగోలుదారు పికప్")
                    : c("Seller delivery", "విక్రేత డెలివరీ")}
                </p>
                {o.address && (
                  <p>
                    {c("Delivery address", "డెలివరీ చిరునామా")}: {o.address}{" "}
                    {o.pin}
                  </p>
                )}
                {"sellerContact" in o && (
                  <p>
                    {c("Seller contact", "విక్రేత సంప్రదింపు")}:{" "}
                    {String(o.sellerContact)} ·{" "}
                    {String(
                      (o as unknown as Record<string, string>).pickupAddress ||
                        "",
                    )}
                  </p>
                )}
                {o.reason && (
                  <p>
                    {c("Note", "సూచన")}: {o.reason}
                  </p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {o.sellerId === user!.id &&
                  (actions[o.status] || [])
                    .filter(
                      (s) =>
                        o.status !== "ready" ||
                        s ===
                          (o.fulfillment === "delivery"
                            ? "shipped"
                            : "delivered"),
                    )
                    .map((s) => (
                      <button
                        disabled={busy}
                        key={s}
                        onClick={() => action(o.id, s)}
                        className="mk-secondary"
                      >
                        {status(s)}
                      </button>
                    ))}
                {o.buyerId === user!.id &&
                  o.status === "awaiting_confirmation" && (
                    <button
                      disabled={busy}
                      className="mk-secondary"
                      onClick={() => action(o.id, "cancelled")}
                    >
                      {c("Cancel request", "అభ్యర్థన రద్దు")}
                    </button>
                  )}
                <Link href="/support" className="mk-secondary">
                  {c("Order support / dispute", "ఆర్డర్ సహాయం / వివాదం")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
      <section className="mt-12">
        <h2 className="mb-5 font-heading text-2xl">
          {c("Enquiries", "విచారణలు")}
        </h2>
        {!enquiries.length ? (
          <p className="text-sm text-muted">
            {c(
              "Questions and quote requests will appear here.",
              "ప్రశ్నలు మరియు ధర అభ్యర్థనలు ఇక్కడ కనిపిస్తాయి.",
            )}
          </p>
        ) : (
          <div className="space-y-4">
            {enquiries.map((e) => (
              <div key={e.id} className="mk-panel">
                <Link
                  href={`/marketplace/product/${e.listingId}`}
                  className="font-semibold"
                >
                  {e.crop}
                </Link>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                  {e.message}
                </p>
                {e.reply && (
                  <p className="mk-success mt-3">
                    {c("Farmer reply", "రైతు సమాధానం")}: {e.reply}
                  </p>
                )}
                {e.sellerId === user!.id && (
                  <button
                    className="mk-secondary mt-4"
                    onClick={async () => {
                      const reply = window.prompt(
                        c("Reply to the buyer", "కొనుగోలుదారుకు సమాధానం"),
                      );
                      if (!reply) return;
                      try {
                        await api("enquiry-reply", { id: e.id, reply });
                        changed();
                      } catch (e) {
                        notice((e as Error).message);
                      }
                    }}
                  >
                    {c("Reply", "సమాధానం")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
const EVENTS: Record<string, [string, string]> = {
  low_stock: [
    "Your crop stock is below its minimum order quantity.",
    "మీ పంట స్టాక్ కనీస ఆర్డర్ కంటే తక్కువగా ఉంది.",
  ],
  new_order: [
    "A new purchase request arrived.",
    "కొత్త కొనుగోలు అభ్యర్థన వచ్చింది.",
  ],
  order_expired: [
    "An unconfirmed request expired and its stock was released.",
    "నిర్ధారించని అభ్యర్థన గడువు ముగిసింది, స్టాక్ విడుదలైంది.",
  ],
  new_enquiry: [
    "A buyer asked about your harvest.",
    "కొనుగోలుదారు మీ పంట గురించి అడిగారు.",
  ],
  enquiry_reply: [
    "The farmer replied to your enquiry.",
    "మీ విచారణకు రైతు సమాధానం ఇచ్చారు.",
  ],
  listing_published: [
    "Your crop listing was approved.",
    "మీ పంట లిస్టింగ్ ఆమోదించబడింది.",
  ],
  listing_rejected: [
    "Your crop listing was rejected. Check the review note.",
    "మీ పంట లిస్టింగ్ తిరస్కరించబడింది. సమీక్ష సూచన చూడండి.",
  ],
  listing_corrections: [
    "Changes were requested for your crop listing.",
    "మీ పంట లిస్టింగ్‌కు మార్పులు అవసరం.",
  ],
};
export function Notifications() {
  return (
    <div className="mk-container">
      <AuthGate>
        <NotificationInner />
      </AuthGate>
    </div>
  );
}
function NotificationInner() {
  const { api, c, status } = useMarket();
  const [items, setItems] = useState<
      { id: string; message: string; href: string; createdAt: string }[]
    >([]),
    [error, setError] = useState("");
  useEffect(() => {
    api<{ items: typeof items }>("notifications")
      .then((d) => {
        setItems(d.items);
        return api("notifications", {});
      })
      .catch((e) => setError(e.message));
  }, [api]);
  return (
    <>
      <PageHeading
        title={c("Your market updates", "మీ మార్కెట్ నవీకరణలు")}
        body={c(
          "In-app updates only. Email, SMS and WhatsApp delivery are not connected.",
          "యాప్‌లో నవీకరణలు మాత్రమే. ఇమెయిల్, SMS, వాట్సాప్ పంపిణీ అనుసంధానం కాలేదు.",
        )}
      />
      {error && (
        <p role="alert" className="mk-error">
          {error}
        </p>
      )}
      {items.map((i) => (
        <Link key={i.id} href={i.href} className="mk-panel mb-3 block">
          <p className="text-sm">
            {EVENTS[i.message]
              ? c(...EVENTS[i.message])
              : i.message.startsWith("order_")
                ? `${c("Order status", "ఆర్డర్ స్థితి")}: ${status(i.message.slice(6))}`
                : c("Marketplace update", "మార్కెట్ నవీకరణ")}
          </p>
          <p className="mt-2 text-[10px] text-muted">
            {i.createdAt.slice(0, 10)}
          </p>
        </Link>
      ))}
      {!items.length && !error && (
        <Empty
          title={c("You’re all caught up", "మీరు అన్నీ చూశారు")}
          body={c(
            "Updates about listings, orders and enquiries will appear here.",
            "లిస్టింగ్‌లు, ఆర్డర్లు, విచారణల నవీకరణలు ఇక్కడ కనిపిస్తాయి.",
          )}
        />
      )}
    </>
  );
}
export function Rules({
  settings,
}: {
  settings: {
    disabledCategories: string[];
    disabledUnits: string[];
    rules: string;
  };
}) {
  const { api, c, notice, changed } = useMarket();
  const [draft, setDraft] = useState(settings),
    [busy, setBusy] = useState(false);
  return (
    <div className="mk-panel mb-7">
      <h2 className="mb-5 font-heading text-xl">
        {c("Supported categories and units", "అనుమతించిన వర్గాలు, యూనిట్లు")}
      </h2>
      <p className="mb-5 text-xs text-muted">
        {c(
          "Uncheck to stop new publications in that category or unit. Existing listings remain available.",
          "కొత్త ప్రచురణలు నిలిపేందుకు వర్గం లేదా యూనిట్ ఎంపిక తొలగించండి. పాత లిస్టింగ్‌లు అలాగే ఉంటాయి.",
        )}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <label key={cat[0]} className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={!draft.disabledCategories.includes(cat[0])}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  disabledCategories: e.target.checked
                    ? d.disabledCategories.filter((x) => x !== cat[0])
                    : [...d.disabledCategories, cat[0]],
                }))
              }
            />
            {c(cat[1], cat[2])}
          </label>
        ))}
      </div>
      <div className="my-6 flex gap-6">
        {["kg", "quintal", "tonne"].map((unit) => (
          <label key={unit} className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={!draft.disabledUnits.includes(unit)}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  disabledUnits: e.target.checked
                    ? d.disabledUnits.filter((x) => x !== unit)
                    : [...d.disabledUnits, unit],
                }))
              }
            />
            {unit}
          </label>
        ))}
      </div>
      <label className="mk-label">
        {c(
          "Additional public marketplace rules",
          "అదనపు పబ్లిక్ మార్కెట్ నిబంధనలు",
        )}
        <textarea
          rows={5}
          maxLength={2000}
          className="mk-input"
          value={draft.rules}
          onChange={(e) => setDraft((d) => ({ ...d, rules: e.target.value }))}
        />
      </label>
      <button
        disabled={busy}
        className="mk-btn mt-5"
        onClick={async () => {
          setBusy(true);
          try {
            await api("admin-settings", draft);
            changed();
            notice(
              c("Marketplace rules saved", "మార్కెట్ నిబంధనలు సేవ్ చేయబడ్డాయి"),
            );
          } catch (e) {
            notice((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {c("Save rules", "నిబంధనలు సేవ్ చేయి")}
      </button>
    </div>
  );
}
