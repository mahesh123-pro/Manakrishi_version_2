export type AdminBooking = {
  id: string;
  fullname: string;
  mobile: string;
  village: string;
  date: string;
  crop: string;
  acres: string;
  serviceType: string;
  chemicalOrImplement: string;
  preferredTime: string;
  contactPreference: string;
  notes: string;
  status: string;
  operatorName: string;
  operatorPhone: string;
  scheduledDate: string;
  scheduledTime: string;
  reviewNote: string;
  updatedAt: string;
};

export function indiaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((type) => parts.find((p) => p.type === type)!.value)
    .join("-");
}

export function serviceDate(booking: AdminBooking) {
  const value = booking.scheduledDate || booking.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
    ? value
    : "";
}

export const activeBooking = (booking: AdminBooking) =>
  ["new", "confirmed", "assigned", "in_progress"].includes(booking.status);

export function bookingPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  return /^91[6-9]\d{9}$/.test(digits) ? digits : "";
}

// Flag only matching start times in loaded, active records. This is not a
// duration/availability check and never prevents a server-side status update.
export function bookingConflicts(bookings: AdminBooking[]) {
  const groups = new Map<string, string[]>();
  for (const b of bookings) {
    const phone = bookingPhone(b.operatorPhone);
    if (
      !activeBooking(b) ||
      !phone ||
      !b.scheduledDate ||
      !serviceDate(b) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(b.scheduledTime)
    )
      continue;
    const key = `${phone}/${b.scheduledDate}/${b.scheduledTime}`;
    groups.set(key, [...(groups.get(key) || []), b.id]);
  }
  return new Set([...groups.values()].filter((ids) => ids.length > 1).flat());
}

function csvCell(value: unknown) {
  let text = String(value ?? "");
  // Spreadsheet software may interpret formula prefixes even in quoted cells.
  if (/^[\s\uFEFF]*[=+@-]/u.test(text) || /^[\t\r\n]/.test(text))
    text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function bookingsCsv(bookings: AdminBooking[]) {
  const columns: [keyof AdminBooking, string][] = [
    ["id", "Booking ID"],
    ["fullname", "Customer"],
    ["mobile", "Mobile"],
    ["village", "Village"],
    ["serviceType", "Service"],
    ["crop", "Crop"],
    ["acres", "Acres"],
    ["status", "Status"],
    ["date", "Requested date"],
    ["preferredTime", "Requested time"],
    ["scheduledDate", "Scheduled date (IST)"],
    ["scheduledTime", "Scheduled time (IST)"],
    ["operatorName", "Operator"],
    ["operatorPhone", "Operator mobile"],
    ["notes", "Customer notes"],
    ["reviewNote", "Dispatch note"],
  ];
  return (
    "\uFEFF" +
    [
      columns.map(([, label]) => csvCell(label)).join(","),
      ...bookings.map((b) => columns.map(([key]) => csvCell(b[key])).join(",")),
    ].join("\r\n")
  );
}

const calendarEscape = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
const calendarDate = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
function foldCalendarLine(line: string) {
  const encoder = new TextEncoder();
  let result = "",
    bytes = 0;
  for (const char of line) {
    const width = encoder.encode(char).length;
    if (bytes + width > 75) {
      result += "\r\n ";
      bytes = 1;
    }
    result += char;
    bytes += width;
  }
  return result;
}

export function bookingCalendar(booking: AdminBooking, now = new Date()) {
  if (
    !activeBooking(booking) ||
    !booking.scheduledDate ||
    !serviceDate(booking) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(booking.scheduledTime)
  )
    return null;
  const start = new Date(
    `${booking.scheduledDate}T${booking.scheduledTime}:00+05:30`,
  );
  const description = [
    `Booking ID: ${booking.id}`,
    `Customer: ${booking.fullname}`,
    `Phone: ${booking.mobile}`,
    `Crop: ${booking.crop}`,
    `Acres: ${booking.acres}`,
    `Operator: ${booking.operatorName || "Unassigned"}`,
    "Start time only. Confirm job duration with the team. This download does not sync later changes.",
  ].join("\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Manakrishi//Booking desk//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${encodeURIComponent(booking.id)}@manakrishi.in`,
    `DTSTAMP:${calendarDate(now)}`,
    `DTSTART:${calendarDate(start)}`,
    `SUMMARY:${calendarEscape(`${booking.serviceType || "Farm service"} · ${booking.fullname}`)}`,
    `LOCATION:${calendarEscape(booking.village)}`,
    `DESCRIPTION:${calendarEscape(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(foldCalendarLine)
    .join("\r\n");
}
