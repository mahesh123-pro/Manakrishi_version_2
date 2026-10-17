import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_BOOKING, bookingDate, validBookingDate, bookingEstimate, bookingPayload } from "../lib/booking.ts";

test("quick dates follow India calendar dates across midnight and month boundaries", () => {
  const now = new Date("2026-01-31T20:00:00Z");
  assert.equal(bookingDate(0, now), "2026-02-01");
  assert.equal(bookingDate(7, now), "2026-02-08");
});

test("preferred date rejects past dates, impossible dates, and malformed input", () => {
  const today = "2026-02-01";
  for (const value of ["", "2026-01-31", "2026-02-30", "2026-02-29", "not-a-date", "2026-13-01"]) assert.equal(validBookingDate(value, today), false, value);
  assert.equal(validBookingDate(today, today), true);
  assert.equal(validBookingDate("2028-02-29", today), true);
});

test("estimate uses service-specific rates and never treats a bundle as drone-only", () => {
  assert.deepEqual(bookingEstimate("drone", "2.5"), { min: 1125, max: 1375 });
  assert.deepEqual(bookingEstimate("tractor", "2"), { min: 1800, max: 2400 });
  assert.equal(bookingEstimate("combined", "2"), null);
  for (const value of ["", "-1", "0.4", "Infinity", "abc", "1e308"]) assert.equal(bookingEstimate("drone", value), null);
});

test("switching service keeps the legacy dispatch option relevant to the selected service", () => {
  const fields = { ...INITIAL_BOOKING, chemical: "Fungicide Dosing", implement: "Laser Land Leveller" };
  assert.equal(bookingPayload({ ...fields, serviceType: "drone" }).chemicalOrImplement, "Fungicide Dosing");
  assert.equal(bookingPayload({ ...fields, serviceType: "tractor" }).chemicalOrImplement, "Laser Land Leveller");
  assert.equal(bookingPayload({ ...fields, serviceType: "combined" }).chemicalOrImplement, "Fungicide Dosing + Laser Land Leveller");
});

test("submission preserves new preferences while trimming the existing booking fields", () => {
  const payload = bookingPayload({ ...INITIAL_BOOKING, fullname: " Test Farmer ", village: " Test Village ", mobile: " 9876543210 ", crop: " Paddy ", acres: " 2 ", preferredTime: "Morning", contactPreference: "Phone call", notes: " Gate by the canal " });
  assert.equal(payload.fullname, "Test Farmer");
  assert.equal(payload.mobile, "9876543210");
  assert.equal(payload.village, "Test Village");
  assert.equal(payload.crop, "Paddy");
  assert.equal(payload.acres, "2");
  assert.equal(payload.preferredTime, "Morning");
  assert.equal(payload.contactPreference, "Phone call");
  assert.equal(payload.notes, "Gate by the canal");
});
