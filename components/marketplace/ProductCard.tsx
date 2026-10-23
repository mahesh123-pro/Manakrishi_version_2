"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, ArrowUpRight, BadgeCheck } from "lucide-react";
import { money, type Listing } from "@/lib/marketplace/types";
import { useMarket } from "./MarketProvider";
export function ProductCard({
  listing: l,
  onRemove,
}: {
  listing: Listing;
  onRemove?: () => void;
}) {
  const { c, api, notice, changed } = useMarket();
  async function wish() {
    try {
      await api("wishlist", { listingId: l.id, remove: Boolean(onRemove) });
      onRemove?.();
      changed();
      notice(
        c(
          onRemove ? "Removed from saved crops" : "Crop saved",
          onRemove
            ? "సేవ్ చేసిన వాటి నుండి తొలగించబడింది"
            : "పంట సేవ్ చేయబడింది",
        ),
      );
    } catch (e) {
      notice((e as Error).message);
    }
  }
  async function add() {
    try {
      await api("cart", { listingId: l.id, quantity: l.minimum });
      changed();
      notice(c("Added to your cart", "మీ కార్ట్‌కు జోడించబడింది"));
    } catch (e) {
      notice((e as Error).message);
    }
  }
  return (
    <article className="mk-product group">
      <div className="relative aspect-[4/3] overflow-hidden bg-green/5">
        <Link href={`/marketplace/product/${l.id}`}>
          <Image
            src={l.images[0]}
            alt={`${l.crop} ${l.variety}`}
            fill
            unoptimized
            sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 30vw"
            className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
          />
        </Link>
        <button
          onClick={wish}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"
          aria-label={c("Save crop", "పంట సేవ్ చేయండి")}
        >
          <Heart size={18} fill={onRemove ? "#166534" : "none"} />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold text-green">
          {l.organic
            ? c("Organic · seller declared", "సేంద్రియ · విక్రేత తెలిపినది")
            : c("Farm produce", "వ్యవసాయ ఉత్పత్తి")}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/marketplace/product/${l.id}`}
            className="font-heading text-xl font-semibold"
          >
            {l.crop}
            <span className="mt-1 block font-sans text-xs font-normal text-muted">
              {l.variety || c("Farm harvest", "పొలం పంట")}
            </span>
          </Link>
          <ArrowUpRight size={18} className="text-green/60" />
        </div>
        <p className="my-4 text-xl font-semibold text-[#166534]">
          {money(Math.round(l.price * 100))}
          <span className="ml-1 text-xs font-normal text-muted">
            / {l.unit}
          </span>
        </p>
        <div className="flex gap-3 border-y border-green/10 py-3 text-[11px]">
          <span>
            {c("Available", "స్టాక్")}:{" "}
            <b>
              {l.quantity} {l.unit}
            </b>
          </span>
          <span>
            {c("Min.", "కనీసం")}:{" "}
            <b>
              {l.minimum} {l.unit}
            </b>
          </span>
        </div>
        <Link
          href={`/marketplace/farmer/${l.sellerId}`}
          className="mt-4 flex items-center gap-1 text-xs font-semibold"
        >
          {l.seller}
          {l.verified === 1 && <BadgeCheck size={15} className="text-green" />}
        </Link>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
          <MapPin size={12} />
          {l.village}, {l.district}, {l.state}
        </p>
        <p className="mt-2 text-[10px] font-medium text-green">
          {l.quantity < l.minimum
            ? c("Out of stock", "స్టాక్ లేదు")
            : c("Available", "అందుబాటులో ఉంది")}
          {" · "}
          {l.fulfillment === "pickup"
            ? c("Buyer pickup", "కొనుగోలుదారు పికప్")
            : l.fulfillment === "delivery"
              ? c("Seller-arranged delivery", "విక్రేత డెలివరీ")
              : c("Pickup / seller delivery", "పికప్ / విక్రేత డెలివరీ")}
        </p>
        {(l.harvest || l.grade) && (
          <p className="mt-2 text-[10px] text-muted">
            {l.harvest && `${c("Harvest", "కోత")}: ${l.harvest}`}{" "}
            {l.grade && ` · ${l.grade}`}
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <button
            onClick={add}
            disabled={l.quantity < l.minimum}
            className="mk-btn flex-1"
          >
            {c("Add to cart", "కార్ట్‌కు జోడించు")}
          </button>
          <Link href={`/marketplace/product/${l.id}`} className="mk-secondary">
            {c("Details", "వివరాలు")}
          </Link>
        </div>
      </div>
    </article>
  );
}
