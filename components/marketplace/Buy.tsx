"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Minus, Plus, ShoppingBag, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { money, type Listing, type CartItem } from "@/lib/marketplace/types";
import {
  useMarket,
  AuthGate,
  PageHeading,
  Empty,
  Skeleton,
} from "./MarketProvider";
import { ProductCard } from "./ProductCard";
export function Product({ id }: { id: string }) {
  const { api, c, notice, changed } = useMarket(),
    router = useRouter();
  const [l, setL] = useState<Listing | null>(null),
    [image, setImage] = useState(0),
    [quantity, setQuantity] = useState(1),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [related, setRelated] = useState<Listing[]>([]),
    [message, setMessage] = useState("");
  useEffect(() => {
    let alive = true;
    api<{ listing: Listing }>(`product/${id}?view=1`)
      .then((d) => {
        if (!alive) return;
        setL(d.listing);
        setQuantity(d.listing.minimum);
        try {
          const prev: string[] = JSON.parse(
            localStorage.getItem("mk-recent") || "[]",
          );
          localStorage.setItem(
            "mk-recent",
            JSON.stringify([id, ...prev.filter((x) => x !== id)].slice(0, 8)),
          );
        } catch {}
        return api<{ items: Listing[] }>(
          `listings?category=${d.listing.category}`,
        ).then((r) => {
          if (alive) setRelated(r.items.filter((x) => x.id !== id).slice(0, 3));
        });
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [id, api]);
  async function add(buy = false) {
    if (!l || busy) return;
    setBusy(true);
    try {
      await api("cart", { listingId: l.id, quantity });
      changed();
      if (buy) router.push("/marketplace/cart");
      else notice(c("Added to your cart", "కార్ట్‌కు జోడించబడింది"));
    } catch (e) {
      notice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function enquire(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("enquiries", { listingId: id, message });
      setMessage("");
      notice(
        c(
          "Your question was sent to the farmer.",
          "మీ ప్రశ్న రైతుకు పంపబడింది.",
        ),
      );
    } catch (e) {
      notice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (error)
    return (
      <div className="mk-container">
        <Empty
          title={c("Crop unavailable", "పంట అందుబాటులో లేదు")}
          body={error}
          action={
            <Link href="/marketplace" className="mk-btn">
              {c("Explore crops", "పంటలు చూడండి")}
            </Link>
          }
        />
      </div>
    );
  if (!l)
    return (
      <div className="mk-container">
        <Skeleton />
      </div>
    );
  const valid =
    Number.isFinite(quantity) &&
    quantity >= l.minimum &&
    quantity <= l.quantity &&
    (!l.maximum || quantity <= l.maximum) &&
    l.status === "published";
  return (
    <div className="mk-container">
      <Link
        href="/marketplace"
        className="mb-7 inline-block text-xs font-semibold text-green"
      >
        ← {c("Back to crops", "పంటలకు తిరిగి")}
      </Link>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-green/5">
            <Image
              src={l.images[image] || "/assets/drone-paddy.png"}
              alt={`${l.crop} ${l.variety}`}
              fill
              unoptimized
              sizes="(max-width:1024px) 90vw,45vw"
              priority
              className="object-cover"
            />
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {l.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setImage(i)}
                aria-label={c(`Show photo ${i + 1}`, `చిత్రం ${i + 1}`)}
                aria-pressed={image === i}
                className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 ${i === image ? "border-green" : "border-transparent"}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mk-eyebrow">
            {c("Direct from the farm", "నేరుగా రైతు నుండి")}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold">{l.crop}</h1>
          <p className="mt-2 text-sm text-muted">{l.variety}</p>
          <p className="mt-6 font-heading text-3xl font-semibold text-green">
            {money(Math.round(l.price * 100))}
            <span className="ml-1 text-base font-normal text-muted">
              / {l.unit}
            </span>
          </p>
          <p className="mt-2 text-xs text-muted">
            {l.negotiable
              ? c("Price enquiries welcome", "ధర విచారణలు ఆహ్వానించబడతాయి")
              : c("Listed crop price", "పంట లిస్టింగ్ ధర")}
          </p>
          <dl className="my-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-5 text-xs">
            {[
              [c("Available", "స్టాక్"), `${l.quantity} ${l.unit}`],
              [c("Minimum order", "కనీస ఆర్డర్"), `${l.minimum} ${l.unit}`],
              [
                c("Harvest", "కోత"),
                l.harvest || c("Not supplied", "తెలియజేయలేదు"),
              ],
              [
                c("Quality grade", "నాణ్యత గ్రేడ్"),
                l.grade || c("Ask the farmer", "రైతును అడగండి"),
              ],
              [
                c("Growing method", "సాగు పద్ధతి"),
                l.organic
                  ? c(
                      "Organic · seller declared",
                      "సేంద్రియ · విక్రేత తెలిపినది",
                    )
                  : c("Conventional / unspecified", "సాధారణ / తెలియజేయలేదు"),
              ],
              [
                c("Collection", "సేకరణ"),
                l.fulfillment === "both"
                  ? c("Pickup or delivery", "పికప్ లేదా డెలివరీ")
                  : l.fulfillment === "pickup"
                    ? c("Buyer pickup", "కొనుగోలుదారు పికప్")
                    : c("Seller delivery", "విక్రేత డెలివరీ"),
              ],
            ].map(([a, b]) => (
              <div key={a}>
                <dt className="text-muted">{a}</dt>
                <dd className="mt-1 font-semibold">{b}</dd>
              </div>
            ))}
          </dl>
          <label className="mk-label">
            {c("Order quantity", "ఆర్డర్ పరిమాణం")} ({l.unit})
            <div className="mt-2 flex w-fit items-center overflow-hidden rounded-xl border border-green/20 bg-white">
              <button
                className="mk-icon"
                aria-label={c("Decrease quantity", "పరిమాణం తగ్గించు")}
                onClick={() =>
                  setQuantity((q) =>
                    Math.max(l.minimum, Math.round((q - 1) * 1000) / 1000),
                  )
                }
              >
                <Minus size={16} />
              </button>
              <input
                aria-label={c("Quantity", "పరిమాణం")}
                type="number"
                min={l.minimum}
                max={l.maximum ? Math.min(l.maximum, l.quantity) : l.quantity}
                step="0.001"
                className="w-24 p-2 text-center outline-none"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <button
                className="mk-icon"
                aria-label={c("Increase quantity", "పరిమాణం పెంచు")}
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(
                      l.maximum || l.quantity,
                      l.quantity,
                      Math.round((q + 1) * 1000) / 1000,
                    ),
                  )
                }
              >
                <Plus size={16} />
              </button>
            </div>
          </label>
          <p aria-live="polite" className="mt-4 text-sm">
            {c("Produce subtotal", "పంట ఉపమొత్తం")}:{" "}
            <b>{money(Math.round(l.price * 100 * quantity))}</b>
          </p>
          {!valid && (
            <p className="mk-error mt-3">
              {c(
                "Check stock and the minimum / maximum order quantity.",
                "స్టాక్, కనీస / గరిష్ట పరిమాణం సరిచూడండి.",
              )}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              disabled={!valid || busy}
              className="mk-btn"
              onClick={() => add()}
            >
              <ShoppingBag size={17} />
              {c("Add to cart", "కార్ట్‌కు జోడించు")}
            </button>
            <button
              disabled={!valid || busy}
              className="mk-secondary"
              onClick={() => add(true)}
            >
              {c("Buy now", "ఇప్పుడే కొనండి")}
            </button>
            <button
              className="mk-secondary"
              onClick={async () => {
                try {
                  await api("wishlist", { listingId: id });
                  notice(c("Crop saved", "పంట సేవ్ చేయబడింది"));
                } catch (e) {
                  notice((e as Error).message);
                }
              }}
            >
              {c("Save crop", "పంట సేవ్ చేయి")}
            </button>
          </div>
          <p className="mt-4 text-[11px] leading-6 text-muted">
            {c(
              "Purchase requests require seller confirmation. Delivery, taxes and any other charges must be agreed before payment. No online marketplace payment is collected here.",
              "కొనుగోలు అభ్యర్థనకు విక్రేత నిర్ధారణ అవసరం. డెలివరీ, పన్నులు, ఇతర ఛార్జీలు చెల్లింపుకు ముందు అంగీకరించాలి. ఇక్కడ మార్కెట్ ఆన్‌లైన్ చెల్లింపు సేకరించబడదు.",
            )}
          </p>
        </div>
      </div>
      <div className="mt-10 grid gap-7 lg:grid-cols-[1.4fr_1fr]">
        <section className="mk-panel">
          <h2 className="font-heading text-2xl">
            {c("About this harvest", "ఈ పంట గురించి")}
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-muted">
            {l.description}
          </p>
          {l.notes && (
            <p className="mt-4 whitespace-pre-wrap text-xs leading-7">
              {l.notes}
            </p>
          )}
          {l.organicEvidence && (
            <p className="mt-4 text-xs leading-7">
              {c("Seller’s organic declaration", "విక్రేత సేంద్రియ ప్రకటన")}:{" "}
              {l.organicEvidence}
            </p>
          )}
          <button
            className="mt-6 text-xs text-muted underline"
            onClick={async () => {
              const reason = window.prompt(
                c(
                  "Describe this listing concern",
                  "లిస్టింగ్ సమస్య వివరించండి",
                ),
              );
              if (!reason) return;
              try {
                await api("report", { listingId: id, reason });
                notice(
                  c("Report sent for review", "నివేదిక సమీక్షకు పంపబడింది"),
                );
              } catch (e) {
                notice((e as Error).message);
              }
            }}
          >
            {c("Report this listing", "లిస్టింగ్‌పై నివేదిక")}
          </button>
        </section>
        <section className="mk-panel">
          <p className="mk-eyebrow">
            {c("Know your grower", "మీ రైతును తెలుసుకోండి")}
          </p>
          <Link
            href={`/marketplace/farmer/${l.sellerId}`}
            className="mt-3 flex items-center gap-2 font-heading text-2xl"
          >
            {l.seller}
            {l.verified === 1 && (
              <BadgeCheck className="text-green" size={21} />
            )}
          </Link>
          <p className="mt-3 flex items-center gap-1 text-xs text-muted">
            <MapPin size={14} />
            {l.village}, {l.district}, {l.state}
          </p>
          <form className="mt-6" onSubmit={enquire}>
            <label className="mk-label">
              {l.negotiable
                ? c(
                    "Request a quote / ask the farmer",
                    "ధర అడగండి / రైతును ప్రశ్నించండి",
                  )
                : c("Ask about this harvest", "ఈ పంట గురించి అడగండి")}
              <textarea
                className="mk-input"
                rows={3}
                required
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={c(
                  "Ask about quality, delivery or bulk availability…",
                  "నాణ్యత, డెలివరీ లేదా పరిమాణం గురించి…",
                )}
              />
            </label>
            <button className="mk-secondary mt-3" disabled={busy}>
              {c("Send enquiry", "విచారణ పంపు")}
            </button>
          </form>
        </section>
      </div>
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 font-heading text-2xl">
            {c("More crops to explore", "మరిన్ని పంటలు")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((l) => (
              <ProductCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
export function Cart({ checkout = false }: { checkout?: boolean }) {
  return (
    <div className="mk-container">
      <AuthGate>
        <CartInner checkout={checkout} />
      </AuthGate>
    </div>
  );
}
function CartInner({ checkout }: { checkout: boolean }) {
  const { api, c, notice, changed, revision } = useMarket();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [fulfillment, setFulfillment] = useState("pickup");
  const key = useRef("");
  const lock = useRef(false);
  useEffect(() => {
    api<{ items: CartItem[] }>("cart")
      .then((d) => {
        setItems(d.items);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [api, revision]);
  const valid = items?.every(
    (i) =>
      i.listing &&
      i.quantity >= i.listing.minimum &&
      i.quantity <= i.listing.quantity &&
      (!i.listing.maximum || i.quantity <= i.listing.maximum),
  );
  const compatible = items?.every(
    (i) =>
      i.listing &&
      (i.listing.fulfillment === "both" ||
        i.listing.fulfillment === fulfillment),
  );
  const total =
    items?.reduce(
      (n, i) => n + Math.round((i.listing?.price || 0) * 100 * i.quantity),
      0,
    ) || 0;
  async function update(id: string, quantity: number) {
    if (busy) return;
    setBusy(true);
    try {
      await api("cart", { listingId: id, quantity });
      changed();
    } catch (e) {
      notice((e as Error).message);
      changed();
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    if (!key.current) key.current = crypto.randomUUID();
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      await api("orders", {
        ...data,
        fulfillment,
        requestKey: key.current,
        expected: items?.map((i) => ({
          id: i.listingId,
          price: i.listing?.price,
          version: i.listing?.version,
        })),
      });
      changed();
      router.push("/marketplace/orders");
      notice(
        c(
          "Purchase request sent. Await seller confirmation.",
          "కొనుగోలు అభ్యర్థన పంపబడింది. విక్రేత నిర్ధారణ కోసం వేచి ఉండండి.",
        ),
      );
    } catch (e) {
      setError((e as Error).message);
      key.current = "";
      changed();
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  if (error && !items)
    return (
      <Empty
        title={c("Couldn’t load your cart", "కార్ట్ లోడ్ కాలేదు")}
        body={error}
        action={
          <button className="mk-btn" onClick={changed}>
            {c("Retry", "మళ్లీ ప్రయత్నించు")}
          </button>
        }
      />
    );
  if (!items) return <Skeleton />;
  if (!items.length)
    return (
      <Empty
        title={c("A basket waiting for your harvest", "మీ పంట కోసం ఖాళీ బుట్ట")}
        body={c(
          "Explore farm listings and add the crops you need.",
          "పంట లిస్టింగ్‌లు చూసి మీకు కావాల్సిన పంటలను జోడించండి.",
        )}
        action={
          <Link href="/marketplace" className="mk-btn">
            {c("Explore crops", "పంటలు చూడండి")}
          </Link>
        }
      />
    );
  return (
    <>
      <PageHeading
        title={
          checkout
            ? c("Plan your purchase", "మీ కొనుగోలు ప్లాన్ చేయండి")
            : c("Your harvest basket", "మీ పంటల బుట్ట")
        }
        body={c(
          "Orders are separated by seller. No delivery charges or payment commitments are assumed.",
          "ఆర్డర్లు విక్రేత వారీగా వేరు చేయబడతాయి. డెలివరీ ఛార్జీలు లేదా చెల్లింపులు ఊహించబడవు.",
        )}
      />
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              className="mk-panel flex flex-wrap items-center gap-4"
              key={item.listingId}
            >
              {item.listing ? (
                <>
                  <Image
                    src={item.listing.images[0]}
                    alt={item.listing.crop}
                    width={100}
                    height={80}
                    unoptimized
                    className="h-20 w-24 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/marketplace/product/${item.listingId}`}
                      className="font-semibold"
                    >
                      {item.listing.crop}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {item.listing.seller} ·{" "}
                      {money(Math.round(item.listing.price * 100))} /{" "}
                      {item.listing.unit}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {c("Min.", "కనీసం")} {item.listing.minimum} ·{" "}
                      {c("Available", "స్టాక్")} {item.listing.quantity}{" "}
                      {item.listing.unit}
                    </p>
                  </div>
                  <label className="text-xs">
                    {c("Quantity", "పరిమాణం")}
                    <input
                      aria-label={`${item.listing.crop} ${c("quantity", "పరిమాణం")}`}
                      type="number"
                      defaultValue={item.quantity}
                      key={`${item.listingId}-${item.quantity}`}
                      min={item.listing.minimum}
                      max={item.listing.quantity}
                      step="0.001"
                      className="mk-input !w-24"
                      onBlur={(e) => {
                        const quantity = Number(e.target.value);
                        e.currentTarget.value = String(item.quantity);
                        if (quantity !== item.quantity) update(item.listingId, quantity);
                      }}
                    />
                  </label>
                  <span className="text-sm font-semibold">
                    {money(
                      Math.round(item.listing.price * 100 * item.quantity),
                    )}
                  </span>
                </>
              ) : (
                <p className="text-sm text-red-700">
                  {c(
                    "This listing is no longer available. Remove it to continue.",
                    "ఈ లిస్టింగ్ అందుబాటులో లేదు. కొనసాగించడానికి తొలగించండి.",
                  )}
                </p>
              )}
              <button
                className="text-xs text-red-700 underline"
                onClick={() => update(item.listingId, 0)}
              >
                {c("Remove", "తొలగించు")}
              </button>
            </div>
          ))}
          {checkout && (
            <form
              id="checkout"
              className="mk-panel space-y-5"
              onSubmit={submit}
            >
              <fieldset disabled={busy} className="space-y-5">
                <h2 className="font-heading text-xl">
                  {c(
                    "Contact & collection details",
                    "సంప్రదింపు & సేకరణ వివరాలు",
                  )}
                </h2>
                {[
                  ["name", "Full name", "పూర్తి పేరు", "text"],
                  ["phone", "Mobile number", "మొబైల్ నంబర్", "tel"],
                ].map(([name, en, te, type]) => (
                  <label key={name} className="mk-label">
                    {c(en, te)} *
                    <input
                      className="mk-input"
                      name={name}
                      required
                      type={type}
                      maxLength={name === "phone" ? 10 : 100}
                      autoComplete={name === "phone" ? "tel-national" : "name"}
                    />
                  </label>
                ))}
                <label className="mk-label">
                  {c("Fulfillment preference", "సేకరణ ఎంపిక")}
                  <select
                    className="mk-input"
                    value={fulfillment}
                    onChange={(e) => setFulfillment(e.target.value)}
                  >
                    <option value="pickup">
                      {c("Buyer pickup", "కొనుగోలుదారు పికప్")}
                    </option>
                    <option value="delivery">
                      {c(
                        "Seller-arranged delivery",
                        "విక్రేత ఏర్పాటు చేసే డెలివరీ",
                      )}
                    </option>
                  </select>
                </label>
                {fulfillment === "delivery" && (
                  <>
                    <label className="mk-label">
                      {c("Delivery address", "డెలివరీ చిరునామా")} *
                      <textarea
                        required
                        name="address"
                        maxLength={500}
                        className="mk-input"
                        autoComplete="street-address"
                      />
                    </label>
                    <label className="mk-label">
                      {c("PIN code", "పిన్ కోడ్")} *
                      <input
                        name="pin"
                        required
                        maxLength={6}
                        pattern="[1-9][0-9]{5}"
                        className="mk-input"
                        autoComplete="postal-code"
                      />
                    </label>
                  </>
                )}
                <label className="mk-label">
                  {c("Payment arrangement", "చెల్లింపు ఏర్పాటు")}
                  <select className="mk-input" disabled>
                    <option>
                      {c(
                        "Agree directly with seller after confirmation",
                        "నిర్ధారణ తర్వాత విక్రేతతో నేరుగా అంగీకరించండి",
                      )}
                    </option>
                  </select>
                </label>
                <p className="text-xs leading-7 text-muted">
                  {c(
                    "This sends a purchase request, not a prepaid order. Wait for the farmer to confirm quality, quantity, delivery availability and the total cost. Never pay an unknown account without verifying the seller.",
                    "ఇది కొనుగోలు అభ్యర్థన, ముందస్తు చెల్లింపు కాదు. రైతు నాణ్యత, పరిమాణం, డెలివరీ మరియు మొత్తం ధర నిర్ధారించే వరకు వేచి ఉండండి. విక్రేతను ధృవీకరించకుండా తెలియని ఖాతాకు చెల్లించవద్దు.",
                  )}
                </p>
              </fieldset>
            </form>
          )}
        </div>
        <aside className="mk-panel lg:sticky lg:top-28">
          <h2 className="font-heading text-xl">
            {c("Purchase summary", "కొనుగోలు సారాంశం")}
          </h2>
          <dl className="my-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <dt>{c("Produce subtotal", "పంట ఉపమొత్తం")}</dt>
              <dd className="font-semibold">{money(total)}</dd>
            </div>
            <div className="flex justify-between gap-5">
              <dt>{c("Delivery / other charges", "డెలివరీ / ఇతర ఛార్జీలు")}</dt>
              <dd className="text-right text-xs text-muted">
                {c(
                  "To be agreed with each seller",
                  "ప్రతి విక్రేతతో అంగీకరించాలి",
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-green/10 pt-4">
              <dt>{c("Pay online now", "ఇప్పుడు ఆన్‌లైన్ చెల్లింపు")}</dt>
              <dd>{c("None", "లేదు")}</dd>
            </div>
          </dl>
          {!valid && (
            <p className="mk-error">
              {c(
                "Update or remove unavailable quantities before continuing.",
                "కొనసాగించే ముందు స్టాక్ పరిమాణం సరిచేయండి.",
              )}
            </p>
          )}
          {checkout && !compatible && (
            <p className="mk-error">
              {c(
                "Some crops do not support this fulfillment method. Change it or split your basket.",
                "కొన్ని పంటలకు ఈ సేకరణ పద్ధతి లేదు. మార్చండి లేదా కార్ట్ వేరు చేయండి.",
              )}
            </p>
          )}
          {error && (
            <p role="alert" className="mk-error">
              {error}
            </p>
          )}
          {checkout ? (
            <button
              form="checkout"
              disabled={!valid || !compatible || busy}
              className="mk-btn mt-4 w-full"
            >
              {busy
                ? c("Sending…", "పంపుతోంది…")
                : c("Send purchase request", "కొనుగోలు అభ్యర్థన పంపు")}
            </button>
          ) : (
            <Link
              href={valid && !busy ? "/marketplace/checkout" : "#"}
              aria-disabled={!valid || busy}
              className={`mk-btn w-full ${!valid || busy ? "pointer-events-none opacity-50" : ""}`}
            >
              {c("Continue to checkout", "చెకౌట్‌కు కొనసాగు")}
            </Link>
          )}
          <p className="mt-4 text-[11px] leading-6 text-muted">
            {c(
              "Stock is reserved for 24 hours while the farmer reviews the request. A declined or expired request releases it.",
              "రైతు సమీక్ష సమయంలో స్టాక్ 24 గంటలు రిజర్వ్ అవుతుంది. తిరస్కరించిన లేదా గడువు ముగిసిన అభ్యర్థన స్టాక్‌ను విడుదల చేస్తుంది.",
            )}
          </p>
        </aside>
      </div>
    </>
  );
}
