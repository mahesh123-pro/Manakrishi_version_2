"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  LayoutDashboard,
  Sprout,
  Users,
  Package,
  Flag,
  MessageSquare,
  ScrollText,
  Settings2,
  ArrowUpRight,
  Search,
  RefreshCw,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import {
  money,
  type Listing,
  type Order,
  type User,
} from "@/lib/marketplace/types";
import { AuthGate, Empty, Skeleton, useMarket } from "./MarketProvider";
import { Rules } from "./Manage";
import { ServiceBookings } from "./ServiceBookings";

type Enquiry = {
  id: string;
  listingId: string;
  crop: string;
  buyer: string;
  seller: string;
  message: string;
  reply: string;
  createdAt: string;
};
type Audit = {
  id: number;
  action: string;
  actor: string;
  targetId: string;
  detail: string;
  createdAt: string;
};
type AdminData = {
  listings: Listing[];
  users: User[];
  orders: Order[];
  enquiries: Enquiry[];
  reports: {
    id: string;
    listingId: string;
    crop: string;
    reporter: string;
    reason: string;
    status: string;
    resolution: string;
  }[];
  audit: Audit[];
  settings: {
    disabledCategories: string[];
    disabledUnits: string[];
    rules: string;
  };
  metrics: {
    active: number;
    pending: number;
    orderValue: number;
    completedValue: number;
  };
};
const TABS = [
  ["overview", "Overview", "అవలోకనం", LayoutDashboard],
  ["bookings", "Service bookings", "సేవా బుకింగ్‌లు", CalendarDays],
  ["listings", "Crop reviews", "పంట సమీక్షలు", Sprout],
  ["users", "People", "ఖాతాలు", Users],
  ["orders", "Orders", "ఆర్డర్లు", Package],
  ["enquiries", "Conversations", "సంభాషణలు", MessageSquare],
  ["reports", "Reports", "నివేదికలు", Flag],
  ["audit", "Activity log", "చర్యల చరిత్ర", ScrollText],
  ["rules", "Market settings", "మార్కెట్ సెట్టింగ్‌లు", Settings2],
] as const;
type Tab = (typeof TABS)[number][0];
type Pending = {
  id: string;
  title: string;
  action: string;
  order?: boolean;
  reply?: boolean;
};
function date(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
function Badge({ value }: { value: string }) {
  return (
    <span
      className={`admin-badge ${["published", "delivered", "active", "resolved"].includes(value) ? "admin-badge-good" : ["rejected", "cancelled", "suspended"].includes(value) ? "admin-badge-danger" : ""}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
export function Admin() {
  return (
    <div className="admin-workspace">
      <AuthGate admin>
        <Workspace />
      </AuthGate>
    </div>
  );
}
function Workspace() {
  const { api, c, status, user, notice, revision, changed } = useMarket();
  const [data, setData] = useState<AdminData | null>(null),
    [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview"),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false),
    [retry, setRetry] = useState(0),
    [pending, setPending] = useState<Pending | null>(null);
  const [note, setNote] = useState(""),
    [busy, setBusy] = useState(false),
    [actionError, setActionError] = useState("");
  const [limit, setLimit] = useState(20);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    let alive = true;
    setRefreshing(true);
    api<AdminData>("admin")
      .then((next) => {
        if (alive) {
          setData(next);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setRefreshing(false);
      });
    return () => {
      alive = false;
    };
  }, [api, revision, retry]);
  useEffect(() => {
    if (pending) dialog.current?.showModal();
    else dialog.current?.close();
  }, [pending]);
  function navigate(next: Tab, nextFilter = "all") {
    setTab(next);
    setFilter(nextFilter);
    setSearch("");
    setLimit(20);
  }
  function request(
    id: string,
    action: string,
    title: string,
    order = false,
    reply = false,
  ) {
    setPending({ id, action, title, order, reply });
    setNote("");
    setActionError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!pending || busy) return;
    setBusy(true);
    setActionError("");
    try {
      await api(
        pending.order ? "order-action" : "admin",
        pending.order
          ? { id: pending.id, status: pending.action, reason: note }
          : {
              id: pending.id,
              action: pending.action,
              reason: note,
              ...(pending.reply ? { reply: note } : {}),
            },
      );
      changed();
      setPending(null);
      notice(
        c("Action saved to the activity log", "చర్య చరిత్రలో సేవ్ చేయబడింది"),
      );
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!data && error)
    return (
      <Empty
        title={c("Workspace could not load", "వర్క్‌స్పేస్ లోడ్ కాలేదు")}
        body={error}
        action={
          <button className="mk-btn" onClick={() => setRetry((v) => v + 1)}>
            {c("Retry", "మళ్లీ ప్రయత్నించు")}
          </button>
        }
      />
    );
  if (!data) return <Skeleton />;
  const openReports = data.reports.filter((r) => r.status === "open").length;
  const unanswered = data.enquiries.filter((e) => !e.reply).length;
  const awaiting = data.orders.filter(
    (o) => o.status === "awaiting_confirmation",
  ).length;
  const matches = (...values: unknown[]) =>
    values.join(" ").toLowerCase().includes(search.toLowerCase().trim());
  const listings = data.listings.filter(
    (l) =>
      (filter === "all" || l.status === filter) &&
      matches(l.crop, l.seller, l.district, l.id),
  );
  const users = data.users.filter(
    (u) =>
      (filter === "all" ||
        (filter === "suspended"
          ? u.suspended
          : filter === "unverified"
            ? u.role === "farmer" && !u.verified
            : filter === "fpo"
              ? Boolean(u.fpo)
              : u.role === filter)) &&
      matches(u.name, u.email, u.phone, u.id),
  );
  const orders = data.orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      matches(o.id, o.buyer, o.seller, ...o.items.map((i) => i.crop)),
  );
  const reports = data.reports.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      matches(r.reason, r.crop, r.reporter, r.id),
  );
  const enquiries = data.enquiries.filter(
    (e) =>
      (filter === "all" ||
        (filter === "unanswered" ? !e.reply : Boolean(e.reply))) &&
      matches(e.crop, e.buyer, e.seller, e.message),
  );
  const audit = data.audit.filter((a) =>
    matches(a.action, a.actor, a.targetId, a.detail),
  );
  const count = {
    listings: listings.length,
    users: users.length,
    orders: orders.length,
    reports: reports.length,
    enquiries: enquiries.length,
    audit: audit.length,
    bookings: 0,
    overview: 0,
    rules: 0,
  }[tab];
  const filters: Record<string, string[]> = {
    listings: [
      "pending",
      "published",
      "corrections",
      "draft",
      "paused",
      "rejected",
      "unavailable",
    ],
    users: ["farmer", "buyer", "admin", "fpo", "unverified", "suspended"],
    orders: [
      "awaiting_confirmation",
      "confirmed",
      "preparing",
      "ready",
      "shipped",
      "delivered",
      "rejected",
      "cancelled",
    ],
    reports: ["open", "resolved"],
    enquiries: ["unanswered", "answered"],
  };
  const activeTab = TABS.find((t) => t[0] === tab)!;
  const actionButton = (
    id: string,
    action: string,
    label: string,
    order = false,
  ) => (
    <button
      key={action}
      className="mk-secondary"
      disabled={refreshing || busy}
      onClick={() => request(id, action, label, order)}
    >
      {label}
    </button>
  );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <ShieldCheck size={26} />
          <div>
            <strong>Manakrishi</strong>
            <span>{c("Admin workspace", "అడ్మిన్ వర్క్‌స్పేస్")}</span>
          </div>
        </div>
        <nav aria-label={c("Administration", "అడ్మిన్ నావిగేషన్")}>
          {TABS.map(([id, en, te, Icon]) => (
            <button
              key={id}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => navigate(id)}
              className={tab === id ? "selected" : ""}
            >
              <Icon size={18} />
              <span>{c(en, te)}</span>
              {id === "listings" && data.metrics.pending > 0 && (
                <small>{data.metrics.pending}</small>
              )}
              {id === "reports" && openReports > 0 && (
                <small>{openReports}</small>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-note">
          <Sprout size={22} />
          <p>
            {c(
              "A healthier market starts with thoughtful care.",
              "మంచి మార్కెట్ శ్రద్ధతో మొదలవుతుంది.",
            )}
          </p>
          <Link href="/marketplace">
            {c("View marketplace", "మార్కెట్ చూడండి")}{" "}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="mk-eyebrow">
              {c("Marketplace operations", "మార్కెట్ నిర్వహణ")}
            </p>
            <h1>{c(activeTab[1], activeTab[2])}</h1>
            <p className="text-sm text-muted">
              {c("Welcome back", "తిరిగి స్వాగతం")}, {user?.name}.
            </p>
          </div>
          <button
            className="mk-secondary"
            disabled={refreshing}
            onClick={() => setRetry((v) => v + 1)}
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {c(
              refreshing ? "Refreshing…" : "Refresh",
              refreshing ? "లోడ్ అవుతోంది…" : "రిఫ్రెష్",
            )}
          </button>
        </header>
        {error && (
          <p className="mk-error mb-5" role="alert">
            {error}{" "}
            {c(
              "Showing the last loaded data.",
              "చివరిగా లోడ్ చేసిన వివరాలు చూపిస్తున్నాం.",
            )}
          </p>
        )}
        {tab === "bookings" ? (
          <ServiceBookings />
        ) : tab === "overview" ? (
          <>
            <section className="admin-welcome">
              <div>
                <span className="admin-welcome-label">
                  {c("From review to delivery", "సమీక్ష నుండి డెలివరీ వరకు")}
                </span>
                <h2>
                  {c("Keep every harvest moving.", "ప్రతి పంట ముందుకు సాగాలి.")}
                </h2>
                <p>
                  {c(
                    "Review the queue, support your growers, and follow each order through to completion.",
                    "పంటలు సమీక్షించండి, రైతులకు సహాయం చేయండి, ప్రతి ఆర్డర్‌ను పూర్తయ్యేవరకు నిర్వహించండి.",
                  )}
                </p>
                <button
                  className="mk-btn mt-5"
                  onClick={() => navigate("listings", "pending")}
                >
                  {c("Review crop queue", "పంటల సమీక్ష")}
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <Sprout className="admin-welcome-art" aria-hidden="true" />
            </section>
            <div className="admin-stats">
              {[
                [
                  c("Live crops", "ప్రచురించిన పంటలు"),
                  data.metrics.active,
                  Sprout,
                ],
                [
                  c("Awaiting review", "సమీక్ష కోసం"),
                  data.metrics.pending,
                  Clock3,
                ],
                [c("Accounts", "ఖాతాలు"), data.users.length, Users],
                [
                  c("Delivered orders", "పూర్తయిన ఆర్డర్లు"),
                  data.orders.filter((o) => o.status === "delivered").length,
                  CheckCircle2,
                ],
              ].map(([label, value, Icon]) => {
                const I = Icon as typeof Sprout;
                return (
                  <div className="admin-stat" key={String(label)}>
                    <I size={19} />
                    <p>{String(label)}</p>
                    <strong>{String(value)}</strong>
                  </div>
                );
              })}
            </div>
            <div className="admin-overview-grid">
              <section className="admin-panel">
                <h2>{c("Needs your attention", "మీ శ్రద్ధ అవసరం")}</h2>
                {[
                  [
                    "listings",
                    "pending",
                    c("Crop reviews", "పంట సమీక్షలు"),
                    data.metrics.pending,
                  ],
                  [
                    "orders",
                    "awaiting_confirmation",
                    c("Awaiting farmer confirmation", "రైతు నిర్ధారణ కోసం"),
                    awaiting,
                  ],
                  [
                    "reports",
                    "open",
                    c("Open reports", "పరిష్కరించని నివేదికలు"),
                    openReports,
                  ],
                  [
                    "enquiries",
                    "unanswered",
                    c("Unanswered conversations", "సమాధానం లేని సందేశాలు"),
                    unanswered,
                  ],
                ].map(([id, f, label, n]) => (
                  <button
                    className="admin-queue-row"
                    key={String(id)}
                    onClick={() => navigate(id as Tab, String(f))}
                  >
                    <span>{label}</span>
                    <strong>{n}</strong>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </section>
              <section className="admin-panel">
                <h2>{c("Order value", "ఆర్డర్ విలువ")}</h2>
                <p className="admin-value">{money(data.metrics.orderValue)}</p>
                <p className="text-xs text-muted">
                  {c(
                    "Excludes cancelled and rejected requests. This is not collected revenue.",
                    "రద్దు, తిరస్కరించిన ఆర్డర్లు మినహాయించబడ్డాయి. ఇది సేకరించిన ఆదాయం కాదు.",
                  )}
                </p>
                <div className="mt-6 border-t border-green/10 pt-5">
                  <p className="text-xs text-muted">
                    {c("Delivered produce value", "అందించిన పంట విలువ")}
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {money(data.metrics.completedValue)}
                  </p>
                </div>
              </section>
            </div>
            <section className="admin-panel mt-6">
              <div className="flex items-center justify-between gap-3">
                <h2>{c("Recent activity", "ఇటీవలి చర్యలు")}</h2>
                <button
                  className="text-sm text-green underline"
                  onClick={() => navigate("audit")}
                >
                  {c("View log", "చరిత్ర చూడండి")}
                </button>
              </div>
              {data.audit.length ? (
                data.audit
                  .slice(0, 5)
                  .map((a) => <Activity key={a.id} item={a} />)
              ) : (
                <p className="py-8 text-sm text-muted">
                  {c(
                    "Admin actions will appear here.",
                    "అడ్మిన్ చర్యలు ఇక్కడ కనిపిస్తాయి.",
                  )}
                </p>
              )}
            </section>
          </>
        ) : tab === "rules" ? (
          <Rules key={JSON.stringify(data.settings)} settings={data.settings} />
        ) : (
          <>
            <div className="admin-toolbar">
              <label className="admin-search">
                <Search size={17} />
                <input
                  aria-label={c("Search admin records", "వివరాల శోధన")}
                  placeholder={c(
                    "Search names, crops or reference…",
                    "పేర్లు, పంటలు లేదా రిఫరెన్స్…",
                  )}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setLimit(20);
                  }}
                />
              </label>
              {filters[tab] && (
                <select
                  className="mk-input !mt-0 !w-auto"
                  aria-label={c("Filter records", "ఫిల్టర్")}
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setLimit(20);
                  }}
                >
                  <option value="all">
                    {c("All statuses", "అన్ని స్థితులు")}
                  </option>
                  {filters[tab].map((f) => (
                    <option value={f} key={f}>
                      {status(f)}
                    </option>
                  ))}
                </select>
              )}
              <span className="text-xs text-muted" aria-live="polite">
                {count} {c("records", "వివరాలు")}
              </span>
            </div>
            {!count && (
              <Empty
                title={c("Nothing here yet", "ఇక్కడ ఇంకా ఏమీ లేదు")}
                body={c(
                  "Records matching your search will appear here. Try another filter or refresh the workspace.",
                  "మీ శోధనకు సరిపోయే వివరాలు ఇక్కడ కనిపిస్తాయి. ఫిల్టర్ మార్చండి లేదా రిఫ్రెష్ చేయండి.",
                )}
              />
            )}
            <div className="space-y-4">
              {tab === "listings" &&
                listings.slice(0, limit).map((l) => (
                  <article className="admin-panel admin-listing" key={l.id}>
                    {l.images[0] ? (
                      <Image
                        unoptimized
                        src={l.images[0]}
                        alt={l.crop}
                        width={160}
                        height={160}
                        className="admin-crop-photo"
                      />
                    ) : (
                      <div className="admin-crop-photo grid place-items-center bg-green/5">
                        <Sprout size={30} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2>
                          {l.crop}{" "}
                          <span className="text-sm font-normal text-muted">
                            · {l.variety}
                          </span>
                        </h2>
                        <Badge value={l.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {l.seller} · {l.district}, {l.state}
                      </p>
                      <p className="my-3 text-sm">
                        {money(Math.round(l.price * 100))} / {l.unit}{" "}
                        <span className="text-muted">
                          · {l.quantity} {l.unit} · {c("Min.", "కనీసం")}{" "}
                          {l.minimum} {l.unit}
                        </span>
                      </p>
                      <p className="text-sm text-muted">{l.description}</p>
                      {l.moderation && (
                        <p className="mt-2 text-xs text-muted">
                          {c("Last review", "చివరి సమీక్ష")}: {l.moderation}
                        </p>
                      )}
                      <div className="admin-actions">
                        <Link
                          href={`/marketplace/product/${l.id}`}
                          className="mk-secondary"
                        >
                          {c("Full details", "పూర్తి వివరాలు")}
                          <ArrowUpRight size={14} />
                        </Link>
                        {[
                          "pending",
                          "corrections",
                          "rejected",
                          "paused",
                        ].includes(l.status) &&
                          actionButton(
                            l.id,
                            "approve",
                            c("Approve", "ఆమోదించు"),
                          )}
                        {l.status !== "draft" &&
                          actionButton(
                            l.id,
                            "corrections",
                            c("Request corrections", "మార్పులు కోరండి"),
                          )}
                        {l.status === "published"
                          ? actionButton(
                              l.id,
                              "unpublish",
                              c("Unpublish", "ప్రచురణ నిలిపివేయి"),
                            )
                          : l.status !== "draft" &&
                            actionButton(
                              l.id,
                              "reject",
                              c("Reject", "తిరస్కరించు"),
                            )}
                      </div>
                    </div>
                  </article>
                ))}
              {tab === "users" &&
                users.slice(0, limit).map((u) => (
                  <article className="admin-panel" key={u.id}>
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <h2>{u.name}</h2>
                        <p className="mt-1 break-all text-sm text-muted">
                          {u.phone || u.email}
                        </p>
                        <p className="mt-2 text-xs text-muted">
                          {u.role} ·{" "}
                          {[u.village, u.district, u.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-start gap-2">
                        <Badge value={u.suspended ? "suspended" : "active"} />
                        {Boolean(u.fpo) && <Badge value="FPO access" />}
                        {u.role === "farmer" && (
                          <Badge
                            value={u.verified ? "verified" : "unverified"}
                          />
                        )}
                      </div>
                    </div>
                    <div className="admin-actions">
                      {u.role !== "admin" && (
                        <>
                          {actionButton(
                            u.id,
                            u.fpo ? "revoke-fpo" : "grant-fpo",
                            c(
                              u.fpo ? "Remove FPO access" : "Enable FPO login",
                              u.fpo
                                ? "FPO ప్రవేశం తొలగించు"
                                : "FPO లాగిన్ ప్రారంభించు",
                            ),
                          )}
                        </>
                      )}
                      {u.role === "farmer" && (
                        <>
                          <Link
                            className="mk-secondary"
                            href={`/marketplace/farmer/${u.id}`}
                          >
                            {c("Farm profile", "రైతు వివరాలు")}
                          </Link>
                          {actionButton(
                            u.id,
                            u.verified ? "unverify" : "verify",
                            c(
                              u.verified
                                ? "Remove verification"
                                : "Verify with evidence",
                              u.verified
                                ? "ధృవీకరణ తొలగించు"
                                : "ఆధారాలతో ధృవీకరించు",
                            ),
                          )}
                        </>
                      )}
                      {u.role !== "admin" &&
                        actionButton(
                          u.id,
                          u.suspended ? "unsuspend" : "suspend",
                          c(
                            u.suspended ? "Restore account" : "Suspend account",
                            u.suspended
                              ? "ఖాతా పునరుద్ధరించు"
                              : "ఖాతా నిలిపివేయి",
                          ),
                        )}
                    </div>
                  </article>
                ))}
              {tab === "orders" &&
                orders.slice(0, limit).map((o) => {
                  const next: Record<string, string[]> = {
                    awaiting_confirmation: [
                      "confirmed",
                      "rejected",
                      "cancelled",
                    ],
                    confirmed: ["preparing", "cancelled"],
                    preparing: ["ready"],
                    ready: [
                      o.fulfillment === "delivery" ? "shipped" : "delivered",
                    ],
                    shipped: ["delivered"],
                  };
                  return (
                    <article className="admin-panel" key={o.id}>
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <h2>
                            {o.buyer} <span className="text-muted">→</span>{" "}
                            {o.seller}
                          </h2>
                          <p className="mt-2 break-all text-xs text-muted">
                            {o.id} · {date(o.createdAt)}
                          </p>
                        </div>
                        <Badge value={o.status} />
                      </div>
                      <div className="my-4 space-y-2 border-y border-green/10 py-4">
                        {o.items.map((i) => (
                          <div
                            key={i.listingId}
                            className="flex flex-wrap justify-between gap-2 text-sm"
                          >
                            <span>
                              {i.crop} · {i.quantity} {i.unit}
                            </span>
                            <strong>{money(i.subtotal)}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap justify-between gap-4">
                        <p className="text-sm">
                          {o.name} · {o.phone}
                          <br />
                          <span className="text-xs text-muted">
                            {o.fulfillment === "delivery"
                              ? `${o.address}, ${o.pin}`
                              : c("Farm pickup", "పొలం వద్ద సేకరణ")}
                          </span>
                        </p>
                        <strong>{money(o.total)}</strong>
                      </div>
                      {o.reason && (
                        <p className="mt-3 text-sm text-muted">{o.reason}</p>
                      )}
                      <div className="admin-actions">
                        {(next[o.status] || []).map((s) =>
                          actionButton(o.id, s, status(s), true),
                        )}
                      </div>
                    </article>
                  );
                })}
              {tab === "enquiries" &&
                enquiries.slice(0, limit).map((e) => (
                  <article className="admin-panel" key={e.id}>
                    <div className="flex flex-wrap justify-between gap-3">
                      <h2>
                        {e.crop} · {e.buyer}
                      </h2>
                      <Badge value={e.reply ? "answered" : "unanswered"} />
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {c("Farmer", "రైతు")}: {e.seller} · {date(e.createdAt)}
                    </p>
                    <p className="mt-4 whitespace-pre-wrap text-sm">
                      {e.message}
                    </p>
                    {e.reply && (
                      <div className="mt-4 rounded-xl bg-green/5 p-4 text-sm">
                        <strong>{c("Reply", "సమాధానం")}</strong>
                        <p className="mt-2 whitespace-pre-wrap">{e.reply}</p>
                      </div>
                    )}
                    <div className="admin-actions">
                      <Link
                        href={`/marketplace/product/${e.listingId}`}
                        className="mk-secondary"
                      >
                        {c("Open crop", "పంట చూడండి")}
                      </Link>
                      <button
                        disabled={refreshing || busy}
                        className="mk-btn"
                        onClick={() =>
                          request(
                            e.id,
                            "reply-enquiry",
                            c("Reply to conversation", "సందేశానికి సమాధానం"),
                            false,
                            true,
                          )
                        }
                      >
                        {c(
                          e.reply ? "Update reply" : "Reply",
                          e.reply ? "సమాధానం మార్చు" : "సమాధానం",
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              {tab === "reports" &&
                reports.slice(0, limit).map((r) => (
                  <article className="admin-panel" key={r.id}>
                    <div className="flex flex-wrap justify-between gap-3">
                      <h2>{r.crop}</h2>
                      <Badge value={r.status} />
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {c("Reported by", "నివేదించినది")}: {r.reporter}
                    </p>
                    <p className="mt-4 whitespace-pre-wrap text-sm">
                      {r.reason}
                    </p>
                    {r.resolution && (
                      <p className="mt-3 text-sm text-green">{r.resolution}</p>
                    )}
                    <div className="admin-actions">
                      <Link
                        className="mk-secondary"
                        href={`/marketplace/product/${r.listingId}`}
                      >
                        {c("Inspect listing", "లిస్టింగ్ చూడండి")}
                      </Link>
                      {r.status === "open" &&
                        actionButton(
                          r.id,
                          "resolve",
                          c("Resolve with note", "సూచనతో పరిష్కరించు"),
                        )}
                    </div>
                  </article>
                ))}
              {tab === "audit" && (
                <section className="admin-panel">
                  <p className="mb-4 text-xs text-muted">
                    {c(
                      "Most recent 100 recorded actions. Times shown in India Standard Time.",
                      "చివరి 100 చర్యలు. సమయాలు భారత ప్రామాణిక కాలంలో.",
                    )}
                  </p>
                  {audit.slice(0, limit).map((a) => (
                    <Activity key={a.id} item={a} />
                  ))}
                </section>
              )}
            </div>
            {count > limit && (
              <button
                className="mk-secondary mx-auto mt-6 flex"
                onClick={() => setLimit((n) => n + 20)}
              >
                {c("Show more records", "మరిన్ని వివరాలు")}
              </button>
            )}
          </>
        )}
      </div>
      <dialog
        ref={dialog}
        aria-label={pending?.title}
        onCancel={(event) => {
          if (busy) event.preventDefault();
          else setPending(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && !busy) setPending(null);
        }}
        className="admin-dialog"
      >
        <form onSubmit={submit}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mk-eyebrow">
                {c("Record an admin action", "అడ్మిన్ చర్య నమోదు")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold">
                {pending?.title}
              </h2>
            </div>
            <button
              type="button"
              className="mk-icon"
              disabled={busy}
              onClick={() => setPending(null)}
              aria-label={c("Close action", "మూసివేయి")}
            >
              <X size={20} />
            </button>
          </div>
          <p className="my-4 break-all text-xs text-muted">{pending?.id}</p>
          <label className="mk-label">
            {c(
              pending?.reply ? "Your reply" : "Reason / review evidence",
              pending?.reply ? "మీ సమాధానం" : "కారణం / సమీక్ష ఆధారం",
            )}
            <textarea
              autoFocus
              required
              maxLength={pending?.reply ? 1000 : 500}
              rows={5}
              className="mk-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={busy}
            />
          </label>
          <p className="mt-3 text-xs text-muted">
            {c(
              pending?.reply
                ? "This reply is visible to the buyer and farmer."
                : "This change is recorded in the activity log. Review notes may be shown to the affected account.",
              pending?.reply
                ? "ఈ సమాధానం కొనుగోలుదారుకు మరియు రైతుకు కనిపిస్తుంది."
                : "ఈ మార్పు చరిత్రలో నమోదు అవుతుంది. సమీక్ష సూచనలు సంబంధిత ఖాతాకు కనిపించవచ్చు.",
            )}
          </p>
          {actionError && (
            <p className="mk-error mt-4" role="alert">
              {actionError}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="mk-secondary"
              disabled={busy}
              onClick={() => setPending(null)}
            >
              {c("Cancel", "వద్దు")}
            </button>
            <button disabled={busy || !note.trim()} className="mk-btn">
              {c(
                busy ? "Saving…" : "Confirm action",
                busy ? "సేవ్ అవుతోంది…" : "చర్య నిర్ధారించు",
              )}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
function Activity({ item }: { item: Audit }) {
  return (
    <div className="admin-activity">
      <span className="admin-activity-dot" />
      <div className="min-w-0">
        <strong className="text-sm">
          {item.action.replaceAll(".", " / ")}
        </strong>
        <p className="mt-1 break-all text-xs text-muted">
          {item.actor || "System"} · {date(item.createdAt)} · {item.targetId}
        </p>
        {item.detail && (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm">
            {item.detail}
          </p>
        )}
      </div>
    </div>
  );
}
