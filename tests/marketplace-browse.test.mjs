import test from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_FILTERS,
  parseBrowseFilters,
  browseQuery,
  readSavedSearches,
  readCompareIds,
  cropPricePerKg,
  minimumProduceCost,
} from "../lib/marketplace/browse-tools.ts";

test("shared search links round-trip supported filters and discard unrelated parameters", () => {
  const filters = {
    ...INITIAL_FILTERS,
    q: "chilli & rice",
    location: "వరంగల్",
    category: "vegetables",
    verified: "1",
    maxPrice: "125.50",
    quantity: "0.125",
    harvest: "2026-10-26",
    sort: "price-asc",
  };
  assert.deepEqual(
    parseBrowseFilters(new URLSearchParams(browseQuery(filters))),
    filters,
  );
  assert.equal(browseQuery(INITIAL_FILTERS), "");
  const unsafe = parseBrowseFilters(
    new URLSearchParams(
      "minPrice=-1&maxPrice=Infinity&quantity=NaN&maxMinimum=1000000001&harvest=2026-02-30&verified=false&organic=yes&category=unknown&sort=private&token=secret",
    ),
  );
  assert.deepEqual(unsafe, INITIAL_FILTERS);
  assert.equal(
    parseBrowseFilters(new URLSearchParams(`q=${"a".repeat(200)}`)).q.length,
    100,
  );
});

test("saved searches tolerate corrupt storage, deduplicate and cap entries", () => {
  for (const value of [null, "bad-json", "{}", '[null,12,"bad",{}]'])
    assert.deepEqual(readSavedSearches(value), []);
  const stored = [
    { name: " Paddy ", query: "q=paddy&token=secret" },
    { name: "Duplicate", query: "q=paddy" },
    { name: "Unknown", query: "token=secret" },
    ...Array.from({ length: 8 }, (_, i) => ({
      name: `Search ${i}`,
      query: `q=crop${i}`,
    })),
  ];
  const result = readSavedSearches(JSON.stringify(stored));
  assert.equal(result.length, 5);
  assert.deepEqual(result[0], { name: "Paddy", query: "q=paddy" });
  assert.equal(
    result.some((entry) => entry.query.includes("secret")),
    false,
  );
});

test("comparison restores no more than three unique valid listing IDs", () => {
  const ids = Array.from(
    { length: 4 },
    (_, i) => `00000000-0000-4000-8000-00000000000${i}`,
  );
  assert.deepEqual(
    readCompareIds(
      JSON.stringify([
        ids[0],
        ids[0],
        "../admin",
        "",
        null,
        123,
        ...ids.slice(1),
      ]),
    ),
    ids.slice(0, 3),
  );
  assert.deepEqual(readCompareIds("invalid"), []);
  assert.deepEqual(readCompareIds("{}"), []);
});

test("crop comparison normalizes kg, quintals and tonnes without changing unit minimum costs", () => {
  for (const [unit, price] of [
    ["kg", 30],
    ["quintal", 3000],
    ["tonne", 30000],
  ])
    assert.equal(cropPricePerKg({ unit, price }), 30);
  assert.equal(minimumProduceCost({ price: 3000, minimum: 0.5 }), 150000);
  assert.equal(minimumProduceCost({ price: 19.99, minimum: 0.125 }), 250);
  assert.equal(minimumProduceCost({ price: 0.29, minimum: 0.5 }), 15);
});
