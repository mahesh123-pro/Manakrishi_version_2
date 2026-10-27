export const CATEGORIES = [
  ["grains", "Grains & cereals", "ధాన్యాలు", "drone-maize.png"],
  ["rice", "Rice & paddy", "బియ్యం & వరి", "drone-paddy.png"],
  ["wheat", "Wheat", "గోధుమలు", "drone-maize.png"],
  ["pulses", "Pulses & lentils", "పప్పు ధాన్యాలు", "drone-paddy.png"],
  ["vegetables", "Vegetables", "కూరగాయలు", "drone-chilli.png"],
  ["fruits", "Fruits", "పండ్లు", "drone-orchard.png"],
  ["oilseeds", "Oilseeds", "నూనె గింజలు", "drone-maize.png"],
  ["spices", "Spices", "సుగంధ ద్రవ్యాలు", "drone-chilli.png"],
  ["commercial", "Commercial crops", "వాణిజ్య పంటలు", "drone-cotton.png"],
  ["organic", "Organic produce", "సేంద్రియ ఉత్పత్తులు", "drone-orchard.png"],
] as const;
export const UNITS = { kg: 1, quintal: 100, tonne: 1000 } as const;
export type Role = "buyer" | "farmer" | "admin" | "fpo";
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  verified: number;
  village: string;
  district: string;
  state: string;
  bio: string;
  photo: string;
  publicContact: string;
  suspended: number;
};
export type ListingInput = {
  crop: string;
  category: string;
  variety: string;
  description: string;
  images: string[];
  price: number;
  unit: keyof typeof UNITS;
  quantity: number;
  minimum: number;
  maximum: number;
  grade: string;
  organic: boolean;
  organicEvidence: string;
  negotiable: boolean;
  village: string;
  district: string;
  state: string;
  pin: string;
  harvest: string;
  availableFrom: string;
  fulfillment: "pickup" | "delivery" | "both";
  pickup: string;
  contact: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
};
export type Listing = ListingInput & {
  id: string;
  sellerId: string;
  seller: string;
  verified: number;
  status: string;
  quantity: number;
  version: number;
  createdAt: string;
  views: number;
  moderation: string;
};
export type CartItem = {
  listingId: string;
  quantity: number;
  listing: Listing | null;
};
export const ORDER_STATES = [
  "awaiting_confirmation",
  "confirmed",
  "preparing",
  "ready",
  "shipped",
  "delivered",
  "rejected",
  "cancelled",
] as const;
export type Order = {
  id: string;
  buyerId: string;
  sellerId: string;
  buyer: string;
  seller: string;
  status: string;
  total: number;
  createdAt: string;
  expiresAt: string;
  fulfillment: string;
  address: string;
  name: string;
  phone: string;
  pin: string;
  reason: string;
  items: {
    crop: string;
    variety: string;
    unit: string;
    quantity: number;
    price: number;
    subtotal: number;
    listingId: string;
  }[];
};
export const money = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);

// Prices are stored as integer paise and quantities as thousandths of a unit.
// Normalize both before multiplying so half-paise totals round consistently.
export function produceSubtotal(price: number, quantity: number) {
  return Math.round(
    (Math.round(price * 100) * Math.round(quantity * 1000)) / 1000,
  );
}
