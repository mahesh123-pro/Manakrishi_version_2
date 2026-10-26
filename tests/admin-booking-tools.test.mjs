import test from "node:test";
import assert from "node:assert/strict";
import {
  indiaDate,
  serviceDate,
  bookingPhone,
  bookingConflicts,
  bookingsCsv,
  bookingCalendar,
} from "../lib/admin/booking-tools.ts";

const booking = {
  id: "fixture-booking",
  fullname: "Fixture Farmer",
  mobile: "9876543210",
  village: "Fixture village",
  date: "2026-10-26",
  crop: "Cotton",
  acres: "2",
  serviceType: "Drone spraying",
  chemicalOrImplement: "",
  preferredTime: "Morning",
  contactPreference: "Phone",
  notes: "",
  status: "assigned",
  operatorName: "Fixture operator",
  operatorPhone: "9876543211",
  scheduledDate: "2026-10-27",
  scheduledTime: "00:30",
  reviewNote: "",
  updatedAt: "",
};

test("work queues use the Indian calendar day and valid service dates", () => {
  assert.equal(indiaDate(new Date("2026-10-26T18:29:59Z")), "2026-10-26");
  assert.equal(indiaDate(new Date("2026-10-26T18:30:00Z")), "2026-10-27");
  assert.equal(serviceDate(booking), "2026-10-27");
  assert.equal(serviceDate({ ...booking, scheduledDate: "" }), "2026-10-26");
  for (const value of ["", "bad-date", "2026-02-30", "2026-13-01"])
    assert.equal(
      serviceDate({ ...booking, date: "", scheduledDate: value }),
      "",
    );
});

test("same-start warnings normalize operator phones and ignore terminal or invalid schedules", () => {
  assert.equal(bookingPhone("+91 98765 43211"), "919876543211");
  assert.equal(bookingPhone("12345"), "");
  assert.deepEqual(
    [
      ...bookingConflicts([
        booking,
        { ...booking, id: "second", operatorPhone: "+91 98765 43211" },
        { ...booking, id: "completed", status: "completed" },
        { ...booking, id: "cancelled", status: "cancelled" },
        { ...booking, id: "later", scheduledTime: "01:30" },
        { ...booking, id: "invalid", scheduledDate: "2026-02-30" },
        { ...booking, id: "invalid-time", scheduledTime: "25:30" },
      ]),
    ].sort(),
    ["fixture-booking", "second"],
  );
});

test("CSV quotes customer text, preserves Unicode and neutralizes spreadsheet formulas", () => {
  const csv = bookingsCsv([
    {
      ...booking,
      fullname: '=HYPERLINK("https://example.test")',
      village: "  +formula",
      notes: 'First line\nsecond, "quoted" line',
      reviewNote: "తెలుగు",
    },
  ]);
  assert.ok(csv.startsWith('\uFEFF"Booking ID"'));
  assert.ok(csv.includes('"\'=HYPERLINK(""https://example.test"")"'));
  assert.ok(csv.includes('"\'  +formula"'));
  assert.ok(csv.includes('"First line\nsecond, ""quoted"" line"'));
  assert.ok(csv.includes("తెలుగు"));
  for (const prefix of ["=", "+", "-", "@", "\t", "\r", "\n"])
    assert.ok(
      bookingsCsv([{ ...booking, fullname: `${prefix}unsafe` }]).includes(
        `"'${prefix}unsafe"`,
      ),
    );
});

test("calendar export converts IST across midnight and prevents property injection", () => {
  const calendar = bookingCalendar(
    {
      ...booking,
      fullname: "Test\nBEGIN:VEVENT",
      village: "Village, Area; Zone\\Farm",
    },
    new Date("2026-10-26T12:00:00Z"),
  );
  assert.ok(calendar.includes("DTSTART:20261026T190000Z\r\n"));
  assert.ok(calendar.includes("DTSTAMP:20261026T120000Z\r\n"));
  assert.ok(calendar.includes("Test\\nBEGIN:VEVENT"));
  assert.equal(
    calendar.split("\r\n").filter((line) => line === "BEGIN:VEVENT").length,
    1,
  );
  assert.ok(calendar.includes("LOCATION:Village\\, Area\\; Zone\\\\Farm"));
  assert.equal(calendar.includes("DTEND:"), false);
  for (const b of [
    { ...booking, status: "cancelled" },
    { ...booking, scheduledDate: "" },
    { ...booking, scheduledDate: "2026-02-30" },
    { ...booking, scheduledTime: "25:00" },
  ])
    assert.equal(bookingCalendar(b), null);
});

test("calendar lines fold within 75 UTF-8 bytes without corrupting Telugu", () => {
  const name = "రైతు పేరు ".repeat(30);
  const calendar = bookingCalendar({ ...booking, fullname: name });
  for (const line of calendar.split("\r\n"))
    assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  assert.ok(calendar.replaceAll("\r\n ", "").includes(name));
});
