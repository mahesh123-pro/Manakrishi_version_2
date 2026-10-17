export type ServiceType = "drone" | "tractor" | "combined";

export interface BookingFields {
  serviceType: ServiceType;
  crop: string;
  acres: string;
  chemical: string;
  implement: string;
  date: string;
  preferredTime: string;
  village: string;
  fullname: string;
  mobile: string;
  contactPreference: string;
  notes: string;
}

export const INITIAL_BOOKING: BookingFields = {
  serviceType: "drone", crop: "", acres: "1",
  chemical: "Advisor Pick / Free Advice", implement: "Disc Plough (Deep Tillage)",
  date: "", preferredTime: "Any time", village: "", fullname: "", mobile: "",
  contactPreference: "WhatsApp", notes: "",
};

/** Calendar dates follow the service area, including around UTC midnight. */
export function bookingDate(days = 0, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = (type: string) => parts.find(part => part.type === type)!.value;
  const date = new Date(`${value("year")}-${value("month")}-${value("day")}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function validBookingDate(value: string, today = bookingDate()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < today) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function bookingEstimate(service: ServiceType, acres: string): { min: number; max: number } | null {
  const area = Number(acres);
  if (!Number.isFinite(area) || area < 0.5 || service === "combined") return null;
  const rates = service === "tractor" ? [900, 1200] : [450, 550];
  const min = Math.round(area * rates[0]);
  const max = Math.round(area * rates[1]);
  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
}

/** Keep the legacy dispatch field while preserving the separate preferences. */
export function bookingPayload(fields: BookingFields) {
  return {
    fullname: fields.fullname.trim(), mobile: fields.mobile.trim(), village: fields.village.trim(),
    date: fields.date, crop: fields.crop.trim(), acres: fields.acres.trim(), serviceType: fields.serviceType,
    chemicalOrImplement: fields.serviceType === "tractor" ? fields.implement : fields.serviceType === "combined" ? `${fields.chemical} + ${fields.implement}` : fields.chemical,
    preferredTime: fields.preferredTime, contactPreference: fields.contactPreference, notes: fields.notes.trim(),
  };
}
