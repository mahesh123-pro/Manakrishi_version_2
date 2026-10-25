"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarDays, Tractor, X, RefreshCw } from "lucide-react";
import { nextBookingStates } from "@/lib/admin/booking-rules";
import { useMarket, Empty, Skeleton } from "./MarketProvider";
type Booking = {
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
        items: [...(prev?.items || []), ...data.items],
      }));
      setError("");
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
  const items = (result?.items || [])
    .filter(
      (b) =>
        (filter === "all" || b.status === filter) &&
        `${b.fullname} ${b.mobile} ${b.village} ${b.crop} ${b.id} ${b.operatorName}`
          .toLowerCase()
          .includes(search.toLowerCase().trim()),
    )
    .sort((a, b) =>
      (a.scheduledDate || a.date).localeCompare(b.scheduledDate || b.date),
    );
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
                disabled={busy}
                onClick={() => setRetry((x) => x + 1)}
              >
                <RefreshCw size={15} />
                {c("Refresh bookings", "రిఫ్రెష్")}
              </button>
            </div>
            <p className="mb-4 text-xs text-muted">
              {result.items.length}{" "}
              {c(
                "loaded bookings. Load more to include additional records in search.",
                "లోడ్ చేసిన బుకింగ్‌లు. మరిన్ని వివరాల కోసం మరిన్ని లోడ్ చేయండి.",
              )}
            </p>
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
                  {nextBookingStates(b.status).length > 0 && (
                    <button
                      className="mk-btn mt-4"
                      onClick={() => {
                        setSelected(b);
                        setTarget(b.status);
                        setFormError("");
                      }}
                    >
                      {c("Manage booking", "బుకింగ్ నిర్వహించు")}
                    </button>
                  )}
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
