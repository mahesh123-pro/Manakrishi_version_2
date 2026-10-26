import { CATEGORIES, UNITS, produceSubtotal, type Listing } from "./types.ts";

export const INITIAL_FILTERS = {
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
export type BrowseFilters = typeof INITIAL_FILTERS;
export type SavedSearch = { name: string; query: string };

export function parseBrowseFilters(params: URLSearchParams): BrowseFilters {
  const result = { ...INITIAL_FILTERS };
  for (const key of ["q", "location", "variety", "grade"] as const)
    result[key] = (params.get(key) || "").trim().slice(0, 100);
  const category = params.get("category") || "";
  if (CATEGORIES.some((c) => c[0] === category)) result.category = category;
  for (const key of [
    "minPrice",
    "maxPrice",
    "quantity",
    "maxMinimum",
  ] as const) {
    const value = params.get(key) || "";
    if (/^\d+(\.\d{1,3})?$/.test(value) && Number(value) <= 1e9)
      result[key] = value;
  }
  for (const key of ["organic", "verified"] as const)
    if (params.get(key) === "1") result[key] = "1";
  const harvest = params.get("harvest") || "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(harvest)) {
    const date = new Date(`${harvest}T00:00:00Z`);
    if (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === harvest
    )
      result.harvest = harvest;
  }
  const sort = params.get("sort") || "";
  if (["recent", "price-asc", "price-desc", "quantity"].includes(sort))
    result.sort = sort;
  return result;
}

export function browseQuery(filters: BrowseFilters) {
  const clean = parseBrowseFilters(new URLSearchParams(filters));
  return new URLSearchParams(
    Object.entries(clean).filter(
      ([key, value]) => value && !(key === "sort" && value === "recent"),
    ),
  ).toString();
}

export function readSavedSearches(raw: string | null): SavedSearch[] {
  try {
    const values: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(values)) return [];
    const seen = new Set<string>();
    return values
      .flatMap((value) => {
        if (
          !value ||
          typeof value.name !== "string" ||
          typeof value.query !== "string" ||
          value.query.length > 3000
        )
          return [];
        const query = browseQuery(
          parseBrowseFilters(new URLSearchParams(value.query)),
        );
        const name = value.name.trim().slice(0, 60);
        if (!query || !name || seen.has(query)) return [];
        seen.add(query);
        return [{ name, query }];
      })
      .slice(0, 5);
  } catch {
    return [];
  }
}

export function readCompareIds(raw: string | null): string[] {
  try {
    const values: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(values)) return [];
    return [
      ...new Set(
        values.filter(
          (value): value is string =>
            typeof value === "string" &&
            /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value),
        ),
      ),
    ].slice(0, 3);
  } catch {
    return [];
  }
}

export function cropPricePerKg(listing: Pick<Listing, "price" | "unit">) {
  return listing.price / UNITS[listing.unit];
}

export function minimumProduceCost(
  listing: Pick<Listing, "price" | "minimum">,
) {
  return produceSubtotal(listing.price, listing.minimum);
}
