import type { LucideIcon } from "lucide-react";
import {
  Droplets,
  Clock,
  ShieldCheck,
  Leaf,
  Wind,
  Users,
  Gauge,
  Sprout,
  MapPin,
  Route,
  Navigation,
  Battery,
  Zap,
  Radar,
  Crosshair,
  Plane,
  ClipboardList,
  Boxes,
  SatelliteDish,
  Store,
  BrainCircuit,
  IndianRupee,
  HeartPulse,
  TreePine,
  SprayCan,
  LineChart,
  Bug,
  Bird,
} from "lucide-react";
import type { Localized } from "./i18n/dictionaries";

/* ------------------------------------------------------------------ */
/*  Site-wide constants (source of truth = live manakrishi.in)         */
/* ------------------------------------------------------------------ */

export const SITE = {
  name: "Manakrishi",
  legalName: "Manakrishi Technologies",
  domain: "manakrishi.in",
  url: "https://manakrishi.in",
  phone: "+91 8886124318",
  phoneRaw: "918886124318",
  whatsapp: "https://wa.me/918886124318",
  email: "gklt@manakrishi.in",
  address: "46-122/1, Chintal, Hyderabad, Telangana, India",
  instagram: "https://www.instagram.com/manakrishi01",
  linkedin: "https://www.linkedin.com/in/karthikeya-gundlapally-b53673296",
} as const;

export const NAV_LINKS: { key: string; href: string }[] = [
  { key: "nav.marketplace", href: "/marketplace" },
  { key: "nav.tech", href: "#technology" },
  { key: "nav.how", href: "#how-it-works" },
  { key: "nav.services", href: "#services" },
  { key: "nav.machinery", href: "#machinery" },
  { key: "nav.impact", href: "#impact" },
  { key: "nav.contact", href: "#contact" },
];

/* ------------------------------------------------------------------ */
/*  Statistics — verifiable now vs. clearly-labelled vision            */
/* ------------------------------------------------------------------ */

export interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: Localized;
  kind: "verified" | "vision";
  icon: LucideIcon;
}

export const STATS_VERIFIED: Stat[] = [
  {
    value: 30, suffix: "%", kind: "verified", icon: IndianRupee,
    label: { en: "Cost Reduction", te: "ఖర్చు తగ్గింపు" },
  },
  {
    value: 50, suffix: "%", kind: "verified", icon: Clock,
    label: { en: "Time Saved", te: "సమయం ఆదా" },
  },
  {
    value: 100, suffix: "%", kind: "verified", icon: HeartPulse,
    label: { en: "Health Safety", te: "ఆరోగ్య భద్రత" },
  },
  {
    value: 30, suffix: "%", kind: "verified", icon: Droplets,
    label: { en: "Less Chemical Use", te: "తక్కువ రసాయనాల వాడకం" },
  },
];

export const STATS_VISION: Stat[] = [
  {
    value: 1, suffix: " acre", prefix: "< ", kind: "vision", icon: Gauge,
    label: { en: "Sprayed in ~7 minutes", te: "సుమారు 7 నిమిషాల్లో స్ప్రే" },
  },
  {
    value: 6, suffix: "+", kind: "vision", icon: Sprout,
    label: { en: "Crop types served", te: "పంట రకాలు" },
  },
];

/* ------------------------------------------------------------------ */
/*  About highlights                                                   */
/* ------------------------------------------------------------------ */

export interface Highlight {
  icon: LucideIcon;
  title: Localized;
  body: Localized;
}

