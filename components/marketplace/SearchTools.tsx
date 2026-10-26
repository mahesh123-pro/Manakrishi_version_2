"use client";

import { useEffect, useState } from "react";
import { Bookmark, X } from "lucide-react";
import {
  browseQuery,
  parseBrowseFilters,
  readSavedSearches,
  type BrowseFilters,
  type SavedSearch,
} from "@/lib/marketplace/browse-tools";
import { useMarket } from "./MarketProvider";
import { ShareButton } from "./ShareButton";

const STORAGE_KEY = "mk-saved-searches";
export function SearchTools({
  filters,
  apply,
  ready,
}: {
  filters: BrowseFilters;
  apply: (filters: BrowseFilters) => void;
  ready: boolean;
}) {
  const { c, notice } = useMarket();
  const [saved, setSaved] = useState<SavedSearch[]>([]);
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      setSaved(readSavedSearches(localStorage.getItem(STORAGE_KEY)));
    } catch {}
    setLoaded(true);
  }, []);
  const query = browseQuery(filters);
  function persist(next: SavedSearch[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next);
      return true;
    } catch {
      notice(
        c(
          "Browser storage is unavailable. You can still share this search link.",
          "బ్రౌజర్ నిల్వ అందుబాటులో లేదు. ఈ శోధన లింక్ పంచుకోవచ్చు.",
        ),
      );
      return false;
    }
  }
  function save() {
    if (!query || !loaded || !ready) return;
    if (saved.some((s) => s.query === query)) {
      notice(c("This search is already saved", "ఈ శోధన ఇప్పటికే సేవ్ అయింది"));
      return;
    }
    if (saved.length >= 5) {
      notice(
        c(
          "You can save five searches. Remove one before adding another.",
          "ఐదు శోధనలు సేవ్ చేయవచ్చు. కొత్తదానికి ముందు ఒకటి తొలగించండి.",
        ),
      );
      return;
    }
    const title =
      name.trim() ||
      filters.q ||
      filters.location ||
      c("My crop search", "నా పంట శోధన");
    if (persist([...saved, { name: title.slice(0, 60), query }])) {
      setName("");
      notice(c("Search saved on this device", "ఈ పరికరంలో శోధన సేవ్ అయింది"));
    }
  }
  return (
    <section className="mk-panel mb-6" aria-labelledby="search-tools-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3
            id="search-tools-title"
            className="font-heading text-lg font-semibold"
          >
            {c("Keep your crop search handy", "మీ పంట శోధనను సేవ్ చేయండి")}
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            {c(
              "Save up to five searches on this device, or share filters with someone else. Saved searches do not send alerts.",
              "ఈ పరికరంలో ఐదు శోధనలు సేవ్ చేయండి లేదా ఫిల్టర్ల లింక్ పంచుకోండి. సేవ్ చేసిన శోధనలు అలర్ట్‌లు పంపవు.",
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="crop-search-name">
            {c("Saved search name (optional)", "శోధన పేరు (ఐచ్ఛికం)")}
          </label>
          <input
            id="crop-search-name"
            className="mk-input !mt-0 !w-44"
            value={name}
            maxLength={60}
            placeholder={c("Name this search", "శోధన పేరు")}
            onChange={(event) => setName(event.target.value)}
          />
          <button
            className="mk-secondary"
            disabled={!ready || !loaded || !query}
            onClick={save}
          >
            <Bookmark size={15} />
            {c("Save search", "శోధన సేవ్ చేయండి")}
          </button>
          <ShareButton
            path={`/marketplace${query ? `?${query}` : ""}#crop-results`}
            title="Manakrishi crop search"
            label={c("Share search", "శోధన పంచుకోండి")}
          />
        </div>
      </div>
      {saved.length > 0 && (
        <ul
          className="mt-4 flex flex-wrap gap-2"
          aria-label={c("Saved searches", "సేవ్ చేసిన శోధనలు")}
        >
          {saved.map((entry) => (
            <li
              key={entry.query}
              className="flex max-w-full items-center rounded-xl border border-green/15 bg-green/5"
            >
              <button
                className="min-h-11 max-w-56 truncate px-3 text-xs font-semibold text-green"
                onClick={() =>
                  apply(parseBrowseFilters(new URLSearchParams(entry.query)))
                }
              >
                {entry.name}
              </button>
              <button
                className="mk-icon"
                aria-label={c(
                  `Remove saved search ${entry.name}`,
                  `${entry.name} శోధన తొలగించండి`,
                )}
                onClick={() =>
                  persist(saved.filter((s) => s.query !== entry.query))
                }
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
