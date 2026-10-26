"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Sprout,
  Heart,
  Package,
  Bell,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { User } from "@/lib/marketplace/types";
import { ComparisonProvider } from "./Comparison";

const ERRORS: Record<string, [string, string]> = {
  sign_in: ["Please sign in to continue.", "కొనసాగించడానికి సైన్ ఇన్ చేయండి."],
  server_error: [
    "Marketplace storage is unavailable. Please retry or contact support.",
    "మార్కెట్ నిల్వ అందుబాటులో లేదు. మళ్లీ ప్రయత్నించండి లేదా సహాయం పొందండి.",
  ],
  invalid_account: [
    "Enter a name, valid email and a password of 12–128 characters.",
    "పేరు, సరైన ఇమెయిల్, 12–128 అక్షరాల పాస్‌వర్డ్ నమోదు చేయండి.",
  ],
  invalid_login: [
    "Email or password is incorrect, or this account is unavailable.",
    "ఇమెయిల్ లేదా పాస్‌వర్డ్ తప్పు, లేదా ఖాతా అందుబాటులో లేదు.",
  ],
  account_exists: [
    "An account already exists for this email.",
    "ఈ ఇమెయిల్‌తో ఖాతా ఇప్పటికే ఉంది.",
  ],
  invalid_fields: [
    "Check all required fields and text lengths.",
    "అవసరమైన వివరాలు మరియు అక్షర పరిమితిని సరిచూడండి.",
  ],
  invalid_contact: [
    "Enter a valid Indian mobile number and PIN code.",
    "సరైన భారత మొబైల్ నంబర్, పిన్ కోడ్ నమోదు చేయండి.",
  ],
  images_required: [
    "Add 1–5 crop photographs before publishing.",
    "ప్రచురించే ముందు 1–5 పంట చిత్రాలు జోడించండి.",
  ],
  invalid_image: [
    "Use your own JPEG, PNG or WebP crop photographs.",
    "మీ JPEG, PNG లేదా WebP పంట చిత్రాలు ఉపయోగించండి.",
  ],
  upload_too_large: [
    "Upload a JPEG, PNG or WebP image under 5 MB.",
    "5 MB కంటే తక్కువ JPEG, PNG లేదా WebP చిత్రాన్ని అప్‌లోడ్ చేయండి.",
  ],
  stock_unavailable: [
    "Stock, price or availability changed. Refresh your cart and check quantities.",
    "స్టాక్ లేదా లభ్యత మారింది. కార్ట్ రిఫ్రెష్ చేసి పరిమాణం సరిచూడండి.",
  ],
  stale_listing: [
    "This listing changed. Reload it before saving.",
    "ఈ లిస్టింగ్ మారింది. సేవ్ చేసే ముందు మళ్లీ లోడ్ చేయండి.",
  ],
  invalid_quantity: [
    "Enter a valid quantity with at most 3 decimal places.",
    "గరిష్టంగా 3 దశాంశాలతో సరైన పరిమాణం నమోదు చేయండి.",
  ],
  minimum_stock: [
    "Minimum order must not exceed available stock.",
    "కనీస ఆర్డర్ స్టాక్ కంటే ఎక్కువ ఉండకూడదు.",
  ],
  invalid_maximum: [
    "Maximum order must be at least the minimum order.",
    "గరిష్ట ఆర్డర్ కనీస ఆర్డర్ కంటే తక్కువ ఉండకూడదు.",
  ],
  forbidden: [
    "You do not have permission for this action.",
    "ఈ చర్యకు మీకు అనుమతి లేదు.",
  ],
  farmer_required: [
    "A farmer account is required to sell produce.",
    "పంటలు అమ్మడానికి రైతు ఖాతా అవసరం.",
  ],
  rate_limit: [
    "Too many attempts. Please wait before trying again.",
    "చాలా ప్రయత్నాలు చేశారు. కొంతసేపు వేచి ఉండండి.",
  ],
  fulfillment_mismatch: [
    "Choose a fulfillment method supported by every item, or remove incompatible items.",
    "అన్ని ఉత్పత్తులకు సరిపోయే డెలివరీ పద్ధతిని ఎంచుకోండి లేదా సరిపోని వాటిని తొలగించండి.",
  ],
  empty_cart: ["Your cart is empty.", "మీ కార్ట్ ఖాళీగా ఉంది."],
  organic_evidence: [
    "Describe your organic certification or growing practices. Admin review is required.",
    "సేంద్రియ ధృవీకరణ లేదా సాగు పద్ధతులు వివరించండి. అడ్మిన్ సమీక్ష అవసరం.",
  ],
  not_found: ["This crop is no longer available.", "ఈ పంట అందుబాటులో లేదు."],
  invalid_transition: [
    "This action is no longer available. Refresh and try again.",
    "ఈ చర్య ఇప్పుడు అందుబాటులో లేదు. రిఫ్రెష్ చేయండి.",
  ],
  own_listing: [
    "You cannot buy or enquire about your own listing.",
    "మీ స్వంత లిస్టింగ్ కొనుగోలు చేయలేరు.",
  ],
  active_orders: [
    "Complete or resolve active orders before deleting this listing.",
    "లిస్టింగ్ తొలగించే ముందు క్రియాశీల ఆర్డర్లను పరిష్కరించండి.",
  ],
  unit_locked: [
    "The unit cannot change while orders are active.",
    "ఆర్డర్లు ఉన్నప్పుడు యూనిట్ మార్చలేరు.",
  ],
  reason_required: ["Please provide a reason.", "కారణం నమోదు చేయండి."],
  not_available_yet: [
    "This crop is not available for collection yet.",
    "ఈ పంట ఇంకా సేకరణకు సిద్ధంగా లేదు.",
  ],
  invalid_price: [
    "Enter a valid price with at most 2 decimal places.",
    "గరిష్టంగా 2 దశాంశాలతో సరైన ధర నమోదు చేయండి.",
  ],
  invalid_date: ["Choose a valid calendar date.", "సరైన తేదీ ఎంచుకోండి."],
  image_limit: [
    "Your upload limit has been reached. Contact support.",
    "మీ అప్‌లోడ్ పరిమితి చేరుకుంది. సహాయం పొందండి.",
  ],
  invalid_origin: [
    "Please refresh the page and try again.",
    "పేజీ రిఫ్రెష్ చేసి మళ్లీ ప్రయత్నించండి.",
  ],
  order_too_large: [
    "This request exceeds the supported order limit. Contact the seller.",
    "ఆర్డర్ పరిమితి మించిపోయింది. విక్రేతను సంప్రదించండి.",
  ],
  invalid_unit: ["Choose a supported unit.", "సరైన యూనిట్ ఎంచుకోండి."],
  invalid_category: ["Choose a crop category.", "పంట వర్గాన్ని ఎంచుకోండి."],
  invalid_fulfillment: [
    "Choose pickup or delivery.",
    "పికప్ లేదా డెలివరీ ఎంచుకోండి.",
  ],
  invalid_request: [
    "Refresh the checkout and try again.",
    "చెకౌట్ రిఫ్రెష్ చేసి ప్రయత్నించండి.",
  ],
  invalid_role: [
    "Choose buyer or farmer.",
    "కొనుగోలుదారు లేదా రైతును ఎంచుకోండి.",
  ],
  invalid_location: [
    "Check the farm coordinates.",
    "పొలం అక్షాంశం, రేఖాంశం సరిచూడండి.",
  ],
};
export const STATUS: Record<string, [string, string]> = {
  published: ["Available", "అందుబాటులో ఉంది"],
  pending: ["Under review", "సమీక్షలో ఉంది"],
  draft: ["Draft", "డ్రాఫ్ట్"],
  paused: ["Paused", "నిలిపివేయబడింది"],
  unavailable: ["Unavailable", "అందుబాటులో లేదు"],
  rejected: ["Rejected", "తిరస్కరించబడింది"],
  corrections: ["Changes requested", "మార్పులు అవసరం"],
  awaiting_confirmation: [
    "Awaiting seller confirmation",
    "విక్రేత నిర్ధారణ కోసం",
  ],
  confirmed: ["Confirmed", "నిర్ధారించబడింది"],
  preparing: ["Preparing", "సిద్ధం చేస్తున్నారు"],
  ready: ["Ready for pickup / dispatch", "సేకరణ / పంపిణీకి సిద్ధం"],
  shipped: ["Shipped", "పంపబడింది"],
  delivered: ["Delivered / collected", "అందింది / సేకరించారు"],
  cancelled: ["Cancelled", "రద్దయింది"],
};
type Context = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  revision: number;
  changed: () => void;
  api: <T = Record<string, unknown>>(
    path: string,
    body?: unknown,
  ) => Promise<T>;
  notice: (value: string) => void;
  c: (en: string, te: string) => string;
  status: (value: string) => string;
};
const Ctx = createContext<Context | null>(null);
export const useMarket = () => {
  const c = useContext(Ctx);
  if (!c) throw Error("Missing marketplace provider");
  return c;
};
export function MarketProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0),
    [toast, setToast] = useState("");
  const c = useCallback(
    (en: string, te: string) => (locale === "te" ? te : en),
    [locale],
  );
  const api = useCallback(
    async <T,>(path: string, body?: unknown): Promise<T> => {
      const response = await fetch(`/api/marketplace/${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers:
          body instanceof FormData
            ? undefined
            : body === undefined
              ? undefined
              : { "Content-Type": "application/json" },
        body:
          body === undefined
            ? undefined
            : body instanceof FormData
              ? body
              : JSON.stringify(body),
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        const pair = ERRORS[data.error] || [
          "Unable to complete this action. Check your details and try again.",
          "చర్య పూర్తి కాలేదు. వివరాలు సరిచూసి ప్రయత్నించండి.",
        ];
        throw Error(c(...pair));
      }
      return data as T;
    },
    [c],
  );
  const refresh = useCallback(async () => {
    try {
      const d = await api<{ user: User | null }>("session");
      setUser(d.user);
    } finally {
      setLoading(false);
    }
  }, [api]);
  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  const status = (s: string) => (STATUS[s] ? c(...STATUS[s]) : s);
  const nav = [
    [
      /^\/marketplace$/,
      "/marketplace",
      c("Crops & inputs", "పంటలు & ఇన్‌పుట్లు"),
      Sprout,
    ],
    [
      /^\/marketplace\/sell|my-listings/,
      "/marketplace/my-listings",
      c("My harvest", "నా పంటలు"),
      Sprout,
    ],
    [
      /^\/marketplace\/wishlist/,
      "/marketplace/wishlist",
      c("Saved", "సేవ్ చేసినవి"),
      Heart,
    ],
    [
      /^\/marketplace\/cart|checkout/,
      "/marketplace/cart",
      c("Cart", "కార్ట్"),
      ShoppingBag,
    ],
    [
      /^\/marketplace\/orders/,
      "/marketplace/orders",
      c("Orders", "ఆర్డర్లు"),
      Package,
    ],
  ] as const;
  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        refresh,
        revision,
        changed: () => setRevision((x) => x + 1),
        api,
        notice: setToast,
        c,
        status,
      }}
    >
      <div className="marketplace min-h-screen bg-[#f7f8f3] pt-[88px]">
        <div className="mk-market-nav">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 font-heading text-xl font-semibold text-[#166534]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8efd9]">
                <Sprout size={20} />
              </span>
              {c("Marketplace", "రైతు మార్కెట్")}
            </Link>
            <div className="flex items-center gap-3 text-xs">
              {user ? (
                <>
                  <Link
                    href="/marketplace/account"
                    className="max-w-32 truncate font-semibold"
                  >
                    {user.name}
                  </Link>
                  <Link
                    href="/marketplace/notifications"
                    aria-label={c("Notifications", "నోటిఫికేషన్లు")}
                    className="mk-icon"
                  >
                    <Bell size={18} />
                  </Link>
                  <button
                    className="mk-icon"
                    aria-label={c("Sign out", "సైన్ అవుట్")}
                    onClick={async () => {
                      try {
                        await api("logout", {});
                        await refresh();
                        changedAfter();
                      } catch (e) {
                        setToast((e as Error).message);
                      }
                    }}
                  >
                    <LogOut size={17} />
                  </button>
                </>
              ) : (
                <Link href="/marketplace/account" className="mk-secondary">
                  {c("Sign in", "సైన్ ఇన్")}
                </Link>
              )}
              {user?.role === "admin" && (
                <Link href="/admin/marketplace" className="mk-secondary">
                  {c("Admin", "అడ్మిన్")}
                </Link>
              )}
              <Link href="/marketplace/sell" className="mk-btn">
                {c("Sell your harvest", "మీ పంట అమ్మండి")}
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <nav
            aria-label={c("Marketplace navigation", "మార్కెట్ నావిగేషన్")}
            className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 pb-3"
          >
            {nav.map(([test, href, label, Icon]) => (
              <Link
                key={href}
                href={href}
                aria-current={test.test(pathname) ? "page" : undefined}
                className={`mk-tab ${test.test(pathname) ? "selected" : ""}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <ComparisonProvider api={api} c={c} notice={setToast}>
          {children}
        </ComparisonProvider>
        <div className="mx-auto mt-16 grid max-w-7xl gap-7 border-t border-green/15 px-5 py-10 sm:grid-cols-3">
          <div>
            <p className="font-heading text-xl text-green">
              {c("From Farmers to Families", "రైతుల నుండి కుటుంబాలకు")}
            </p>
            <p className="mt-2 text-xs leading-6 text-muted">
              {c(
                "A direct connection to the people who grow your food.",
                "మీ ఆహారం పండించే రైతులతో నేరుగా పరిచయం.",
              )}
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/marketplace/sell">
              {c("List your crop", "మీ పంట లిస్టింగ్")}
            </Link>
            <Link href="/marketplace/orders">
              {c("Orders & enquiries", "ఆర్డర్లు & విచారణలు")}
            </Link>
            <Link href="/marketplace/policies">
              {c("Buying, selling & safety", "కొనుగోలు, అమ్మకం & భద్రత")}
            </Link>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/support">{c("Contact support", "సహాయం పొందండి")}</Link>
            <Link href="/privacy-policy">
              {c("Privacy policy", "గోప్యతా విధానం")}
            </Link>
            <Link href="/terms">{c("Terms of use", "నిబంధనలు")}</Link>
          </div>
        </div>
        {toast && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-[80] w-[90%] max-w-md -translate-x-1/2 rounded-2xl bg-forest px-5 py-4 text-sm text-white shadow-xl"
          >
            {toast}
            <button className="ml-3 underline" onClick={() => setToast("")}>
              {c("Close", "మూసివేయి")}
            </button>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
  function changedAfter() {
    setRevision((x) => x + 1);
  }
}
export function PageHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-8">
      <p className="mk-eyebrow">{eyebrow || "MANAKRISHI"}</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {body && (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{body}</p>
      )}
    </div>
  );
}
export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="mk-empty">
      <Sprout size={36} className="mx-auto mb-4 text-green/50" />
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
        {body}
      </p>
      <div className="mt-5">{action}</div>
    </div>
  );
}
export function Skeleton() {
  return (
    <div
      role="status"
      className="grid gap-5 py-8 sm:grid-cols-3"
      aria-label="Loading"
    >
      <div className="mk-skeleton" />
      <div className="mk-skeleton" />
      <div className="mk-skeleton" />
    </div>
  );
}
export function AuthGate({
  children,
  farmer = false,
  admin = false,
}: {
  children: ReactNode;
  farmer?: boolean;
  admin?: boolean;
}) {
  const { user, loading, c } = useMarket();
  if (loading) return <Skeleton />;
  if (!user)
    return (
      <Empty
        title={c("Welcome to your farm market", "మీ రైతు మార్కెట్‌కు స్వాగతం")}
        body={c(
          "Sign in to save crops, manage listings and track your orders.",
          "పంటలు సేవ్ చేయడానికి, లిస్టింగ్‌లు మరియు ఆర్డర్లు నిర్వహించడానికి సైన్ ఇన్ చేయండి.",
        )}
        action={
          <Link href="/marketplace/account" className="mk-btn">
            {c("Sign in / create account", "సైన్ ఇన్ / ఖాతా సృష్టించండి")}
          </Link>
        }
      />
    );
  if ((farmer && user.role !== "farmer") || (admin && user.role !== "admin"))
    return (
      <Empty
        title={c("Access restricted", "ప్రవేశం పరిమితం")}
        body={c(
          farmer
            ? "Use a farmer account to list produce."
            : "This area is for marketplace administrators.",
          farmer
            ? "పంటలు అమ్మడానికి రైతు ఖాతా వాడండి."
            : "ఇది మార్కెట్ అడ్మిన్ల కోసం.",
        )}
      />
    );
  return <>{children}</>;
}
