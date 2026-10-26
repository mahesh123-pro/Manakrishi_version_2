"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Tractor,
  X,
  RefreshCw,
  Download,
  Phone,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { nextBookingStates } from "@/lib/admin/booking-rules";
import {
  activeBooking,
  bookingCalendar,
  bookingConflicts,
  bookingPhone,
  bookingsCsv,
  indiaDate,
  serviceDate,
  type AdminBooking as Booking,
} from "@/lib/admin/booking-tools";
import { useMarket, Empty, Skeleton } from "./MarketProvider";
type Queue = "all" | "today" | "past" | "unassigned";

function downloadFile(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
type Result = { items: Booking[]; cursor: string; hasMore: boolean };
const messages: Record<string, string> = {
  booking_backend_unconfigured:
    "Connect the booking backend to enable this workspace.",
  booking_backend_unavailable:
    "The booking backend could not be reached. Check its credentials and try again.",
  stale_booking:
    "Another administrator updated this booking. Close this dialog and refresh before trying again.",
  dispatch_required:
    "Add the operator name, Indian mobile number, date and time before assigning or progressing a job.",
  invalid_transition: "This status change is not allowed.",
  terminal_booking: "Completed and cancelled bookings cannot be changed.",
  invalid_contact: "Enter a valid Indian mobile number.",
  invalid_date: "Enter a valid date and time.",
  invalid_fields: "Check the required fields.",
  sign_in: "Please sign in again.",
  forbidden: "Administrator access is required.",
};
async function request(path: string, body?: unknown): Promise<Result> {
  const r = await fetch(`/api/admin/bookings${path}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const result = await r.json();
  if (!r.ok) throw new Error(result.error || "booking_backend_unavailable");
  return result;
}
export function ServiceBookings() {
  const { c } = useMarket();
  const [result, setResult] = useState<Result | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all");
  const [queue, setQueue] = useState<Queue>("all");
  const [service, setService] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("date_asc");
  const [refreshedAt, setRefreshedAt] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null),
    [target, setTarget] = useState(""),
    [formError, setFormError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    let alive = true;
    setBusy(true);
    request("")
      .then((data) => {
        if (alive) {
          setResult(data);
          setError("");
          setRefreshedAt(new Date().toISOString());
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [retry]);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  async function more() {
    if (!result) return;
    setBusy(true);
    try {
      const data = await request(
        `?cursor=${encodeURIComponent(result.cursor)}`,
      );
      setResult((prev) => ({
        ...data,
        items: [
          ...new Map(
            [...(prev?.items || []), ...data.items].map((b) => [b.id, b]),
          ).values(),
        ],
      }));
      setError("");
      setRefreshedAt(new Date().toISOString());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected || busy) return;
    setBusy(true);
    setFormError("");
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await request("", {
        ...fields,
        id: selected.id,
        expectedStatus: selected.status,
        status: target,
      });
      setSelected(null);
      setResult(null);
      setRetry((x) => x + 1);
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const loaded = result?.items || [];
  const today = indiaDate();
  const inQueue = (b: Booking, value: Queue) => {
    if (value === "all") return true;
    if (!activeBooking(b)) return false;
    if (value === "today") return serviceDate(b) === today;
    if (value === "past")
      return Boolean(serviceDate(b)) && serviceDate(b) < today;
    return !b.operatorName || !bookingPhone(b.operatorPhone);
  };
  const conflicts = bookingConflicts(loaded);
  const invalidRange = Boolean(from && to && from > to);
  const items = loaded
    .filter(
      (b) =>
        (filter === "all" || b.status === filter) &&
        inQueue(b, queue) &&
        (!service || (b.serviceType || "unspecified") === service) &&
        !invalidRange &&
        (!from || (Boolean(serviceDate(b)) && serviceDate(b) >= from)) &&
        (!to || (Boolean(serviceDate(b)) && serviceDate(b) <= to)) &&
        `${b.fullname} ${b.mobile} ${b.village} ${b.crop} ${b.id} ${b.operatorName} ${b.serviceType}`
          .toLowerCase()
          .includes(search.toLowerCase().trim()),
    )
    .sort((a, b) => {
      if (sort === "customer")
        return a.fullname.localeCompare(b.fullname) || a.id.localeCompare(b.id);
      const first = serviceDate(a),
        second = serviceDate(b);
      if (!first || !second)
        return first ? -1 : second ? 1 : a.id.localeCompare(b.id);
      const compare = `${first} ${a.scheduledTime}`.localeCompare(
        `${second} ${b.scheduledTime}`,
      );
      return (
        (sort === "date_desc" ? -compare : compare) || a.id.localeCompare(b.id)
      );
    });
  const services = [
    ...new Set(loaded.map((b) => b.serviceType || "unspecified")),
  ].sort();
  function clearFilters() {
    setSearch("");
    setFilter("all");
    setQueue("all");
    setService("");
    setFrom("");
    setTo("");
    setSort("date_asc");
  }
  return (
    <>
      <section className="admin-panel mb-5">
        <div className="flex items-start gap-3">
          <CalendarDays className="text-green shrink-0" size={22} />
          <div>
            <h2>{c("Service booking desk", "సేవా బుకింగ్ నిర్వహణ")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {c(
                "Review drone and tractor requests, assign operators, schedule visits and track work through completion. Times are in India Standard Time.",
                "డ్రోన్, ట్రాక్టర్ అభ్యర్థనలు సమీక్షించండి, ఆపరేటర్లను కేటాయించండి, సేవలను షెడ్యూల్ చేసి పూర్తి అయ్యే వరకు నిర్వహించండి. సమయాలు భారత ప్రామాణిక కాలంలో.",
              )}
            </p>
            <p className="mt-2 text-xs text-muted">
              {c(
                "Status changes update the primary booking record. They do not send messages, collect payments or issue refunds.",
                "స్థితి మార్పులు ప్రధాన బుకింగ్ రికార్డును మారుస్తాయి. సందేశాలు, చెల్లింపులు లేదా రీఫండ్‌లు ఆటోమేటిక్‌గా జరగవు.",
              )}
            </p>
          </div>
        </div>
      </section>
      {error && (
        <section className="admin-panel mb-5" role="alert">
          <h2>{messages[error] || messages.booking_backend_unavailable}</h2>
          {error === "booking_backend_unconfigured" && (
            <div className="mt-4 text-sm leading-7 text-muted">
              <p>
                {c(
                  "A Firebase project administrator must add FIREBASE_SERVICE_ACCOUNT_JSON and FIREBASE_BOOKINGS_PROJECT_ID to the server environment, then redeploy. Use the existing primary booking project and keep its credential private.",
                  "Firebase అడ్మిన్ FIREBASE_SERVICE_ACCOUNT_JSON మరియు FIREBASE_BOOKINGS_PROJECT_ID ను సర్వర్ సెట్టింగ్‌లలో జోడించి తిరిగి డిప్లాయ్ చేయాలి. ప్రస్తుత బుకింగ్ ప్రాజెక్ట్ వాడండి, కీని గోప్యంగా ఉంచండి.",
                )}
              </p>
              <p className="mt-2">
                {c(
                  "Your existing booking form continues to work while this connection is configured.",
                  "ఈ కనెక్షన్ ఏర్పాటు చేసే వరకు ప్రస్తుత బుకింగ్ ఫారం పనిచేస్తూనే ఉంటుంది.",
                )}
              </p>
            </div>
          )}
          <button
            className="mk-secondary mt-5"
            disabled={busy}
            onClick={() => setRetry((x) => x + 1)}
          >
            <RefreshCw size={15} />
            {c("Check connection again", "కనెక్షన్ మళ్లీ చూడండి")}
          </button>
        </section>
      )}
      {!result && busy ? (
        <Skeleton />
      ) : (
        result && (
          <>
            <div
              className="admin-stats mb-5"
              aria-label={c("Booking queues", "బుకింగ్ జాబితాలు")}
            >
              {(
                [
                  ["all", "All loaded", "లోడ్ చేసినవి"],
                  ["today", "Today · active", "ఈ రోజు · క్రియాశీలం"],
                  ["past", "Past service date", "సేవా తేదీ దాటినవి"],
                  ["unassigned", "Needs assignment", "కేటాయించవలసినవి"],
                ] as const
              ).map(([value, en, te]) => (
                <button
                  key={value}
                  type="button"
                  className={`admin-stat text-left ${queue === value ? "!border-green !bg-green/5" : ""}`}
                  aria-pressed={queue === value}
                  onClick={() => {
                    setQueue(value);
                    setFilter("all");
                  }}
                >
                  <span className="text-xs text-muted">{c(en, te)}</span>
                  <strong className="mt-2 block text-3xl text-green">
                    {loaded.filter((b) => inQueue(b, value)).length}
                  </strong>
                </button>
              ))}
            </div>
            <div className="admin-toolbar">
              <input
                className="mk-input !mt-0 flex-1"
                placeholder={c(
                  "Search loaded bookings…",
                  "లోడ్ చేసిన బుకింగ్‌లు శోధించండి…",
                )}
                aria-label={c("Search service bookings", "సేవా బుకింగ్ శోధన")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                aria-label={c("Booking status", "బుకింగ్ స్థితి")}
                className="mk-input !mt-0 !w-auto"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {[
                  "all",
                  "new",
                  "confirmed",
                  "assigned",
                  "in_progress",
                  "completed",
                  "cancelled",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <button
                className="mk-secondary"
                disabled={busy || !items.length}
                onClick={() =>
                  downloadFile(
                    bookingsCsv(items),
                    `manakrishi-bookings-${today}.csv`,
                    "text/csv;charset=utf-8",
                  )
                }
              >
                <Download size={15} />
                {c("Export filtered CSV", "ఫిల్టర్ చేసిన CSV")}
              </button>
              <button
                className="mk-secondary"
                disabled={busy}
                onClick={() => setRetry((x) => x + 1)}
              >
                <RefreshCw size={15} />
                {c("Refresh bookings", "రిఫ్రెష్")}
              </button>
            </div>
            <div className="admin-panel mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="mk-label">
                {c("Service type", "సేవా రకం")}
                <select
                  className="mk-input"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option value="">{c("All services", "అన్ని సేవలు")}</option>
                  {services.map((value) => (
                    <option key={value} value={value}>
                      {value === "unspecified"
                        ? c("Unspecified", "తెలియనిది")
                        : value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mk-label">
                {c("Service date from", "సేవా తేదీ నుండి")}
                <input
                  className="mk-input"
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label className="mk-label">
                {c("Service date until", "సేవా తేదీ వరకు")}
                <input
                  className="mk-input"
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
              <label className="mk-label">
                {c("Sort bookings", "బుకింగ్‌ల క్రమం")}
                <select
                  className="mk-input"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="date_asc">
                    {c(
                      "Service date · oldest first",
                      "సేవా తేదీ · పాతవి ముందు",
                    )}
                  </option>
                  <option value="date_desc">
                    {c(
                      "Service date · latest first",
                      "సేవా తేదీ · కొత్తవి ముందు",
                    )}
                  </option>
                  <option value="customer">
                    {c("Customer name", "కస్టమర్ పేరు")}
                  </option>
                </select>
              </label>
              <p className="text-xs leading-5 text-muted sm:col-span-2 xl:col-span-4">
                {c(
                  "Dates use the scheduled date, or the requested date when no schedule exists. Queues and exports cover loaded records only. CSV files contain customer contact details; share them only with authorized staff.",
                  "షెడ్యూల్ తేదీ లేదా అది లేకపోతే కోరిన తేదీని ఉపయోగిస్తాము. జాబితాలు, ఎగుమతులు లోడ్ చేసిన రికార్డులకు మాత్రమే. CSVలో కస్టమర్ సంప్రదింపు వివరాలు ఉంటాయి; అధికారం ఉన్న సిబ్బందితో మాత్రమే పంచుకోండి.",
                )}
              </p>
            </div>
            {invalidRange && (
              <p role="alert" className="mk-error mb-4">
                {c(
                  "Choose an end date on or after the start date.",
                  "ముగింపు తేదీ ప్రారంభ తేదీ తర్వాత ఉండాలి.",
                )}
              </p>
            )}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="mb-4 text-xs text-muted">
                {items.length} / {result.items.length}{" "}
                {c(
                  "loaded bookings shown. Load more to search additional records.",
                  "లోడ్ చేసిన బుకింగ్‌లు చూపుతున్నాము. మరిన్ని వివరాల కోసం మరిన్ని లోడ్ చేయండి.",
                )}
                {refreshedAt && (
                  <span className="mt-1 block">
                    {c("Last loaded", "చివరిసారి లోడ్ చేసినది")}:{" "}
                    {new Date(refreshedAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "short",
                      timeStyle: "short",
                    })}{" "}
                    IST
                  </span>
                )}
              </p>
              <button className="mk-secondary" onClick={clearFilters}>
                {c("Clear all filters", "అన్ని ఫిల్టర్లు తొలగించండి")}
              </button>
            </div>
            {!items.length && (
              <Empty
                title={c("No matching bookings", "సరిపోయే బుకింగ్‌లు లేవు")}
                body={c(
                  "New service requests will appear here. Try another filter or load more records.",
                  "కొత్త సేవా అభ్యర్థనలు ఇక్కడ కనిపిస్తాయి. ఫిల్టర్ మార్చండి లేదా మరిన్ని వివరాలు లోడ్ చేయండి.",
                )}
              />
            )}
            <div className="space-y-4">
              {items.map((b) => (
                <article className="admin-panel" key={b.id}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2">
                        <Tractor size={18} />
                        {b.fullname}
                      </h2>
                      <p className="mt-2 break-all text-xs text-muted">
                        {b.id} ·{" "}
                        {b.serviceType || c("Service request", "సేవా అభ్యర్థన")}
                      </p>
                    </div>
                    <span className="admin-badge">
                      {b.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="my-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p>
                        {b.mobile} · {b.village}
                      </p>
                      <p className="mt-2 text-muted">
                        {b.crop} · {b.acres} {c("acres", "ఎకరాలు")}
                      </p>
                      <p className="mt-2 text-muted">{b.chemicalOrImplement}</p>
                    </div>
                    <div>
                      <p>
                        {c("Requested", "కోరినది")}: {b.date} ·{" "}
                        {b.preferredTime}
                      </p>
                      <p className="mt-2 text-muted">
                        {c("Operator", "ఆపరేటర్")}: {b.operatorName || "—"}{" "}
                        {b.operatorPhone}
                      </p>
                      <p className="mt-2 text-muted">
                        {c("Scheduled", "షెడ్యూల్")}: {b.scheduledDate || "—"}{" "}
                        {b.scheduledTime}
                      </p>
                    </div>
                  </div>
                  {b.notes && <p className="text-sm text-muted">{b.notes}</p>}
                  {b.reviewNote && (
                    <p className="mt-3 rounded-xl bg-green/5 p-3 text-sm">
                      {b.reviewNote}
                    </p>
                  )}
                  {conflicts.has(b.id) && (
                    <p className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                      {c(
                        "Another loaded active booking has this operator and start time. Review both schedules; job durations are not checked.",
                        "ఈ ఆపరేటర్, ప్రారంభ సమయంతో మరో క్రియాశీల బుకింగ్ ఉంది. రెండు షెడ్యూల్‌లను పరిశీలించండి; పని వ్యవధిని తనిఖీ చేయడం లేదు.",
                      )}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {nextBookingStates(b.status).length > 0 && (
                      <button
                        className="mk-btn"
                        disabled={busy}
                        onClick={() => {
                          setSelected(b);
                          setTarget(b.status);
                          setFormError("");
                        }}
                      >
                        {c("Manage booking", "బుకింగ్ నిర్వహించు")}
                      </button>
                    )}
                    {bookingPhone(b.mobile) && (
                      <>
                        <a
                          className="mk-secondary"
                          href={`tel:+${bookingPhone(b.mobile)}`}
                          aria-label={c(
                            `Call customer ${b.fullname}`,
                            `కస్టమర్ ${b.fullname}కు కాల్ చేయండి`,
                          )}
                        >
                          <Phone size={14} />
                          {c("Call customer", "కస్టమర్‌కు కాల్")}
                        </a>
                        <a
                          className="mk-secondary"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://wa.me/${bookingPhone(b.mobile)}?text=${encodeURIComponent(`Hello ${b.fullname}, this is Manakrishi regarding your ${b.serviceType || "farm service"} booking (${b.id}) at ${b.village}.${b.scheduledDate ? ` Scheduled: ${b.scheduledDate} ${b.scheduledTime} IST.` : ""} Please confirm your availability.`)}`}
                        >
                          <MessageCircle size={14} />
                          {c(
                            "Prepare WhatsApp",
                            "వాట్సాప్ సందేశం సిద్ధం చేయండి",
                          )}
                        </a>
                      </>
                    )}
                    {bookingPhone(b.operatorPhone) && (
                      <a
                        className="mk-secondary"
                        href={`tel:+${bookingPhone(b.operatorPhone)}`}
                      >
                        <Phone size={14} />
                        {c("Call operator", "ఆపరేటర్‌కు కాల్")}
                      </a>
                    )}
                    {bookingCalendar(b) && (
                      <button
                        className="mk-secondary"
                        onClick={() => {
                          const calendar = bookingCalendar(b);
                          if (calendar)
                            downloadFile(
                              calendar,
                              `manakrishi-${b.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60)}.ics`,
                              "text/calendar;charset=utf-8",
                            );
                        }}
                      >
                        <CalendarDays size={14} />
                        {c("Download calendar", "క్యాలెండర్ డౌన్‌లోడ్")}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {result.hasMore && (
              <button
                className="mk-secondary mx-auto mt-6 flex"
                disabled={busy}
                onClick={more}
              >
                {c(
                  busy ? "Loading…" : "Load more bookings",
                  busy ? "లోడ్ అవుతోంది…" : "మరిన్ని బుకింగ్‌లు",
                )}
              </button>
            )}
          </>
        )
      )}
      <dialog
        ref={dialog}
        className="admin-dialog"
        aria-label={c("Manage service booking", "సేవా బుకింగ్ నిర్వహణ")}
        onCancel={(e) => {
          if (busy) e.preventDefault();
          else setSelected(null);
        }}
      >
        <form onSubmit={save} key={selected?.id}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-2xl">
              {c("Manage booking", "బుకింగ్ నిర్వహించు")}
            </h2>
            <button
              type="button"
              className="mk-icon"
              aria-label={c("Close booking", "మూసివేయి")}
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              <X size={18} />
            </button>
          </div>
          <p className="my-4 text-sm text-muted">
            {selected?.fullname} · {selected?.mobile}
          </p>
          <fieldset className="space-y-4" disabled={busy}>
            <label className="mk-label">
              {c("Status", "స్థితి")}
              <select
                className="mk-input"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                {selected &&
                  [selected.status, ...nextBookingStates(selected.status)].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s.replaceAll("_", " ")}
                      </option>
                    ),
                  )}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["operatorName", "Operator name", "ఆపరేటర్ పేరు"],
                ["operatorPhone", "Operator mobile", "ఆపరేటర్ మొబైల్"],
                ["scheduledDate", "Service date", "సేవా తేదీ"],
                ["scheduledTime", "Service time (IST)", "సేవా సమయం"],
              ].map(([key, en, te]) => (
                <label className="mk-label" key={key}>
                  {c(en, te)}
                  <input
                    className="mk-input"
                    name={key}
                    type={
                      key === "scheduledDate"
                        ? "date"
                        : key === "scheduledTime"
                          ? "time"
                          : key === "operatorPhone"
                            ? "tel"
                            : "text"
                    }
                    required={["assigned", "in_progress", "completed"].includes(
                      target,
                    )}
                    maxLength={
                      key === "operatorName"
                        ? 100
                        : key === "operatorPhone"
                          ? 10
                          : undefined
                    }
                    defaultValue={selected?.[key as keyof Booking] || ""}
                  />
                </label>
              ))}
            </div>
            <label className="mk-label">
              {c("Reason / dispatch note", "కారణం / నిర్వహణ సూచన")}
              <textarea
                name="reason"
                className="mk-input"
                required
                maxLength={500}
                rows={3}
              />
            </label>
            <p className="text-xs text-muted">
              {c(
                "Changes are recorded in the booking audit history. Cancellations do not automatically refund booking advances.",
                "మార్పులు బుకింగ్ చరిత్రలో నమోదు అవుతాయి. రద్దు చేసినప్పుడు అడ్వాన్స్ ఆటోమేటిక్‌గా తిరిగి చెల్లించబడదు.",
              )}
            </p>
            {formError && (
              <p className="mk-error" role="alert">
                {messages[formError] || messages.booking_backend_unavailable}
              </p>
            )}
            <button className="mk-btn w-full">
              {c(
                busy ? "Saving…" : "Save booking",
                busy ? "సేవ్ అవుతోంది…" : "బుకింగ్ సేవ్ చేయి",
              )}
            </button>
          </fieldset>
        </form>
      </dialog>
    </>
  );
}