export const ABOUT_HIGHLIGHTS: Highlight[] = [
  {
    icon: Leaf,
    title: { en: "Eco-friendly Precision", te: "పర్యావరణహిత కచ్చితత్వం" },
    body: {
      en: "Variable-rate spraying puts chemicals exactly where crops need them — cutting waste and runoff.",
      te: "అవసరమైన చోటే రసాయనాలు — వృథా, ప్రవాహం తగ్గుతుంది.",
    },
  },
  {
    icon: Clock,
    title: { en: "Time & Cost Efficient", te: "సమయం, ఖర్చు ఆదా" },
    body: {
      en: "An acre that takes hours by hand is covered in minutes — for a fraction of the cost.",
      te: "చేతితో గంటలు పట్టే ఎకరం నిమిషాల్లో — తక్కువ ఖర్చుతో.",
    },
  },
  {
    icon: ShieldCheck,
    title: { en: "Farmer Safety First", te: "రైతు భద్రతే మొదటిది" },
    body: {
      en: "No more walking through toxic mist. Farmers stay far from harmful chemical exposure.",
      te: "విషపూరిత పొగలో నడవాల్సిన అవసరం లేదు. రైతులు రసాయనాలకు దూరంగా ఉంటారు.",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Why drone spraying                                                 */
/* ------------------------------------------------------------------ */

export const WHY_PILLARS: Highlight[] = [
  {
    icon: HeartPulse,
    title: { en: "Zero chemical exposure", te: "రసాయన సంబంధం సున్నా" },
    body: { en: "Operators control the drone from a safe distance — no direct contact with pesticides." },
  },
  {
    icon: Droplets,
    title: { en: "Up to 90% less water", te: "90% వరకు తక్కువ నీరు" },
    body: { en: "Ultra-fine atomised droplets need a fraction of the water manual tanks require." },
  },
  {
    icon: Gauge,
    title: { en: "10× faster coverage", te: "10× వేగంగా" },
    body: { en: "Cover large fields in minutes, hitting the crucial spray window on time." },
  },
  {
    icon: Crosshair,
    title: { en: "Even, accurate coverage", te: "సమానమైన కవరేజ్" },
    body: { en: "GPS-guided flight lines mean no missed strips and no double-spraying." },
  },
];

/* ------------------------------------------------------------------ */
/*  Comparison table                                                   */
/* ------------------------------------------------------------------ */

export interface CompareRow {
  metric: Localized;
  manual: Localized;
  drone: Localized;
  /** 0–100 bar fill for manual vs drone (higher = better outcome) */
  manualScore: number;
  droneScore: number;
}

export const COMPARE_ROWS: CompareRow[] = [
  {
    metric: { en: "Time per acre", te: "ఎకరానికి సమయం" },
    manual: { en: "2–3 hours" }, drone: { en: "~7 minutes" },
    manualScore: 20, droneScore: 96,
  },
  {
    metric: { en: "Cost", te: "ఖర్చు" },
    manual: { en: "High labour cost" }, drone: { en: "Up to 30% lower" },
    manualScore: 30, droneScore: 85,
  },
  {
    metric: { en: "Chemical usage", te: "రసాయనాల వాడకం" },
    manual: { en: "Heavy, uneven" }, drone: { en: "Up to 30% less" },
    manualScore: 25, droneScore: 88,
  },
  {
    metric: { en: "Health risk", te: "ఆరోగ్య ప్రమాదం" },
    manual: { en: "Direct exposure" }, drone: { en: "None for farmer" },
    manualScore: 10, droneScore: 100,
  },
  {
    metric: { en: "Coverage", te: "కవరేజ్" },
    manual: { en: "Missed patches" }, drone: { en: "GPS-uniform" },
    manualScore: 45, droneScore: 95,
  },
  {
    metric: { en: "Efficiency", te: "సామర్థ్యం" },
    manual: { en: "Weather-limited" }, drone: { en: "Rapid, on-window" },
    manualScore: 35, droneScore: 92,
  },
];

/* ------------------------------------------------------------------ */
/*  How it works — 7 steps                                             */
/* ------------------------------------------------------------------ */

export interface Step {
  n: string;
  icon: LucideIcon;
  title: Localized;
  body: Localized;
}

export const STEPS: Step[] = [
  {
    n: "01", icon: ClipboardList,
    title: { en: "Book Online", te: "ఆన్‌లైన్ బుకింగ్" },
    body: { en: "Request a spraying slot in minutes from your phone." },
  },
  {
    n: "02", icon: Sprout,
    title: { en: "Select Crop", te: "పంట ఎంపిక" },
    body: { en: "Tell us your crop — paddy, cotton, chilli and more." },
  },
  {
    n: "03", icon: SprayCan,
    title: { en: "Choose Pesticide", te: "పురుగుమందు ఎంపిక" },
    body: { en: "Pick the chemical, or let our crop advisor recommend one." },
  },
  {
    n: "04", icon: MapPin,
    title: { en: "Capture Location", te: "ప్రాంతం" },
    body: { en: "Share your village and field so we can map the route." },
  },
  {
    n: "05", icon: Plane,
    title: { en: "Drone Assigned", te: "డ్రోన్ కేటాయింపు" },
    body: { en: "A certified operator and drone are dispatched to your field." },
  },
  {
    n: "06", icon: Wind,
    title: { en: "Precision Spray", te: "కచ్చిత స్ప్రే" },
    body: { en: "The drone flies GPS lines, spraying evenly across the field." },
  },
  {
    n: "07", icon: Sprout,
    title: { en: "Bountiful Harvest", te: "సమృద్ధ పంట" },
    body: { en: "Healthier crops, protected yield — the farm responds." },
  },
];

/* ------------------------------------------------------------------ */
/*  Drone specs                                                        */
/* ------------------------------------------------------------------ */

export interface Spec {
  icon: LucideIcon;
  label: Localized;
  value: Localized;
}

export const DRONE_SPECS: Spec[] = [
  { icon: Droplets, label: { en: "Tank Capacity" }, value: { en: "10–16 L" } },
  { icon: Gauge, label: { en: "Coverage" }, value: { en: "~1 acre / 7 min" } },
  { icon: Clock, label: { en: "Flight Time" }, value: { en: "12–18 min / charge" } },
  { icon: Navigation, label: { en: "GPS + RTK" }, value: { en: "Centimetre-level" } },
  { icon: Radar, label: { en: "Obstacle Avoidance" }, value: { en: "Omni radar" } },
  { icon: Route, label: { en: "AI Route Planning" }, value: { en: "Autonomous" } },
  { icon: Battery, label: { en: "Battery" }, value: { en: "Fast-swap smart" } },
  { icon: Zap, label: { en: "Spray Width" }, value: { en: "4–7 m swath" } },
];

/* ------------------------------------------------------------------ */
/*  Precision farming features                                         */
/* ------------------------------------------------------------------ */

export const PRECISION: Highlight[] = [
  { icon: BrainCircuit, title: { en: "AI Field Mapping" }, body: { en: "Fields are mapped and analysed to plan the optimal flight." } },
  { icon: Navigation, title: { en: "GPS + RTK Accuracy" }, body: { en: "Centimetre-level positioning keeps every pass on line." } },
  { icon: Plane, title: { en: "Autonomous Flight" }, body: { en: "Pre-planned routes fly themselves, hands-off and repeatable." } },
  { icon: Route, title: { en: "Smart Route Planning" }, body: { en: "Boundaries, obstacles and wind factored into every mission." } },
  { icon: SprayCan, title: { en: "Variable-Rate Spray" }, body: { en: "Dose adapts to crop and zone — no over- or under-spraying." } },
  { icon: Leaf, title: { en: "Minimal Waste", }, body: { en: "Precise droplets mean less chemical, less runoff, healthier soil." } },
];

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */

export type ServiceStatus = "live" | "soon" | "future";

export interface Service {
  icon: LucideIcon;
  title: Localized;
  body: Localized;
  status: ServiceStatus;
}

export const SERVICES: Service[] = [
  { icon: SprayCan, status: "live", title: { en: "Drone Spraying", te: "డ్రోన్ స్ప్రేయింగ్" }, body: { en: "Precision spraying of pesticides & fertilizers, booked online." } },
  { icon: Sprout, status: "live", title: { en: "Crop Advisor", te: "పంట సలహా" }, body: { en: "Guidance on crop health, dosage and spray timing." } },
  { icon: Droplets, status: "soon", title: { en: "Irrigation Planning", te: "నీటిపారుదల ప్రణాళిక" }, body: { en: "Water-management strategies for efficient farming." } },
  { icon: ShieldCheck, status: "soon", title: { en: "Crop Insurance", te: "పంట బీమా" }, body: { en: "Protect your harvest against unforeseen risks." } },
  { icon: LineChart, status: "future", title: { en: "Crop Monitoring & NDVI", te: "పంట పర్యవేక్షణ" }, body: { en: "Health maps from the sky to catch stress early." } },
  { icon: Bug, status: "future", title: { en: "AI Crop Diagnosis", te: "AI పంట నిర్ధారణ" }, body: { en: "Detect pests and disease from drone imagery." } },
  { icon: Boxes, status: "future", title: { en: "Seed Broadcasting", te: "విత్తన వెదజల్లడం" }, body: { en: "Aerial seeding and fertilizer spreading at scale." } },
  { icon: Bird, status: "future", title: { en: "Livestock Monitoring", te: "పశువుల పర్యవేక్షణ" }, body: { en: "Aerial checks across grazing land and herds." } },
];

/* ------------------------------------------------------------------ */
/*  Benefits                                                           */
/* ------------------------------------------------------------------ */

export const BENEFITS: Highlight[] = [
  { icon: Droplets, title: { en: "Save Water" }, body: { en: "Atomised spraying uses a fraction of the water." } },
  { icon: Clock, title: { en: "Save Time" }, body: { en: "Acres covered in minutes, not days." } },
  { icon: Users, title: { en: "Reduce Labour" }, body: { en: "Solve the shrinking farm-labour problem." } },
  { icon: Sprout, title: { en: "Improve Yield" }, body: { en: "Even coverage protects and lifts output." } },
  { icon: HeartPulse, title: { en: "Healthy Farming" }, body: { en: "Farmers stay clear of toxic exposure." } },
  { icon: TreePine, title: { en: "Environment Friendly" }, body: { en: "Less chemical, less runoff, less waste." } },
  { icon: ShieldCheck, title: { en: "Safe Spraying" }, body: { en: "Controlled, remote, and repeatable." } },
  { icon: Crosshair, title: { en: "Better Coverage" }, body: { en: "GPS lines reach every corner of the field." } },
];

/* ------------------------------------------------------------------ */
/*  Crops (bilingual, with drone illustration)                         */
/* ------------------------------------------------------------------ */

export interface Crop {
  name: Localized;
  image: string;
}

export const CROPS: Crop[] = [
  { name: { en: "Paddy", te: "వరి" }, image: "drone-paddy.png" },
  { name: { en: "Maize", te: "మొక్క జొన్న" }, image: "drone-maize.png" },
  { name: { en: "Chilli", te: "మిరప" }, image: "drone-chilli.png" },
  { name: { en: "Cotton", te: "పత్తి" }, image: "drone-cotton.png" },
  { name: { en: "Sugarcane", te: "చెరకు" }, image: "drone-sugarcane.png" },
  { name: { en: "Orchards", te: "తోటలు" }, image: "drone-orchard.png" },
];

/* ------------------------------------------------------------------ */
/*  Tractors & Heavy Machinery Services                               */
/* ------------------------------------------------------------------ */

export interface TractorItem {
  id: string;
  name: Localized;
  hp: string;
  attachment: Localized;
  image: string;
  description: Localized;
  specs: { label: Localized; value: string }[];
  badge: Localized;
}

export const TRACTORS: TractorItem[] = [
  {
    id: "tr-01",
    name: { en: "55 HP 4WD Heavy Tillage Tractor", te: "55 HP 4WD భారీ దుక్కి ట్రాక్టర్" },
    hp: "55 HP · 4WD",
    attachment: { en: "Heavy Duty Disc Plough", te: "డిస్క్ ప్లావ్" },
    image: "tractor-ploughing.png",
    description: {
      en: "Powerful Indian agricultural tractor for deep soil inversion, breaking hard soil layers, and preparing primary seedbeds.",
      te: "లోతైన దుక్కి, గట్టి నేలను దున్నుడం మరియు ప్రాథమిక విత్తన మడి తయారీ కోసం శక్తివంతమైన ట్రాక్టర్.",
    },
    specs: [
      { label: { en: "Coverage", te: "కవరేజ్" }, value: "1.5 ac/hr" },
      { label: { en: "Engine", te: "ఇంజిన్" }, value: "3500 cc Turbo" },
      { label: { en: "Application", te: "ఉపయోగం" }, value: "Deep Soil Tillage" },
    ],
    badge: { en: "High Demand", te: "అధిక డిమాండ్" },
  },
  {
    id: "tr-02",
    name: { en: "45 HP Rotavator & Soil Prep Tractor", te: "45 HP రోటవేటర్ ట్రాక్టర్" },
    hp: "45 HP · Dual Speed PTO",
    attachment: { en: "Multi-blade Rotavator", te: "మల్టీ బ్లేడ్ రోటవేటర్" },
    image: "tractor-rotavator.png",
    description: {
      en: "Ideal for fine tilth creation, pulverising clods, and mixing crop residues for paddy and dry land fields.",
      te: "నేలను మెత్తగా చేయుటకు, దుక్కి దున్నుటకు మరియు వరి పొలాల తయారీకి ఉత్తమమైనది.",
    },
    specs: [
      { label: { en: "Coverage", te: "కవరేజ్" }, value: "2.0 ac/hr" },
      { label: { en: "Blades", te: "బ్లేడ్లు" }, value: "42 L-Type" },
      { label: { en: "Application", te: "ఉపయోగం" }, value: "Fine Pulverisation" },
    ],
    badge: { en: "Most Popular", te: "పాపులర్" },
  },
  {
    id: "tr-03",
    name: { en: "50 HP Laser Land Leveller & Cultivator", te: "50 HP లేజర్ ల్యాండ్ లెవెలర్" },
    hp: "50 HP · Precision Hydro",
    attachment: { en: "Laser Leveller & 9-Tyne Cultivator", te: "లేజర్ లెవెలర్ & కల్టివేటర్" },
    image: "tractor-cultivator.png",
    description: {
      en: "Laser-guided precision field levelling to save 25% irrigation water and ensure uniform crop germination.",
      te: "25% నీటి సమయాన్ని ఆదా చేసే కచ్చితమైన లేజర్ సమతలీకరణ మరియు కల్టివేటర్.",
    },
    specs: [
      { label: { en: "Accuracy", te: "కచ్చితత్వం" }, value: "±2 mm" },
      { label: { en: "Water Saved", te: "నీటి ఆదా" }, value: "Up to 25%" },
      { label: { en: "Application", te: "ఉపయోగం" }, value: "Field Levelling" },
    ],
    badge: { en: "Precision Tech", te: "కచ్చితమైన టెక్నాలజీ" },
  },
];

/* ------------------------------------------------------------------ */
/*  Operating areas (India map)                                        */
/* ------------------------------------------------------------------ */

export interface MapPoint {
  name: string;
  /** percentage coordinates within the map viewport (0–100) */
  x: number;
  y: number;
  status: "current" | "future";
}

export const MAP_POINTS: MapPoint[] = [
  { name: "Hyderabad", x: 47, y: 62, status: "current" },
  { name: "Warangal", x: 53, y: 58, status: "current" },
  { name: "Khammam", x: 56, y: 63, status: "current" },
  { name: "Nizamabad", x: 45, y: 55, status: "current" },
  { name: "Vijayawada", x: 57, y: 68, status: "future" },
  { name: "Bengaluru", x: 44, y: 76, status: "future" },
  { name: "Nagpur", x: 48, y: 46, status: "future" },
  { name: "Pune", x: 36, y: 58, status: "future" },
];

/* ------------------------------------------------------------------ */
/*  Roadmap                                                            */
/* ------------------------------------------------------------------ */

export interface RoadmapItem {
  year: string;
  icon: LucideIcon;
  title: Localized;
  body: Localized;
}

export const ROADMAP: RoadmapItem[] = [
  { year: "2026", icon: SprayCan, title: { en: "Drone Spraying at Scale" }, body: { en: "Expanding certified operators across Telangana." } },
  { year: "2027", icon: BrainCircuit, title: { en: "AI Crop Analysis" }, body: { en: "NDVI health maps and pest detection for every booking." } },
  { year: "2028", icon: SatelliteDish, title: { en: "Satellite Farming" }, body: { en: "Season-long, satellite-linked field intelligence." } },
  { year: "2029", icon: Store, title: { en: "Agri Marketplace" }, body: { en: "Inputs, advisory and services in one farmer app." } },
  { year: "2030", icon: Plane, title: { en: "Autonomous Smart Farming" }, body: { en: "Fully autonomous drone fleets serving millions of acres." } },
];

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

export interface Faq {
  q: Localized;
  a: Localized;
}

export const FAQS: Faq[] = [
  {
    q: { en: "How do I book a drone spraying service?" },
    a: { en: "Tap ‘Book a Drone’, share your name, mobile, village, date, crop and acreage. Our team confirms your slot on WhatsApp." },
  },
  {
    q: { en: "Which crops do you spray?" },
    a: { en: "Paddy, maize, chilli, cotton, sugarcane and orchards today — and we're always adding more." },
  },
  {
    q: { en: "How much does it cost?" },
    a: { en: "Drone spraying can cut costs by up to 30% versus manual labour. Final pricing depends on crop, chemical and acreage — our team shares an exact quote when confirming." },
  },
  {
    q: { en: "Is it safe for my crop and for me?" },
    a: { en: "Yes. Certified operators fly GPS-guided routes with calibrated dosing, and you stay completely clear of chemical exposure." },
  },
  {
    q: { en: "Do you bring your own pesticide?" },
    a: { en: "You can provide your own chemical or ask our crop advisor to recommend and arrange the right one for your crop." },
  },
  {
    q: { en: "Which areas do you serve?" },
    a: { en: "We currently operate across Telangana — including Hyderabad, Warangal, Khammam and Nizamabad — and are expanding fast." },
  },
];

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */

export interface Testimonial {
  name: string;
  place: string;
  quote: Localized;
  image: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ramesh Reddy", place: "Telangana", image: "feedback-1.jpg",
    quote: { en: "The drone sprayed my paddy in minutes. No more carrying heavy tanks in the sun." },
  },
  {
    name: "Krishna & Team", place: "Warangal", image: "feedback-standing.jpg",
    quote: { en: "Even coverage, less chemical, and my whole field done before noon. Truly the future." },
  },
  {
    name: "Srinivas Rao", place: "Khammam", image: "feedback-pointing.jpg",
    quote: { en: "Booking was simple and the team confirmed on WhatsApp. My cotton has never looked healthier." },
  },
];

/* ------------------------------------------------------------------ */
/*  Team                                                               */
/* ------------------------------------------------------------------ */

export interface Member {
  name: string;
  role: Localized;
  image: string;
  linkedin?: string;
}

export const TEAM: Member[] = [
  { name: "Karthikeya Gundlapally", role: { en: "Founder & CEO" }, image: "karthik.png", linkedin: SITE.linkedin },
  { name: "Lingagari Thirumal Reddy", role: { en: "Director" }, image: "terumal.jpeg" },
];

/* ------------------------------------------------------------------ */
/*  Dashboard preview mock data                                        */
/* ------------------------------------------------------------------ */

export const DASHBOARD_BOOKINGS = [
  { id: "MK-2041", farmer: "R. Reddy", crop: "Paddy", acres: 4.5, status: "Spraying" },
  { id: "MK-2042", farmer: "S. Rao", crop: "Cotton", acres: 8.0, status: "Assigned" },
  { id: "MK-2043", farmer: "K. Team", crop: "Chilli", acres: 3.2, status: "Completed" },
  { id: "MK-2044", farmer: "M. Devi", crop: "Maize", acres: 6.1, status: "New" },
];
