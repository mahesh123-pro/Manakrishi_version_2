"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { useMarket } from "./MarketProvider";

export function ShareButton({
  path,
  title,
  label,
}: {
  path: string;
  title: string;
  label?: string;
}) {
  const { c, notice } = useMarket();
  const [fallback, setFallback] = useState("");
  const [busy, setBusy] = useState(false);
  async function share() {
    if (busy) return;
    setBusy(true);
    const url = new URL(path, window.location.origin).href;
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
          return;
        } catch (error) {
          if ((error as Error).name === "AbortError") return;
        }
      }
      if (!navigator.clipboard?.writeText) {
        setFallback(url);
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        notice(c("Link copied", "లింక్ కాపీ అయింది"));
      } catch {
        setFallback(url);
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className="mk-secondary"
        disabled={busy}
        onClick={share}
      >
        <Share2 size={15} />
        {label || c("Share crop", "పంటను పంచుకోండి")}
      </button>
      {fallback && (
        <label className="mk-label basis-full mt-2">
          {c("Copy this link", "ఈ లింక్ కాపీ చేయండి")}
          <input
            className="mk-input"
            readOnly
            value={fallback}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      )}
    </>
  );
}
