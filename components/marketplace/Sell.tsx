"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Upload, X, Eye, Navigation } from "lucide-react";
import {
  CATEGORIES,
  money,
  type Listing,
  type ListingInput,
} from "@/lib/marketplace/types";
import { AuthGate, useMarket, PageHeading, Skeleton } from "./MarketProvider";

const BLANK: ListingInput = {
  crop: "",
  category: "rice",
  variety: "",
  description: "",
  images: [],
  price: 0,
  unit: "kg",
  quantity: 0,
  minimum: 1,
  maximum: 0,
  grade: "",
  organic: false,
  organicEvidence: "",
  negotiable: false,
  village: "",
  district: "",
  state: "Telangana",
  pin: "",
  harvest: "",
  availableFrom: "",
  fulfillment: "pickup",
  pickup: "",
  contact: "",
  notes: "",
  latitude: null,
  longitude: null,
};
export function Sell() {
  return (
    <div className="mk-container">
      <AuthGate farmer>
        <SellForm />
      </AuthGate>
    </div>
  );
}
function SellForm() {
  const { c, api, notice, user } = useMarket();
  const id = useSearchParams().get("edit");
  const [form, setForm] = useState<
      ListingInput & { id?: string; version?: number }
    >(BLANK),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [preview, setPreview] = useState(false),
    [error, setError] = useState(""),
    [loaded, setLoaded] = useState(!id),
    [success, setSuccess] = useState("");
  const previewDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (preview) previewDialog.current?.showModal();
    else previewDialog.current?.close();
  }, [preview]);
  const key = `mk-draft-${user!.id}`;
  useEffect(() => {
    let live = true;
    if (id) {
      api<{ listing: Listing }>(`product/${id}`)
        .then((d) => {
          if (live) {
            setForm(d.listing);
            setLoaded(true);
          }
        })
        .catch((e) => setError(e.message));
    } else {
      try {
        const saved = localStorage.getItem(key);
        if (saved) setForm({ ...BLANK, ...JSON.parse(saved) });
      } catch {}
      setLoaded(true);
    }
    return () => {
      live = false;
    };
  }, [id, api, key]);
  useEffect(() => {
    if (loaded && !id && !form.id) {
      try {
        localStorage.setItem(key, JSON.stringify(form));
      } catch {}
    }
  }, [form, loaded, id, key]);
  function set<K extends keyof ListingInput>(k: K, v: ListingInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
    setSuccess("");
  }
  async function upload(files: FileList | null) {
    if (!files) return;
    if (form.images.length + files.length > 5) {
      setError(c("Use at most 5 photos.", "గరిష్టంగా 5 చిత్రాలు."));
      return;
    }
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const data = new FormData();
        data.set("file", file);
        const r = await api<{ url: string }>("upload", data);
        setForm((f) => ({ ...f, images: [...f.images, r.url] }));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function save(action: string) {
    if (busy || uploading) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ id: string; status: string }>("listings", {
        ...form,
        action,
      });
      setSuccess(
        c(
          action === "publish"
            ? "Your harvest was sent for admin review. It will appear in the market after approval."
            : "Draft saved to your account.",
          action === "publish"
            ? "మీ పంట అడ్మిన్ సమీక్షకు పంపబడింది. ఆమోదం తర్వాత మార్కెట్‌లో కనిపిస్తుంది."
            : "డ్రాఫ్ట్ మీ ఖాతాలో సేవ్ చేయబడింది.",
        ),
      );
      localStorage.removeItem(key);
      const d = await api<{ listing: Listing }>(`product/${result.id}`);
      setForm(d.listing);
      notice(c("Listing saved", "లిస్టింగ్ సేవ్ చేయబడింది"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const fields: [keyof ListingInput, string, string, string, boolean][] = [
    ["crop", "Crop name", "పంట పేరు", "text", true],
    ["variety", "Crop variety", "పంట రకం", "text", false],
    [
      "grade",
      "Quality grade (optional)",
      "నాణ్యత గ్రేడ్ (ఐచ్ఛికం)",
      "text",
      false,
    ],
    [
      "price",
      "Price per selected unit (₹)",
      "యూనిట్‌కు ధర (₹)",
      "number",
      true,
    ],
    [
      "quantity",
      "Available quantity (not reserved stock)",
      "అందుబాటులో స్టాక్ (రిజర్వ్ కానిది)",
      "number",
      true,
    ],
    [
      "minimum",
      "Minimum order quantity",
      "కనీస ఆర్డర్ పరిమాణం",
      "number",
      true,
    ],
    [
      "maximum",
      "Maximum order quantity (0 = no limit)",
      "గరిష్ట ఆర్డర్ (0 = పరిమితి లేదు)",
      "number",
      false,
    ],
    ["village", "Village", "గ్రామం", "text", true],
    ["district", "District", "జిల్లా", "text", true],
    ["state", "State", "రాష్ట్రం", "text", true],
    ["pin", "PIN code", "పిన్ కోడ్", "text", true],
    ["harvest", "Harvest date", "కోత తేదీ", "date", false],
    ["availableFrom", "Available from", "అందుబాటులో తేదీ", "date", false],
    ["contact", "Private mobile number", "ప్రైవేట్ మొబైల్ నంబర్", "tel", true],
    [
      "pickup",
      "Private pickup address",
      "ప్రైవేట్ పికప్ చిరునామా",
      "text",
      true,
    ],
  ];
  if (!loaded)
    return error ? (
      <p role="alert" className="mk-error">
        {error}
      </p>
    ) : (
      <Skeleton />
    );
  return (
    <>
      <PageHeading
        eyebrow={c("Farmer workspace", "రైతు కార్యస్థలం")}
        title={c(
          id ? "Update your harvest" : "Your harvest. A wider market.",
          id ? "మీ పంట నవీకరించండి" : "మీ పంట. విస్తృత మార్కెట్.",
        )}
        body={c(
          "Add honest details and your own crop photos. You control your price, quantities and fulfillment.",
          "నిజమైన వివరాలు, మీ పంట చిత్రాలు జోడించండి. ధర, పరిమాణం, డెలివరీ మీ నియంత్రణలో.",
        )}
      />
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form
          className="mk-panel"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            setPreview(true);
          }}
        >
          <fieldset disabled={busy || uploading} className="min-w-0 space-y-7">
            <div>
              <h2 className="font-heading text-xl font-semibold">
                {c("Let buyers see your harvest", "మీ పంటను చూపించండి")}
              </h2>
              <p className="mt-2 text-xs leading-6 text-muted">
                {c(
                  "1–5 JPEG, PNG or WebP photos, up to 5 MB each. Uploads are resized and metadata is removed.",
                  "1–5 JPEG, PNG లేదా WebP చిత్రాలు, ఒక్కొక్కటి 5 MB వరకు. చిత్రాలు చిన్నవి చేయబడి మెటాడేటా తొలగించబడుతుంది.",
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {form.images.map((url, i) => (
                  <div
                    key={url}
                    className="relative h-24 w-28 overflow-hidden rounded-xl"
                  >
                    <Image
                      src={url}
                      alt={`${form.crop} ${i + 1}`}
                      fill
                      unoptimized
                      sizes="112px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-white p-1"
                      aria-label={c("Remove image", "చిత్రం తొలగించు")}
                      onClick={() =>
                        set(
                          "images",
                          form.images.filter((x) => x !== url),
                        )
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-green/30 px-6 text-xs text-green">
                  <Upload size={20} />
                  {uploading
                    ? c("Uploading…", "అప్‌లోడ్ అవుతోంది…")
                    : c("Add crop photos", "పంట చిత్రాలు జోడించు")}
                  <input
                    aria-label={c(
                      "Upload crop photos",
                      "పంట చిత్రాలు అప్‌లోడ్",
                    )}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      upload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="mk-label">
                {c("Crop category", "పంట వర్గం")} *
                <select
                  className="mk-input"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat[0]} value={cat[0]}>
                      {c(cat[1], cat[2])}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mk-label">
                {c("Selling unit", "అమ్మకం యూనిట్")} *
                <select
                  className="mk-input"
                  value={form.unit}
                  onChange={(e) =>
                    set("unit", e.target.value as ListingInput["unit"])
                  }
                >
                  <option value="kg">
                    {c("Kilogram (kg)", "కిలోగ్రాము (kg)")}
                  </option>
                  <option value="quintal">
                    {c("Quintal (100 kg)", "క్వింటాల్ (100 కిలోలు)")}
                  </option>
                  <option value="tonne">
                    {c("Tonne (1,000 kg)", "టన్ను (1,000 కిలోలు)")}
                  </option>
                </select>
              </label>
              {fields.map(([key, en, te, type, required]) => (
                <label key={key} className="mk-label">
                  {c(en, te)} {required && "*"}
                  <input
                    className="mk-input"
                    value={String(form[key] ?? "")}
                    onChange={(e) =>
                      set(
                        key,
                        type === "number"
                          ? Number(e.target.value)
                          : (e.target.value as never),
                      )
                    }
                    type={type}
                    required={required}
                    min={
                      type === "number"
                        ? key === "price"
                          ? 0.01
                          : key === "minimum"
                            ? 0.001
                            : 0
                        : undefined
                    }
                    max={type === "number" ? 1000000 : undefined}
                    step={
                      type === "number"
                        ? key === "price"
                          ? "0.01"
                          : "0.001"
                        : undefined
                    }
                    maxLength={
                      key === "contact"
                        ? 10
                        : key === "pin"
                          ? 6
                          : key === "pickup"
                            ? 500
                            : 100
                    }
                  />
                </label>
              ))}
            </div>
            <label className="mk-label">
              {c("Describe your crop", "మీ పంట గురించి")} *
              <textarea
                className="mk-input"
                required
                rows={4}
                maxLength={3000}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.negotiable}
                  onChange={(e) => set("negotiable", e.target.checked)}
                />
                {c("Open to price enquiries", "ధర చర్చించవచ్చు")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.organic}
                  onChange={(e) => set("organic", e.target.checked)}
                />
                {c(
                  "Organically grown (seller declaration)",
                  "సేంద్రియ సాగు (విక్రేత ప్రకటన)",
                )}
              </label>
            </div>
            {form.organic && (
              <label className="mk-label">
                {c(
                  "Certification / growing practices",
                  "ధృవీకరణ / సాగు పద్ధతులు",
                )}{" "}
                *
                <textarea
                  className="mk-input"
                  required
                  maxLength={500}
                  value={form.organicEvidence}
                  onChange={(e) => set("organicEvidence", e.target.value)}
                />
              </label>
            )}
            <label className="mk-label">
              {c("Fulfillment you can arrange", "మీరు ఏర్పాటు చేసే డెలివరీ")}
              <select
                className="mk-input"
                value={form.fulfillment}
                onChange={(e) =>
                  set(
                    "fulfillment",
                    e.target.value as ListingInput["fulfillment"],
                  )
                }
              >
                <option value="pickup">
                  {c("Buyer pickup only", "కొనుగోలుదారు పికప్ మాత్రమే")}
                </option>
                <option value="delivery">
                  {c(
                    "Seller-arranged delivery",
                    "విక్రేత ఏర్పాటు చేసే డెలివరీ",
                  )}
                </option>
                <option value="both">
                  {c(
                    "Pickup or seller-arranged delivery",
                    "పికప్ లేదా విక్రేత డెలివరీ",
                  )}
                </option>
              </select>
            </label>
            <label className="mk-label">
              {c(
                "Buyer notes and delivery terms",
                "కొనుగోలుదారుకు సూచనలు, డెలివరీ నిబంధనలు",
              )}
              <textarea
                className="mk-input"
                rows={3}
                maxLength={1000}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </label>
            <button
              type="button"
              className="mk-secondary"
              onClick={() =>
                navigator.geolocation?.getCurrentPosition(
                  (p) => {
                    set("latitude", p.coords.latitude);
                    set("longitude", p.coords.longitude);
                    notice(
                      c(
                        "Private farm location saved. It is not displayed publicly.",
                        "ప్రైవేట్ పొలం ప్రాంతం సేవ్ చేయబడింది. పబ్లిక్‌గా చూపబడదు.",
                      ),
                    );
                  },
                  () =>
                    notice(
                      c(
                        "Location unavailable. Enter your village instead.",
                        "ప్రాంతం అందుబాటులో లేదు. గ్రామం నమోదు చేయండి.",
                      ),
                    ),
                  { timeout: 10000 },
                )
              }
            >
              <Navigation size={16} />
              {c(
                "Use my farm location (optional)",
                "నా పొలం ప్రాంతం వాడండి (ఐచ్ఛికం)",
              )}
            </button>
            <p className="text-[11px] leading-6 text-muted">
              {c(
                "Your private phone, exact pickup address and GPS coordinates are hidden from public listings. Sellers see buyer delivery details only for their own orders.",
                "మీ ప్రైవేట్ ఫోన్, పికప్ చిరునామా, GPS పబ్లిక్ లిస్టింగ్‌లలో కనిపించవు. విక్రేతలు తమ ఆర్డర్ల కొనుగోలుదారు వివరాలు మాత్రమే చూడగలరు.",
              )}
            </p>
            {error && (
              <p role="alert" className="mk-error">
                {error}
              </p>
            )}
            {success && (
              <div role="status" className="mk-success">
                {success}
                <Link
                  className="mt-2 block underline"
                  href="/marketplace/my-listings"
                >
                  {c("Manage my listings", "నా లిస్టింగ్‌లు నిర్వహించు")}
                </Link>
              </div>
            )}
            <div className="flex flex-wrap gap-3 border-t border-green/10 pt-6">
              <button
                type="button"
                onClick={() => save("draft")}
                className="mk-secondary"
              >
                {busy
                  ? c("Saving…", "సేవ్ అవుతోంది…")
                  : c("Save draft", "డ్రాఫ్ట్ సేవ్ చేయి")}
              </button>
              <button type="submit" className="mk-btn">
                <Eye size={16} />
                {c("Preview harvest", "పంట ప్రివ్యూ")}
              </button>
            </div>
          </fieldset>
        </form>
        <aside className="mk-panel lg:sticky lg:top-28">
          <p className="mk-eyebrow">
            {c("A useful listing", "ఉపయోగకరమైన లిస్టింగ్")}
          </p>
          <h3 className="mt-3 font-heading text-xl">
            {c("Make the details count.", "వివరాలను స్పష్టంగా ఇవ్వండి.")}
          </h3>
          <ul className="mt-5 space-y-4 text-xs leading-6 text-muted">
            <li>
              {c(
                "Use recent photos of the produce you are selling.",
                "మీరు అమ్మే పంట తాజా చిత్రాలు వాడండి.",
              )}
            </li>
            <li>
              {c(
                "Match the price and quantities to the same unit.",
                "ధర, పరిమాణాలకు ఒకే యూనిట్ వాడండి.",
              )}
            </li>
            <li>
              {c(
                "Only list stock you can fulfill. Pending orders reserve stock for 24 hours.",
                "అందించగల స్టాక్ మాత్రమే జోడించండి. పెండింగ్ ఆర్డర్లు 24 గంటలు స్టాక్ రిజర్వ్ చేస్తాయి.",
              )}
            </li>
            <li>
              {c(
                "Publishing submits your listing for review. Changes to published listings need another review.",
                "ప్రచురణ సమీక్షకు పంపుతుంది. ప్రచురించిన లిస్టింగ్ మార్పులకు మళ్లీ సమీక్ష అవసరం.",
              )}
            </li>
          </ul>
        </aside>
      </div>
      <dialog
        ref={previewDialog}
        onCancel={() => setPreview(false)}
        className="mk-preview-dialog"
        aria-label={c("Listing preview", "లిస్టింగ్ ప్రివ్యూ")}
      >
        <div className="mk-modal-card">
          <button
            className="mk-secondary mb-5"
            onClick={() => setPreview(false)}
          >
            {c("Back to editing", "తిరిగి సవరించు")}
          </button>
          <p className="mk-eyebrow">
            {c("Preview · not published", "ప్రివ్యూ · ఇంకా ప్రచురించలేదు")}
          </p>
          <h2 className="mt-3 font-heading text-3xl">
            {form.crop} {form.variety}
          </h2>
          <p className="mt-3 text-xl text-green">
            {money(Math.round(form.price * 100))} / {form.unit}
          </p>
          <p className="mt-3 text-sm">
            {form.quantity} {form.unit} · {form.village}, {form.district},{" "}
            {form.state}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">
            {form.description}
          </p>
          <div className="my-5 flex flex-wrap gap-2">
            {form.images.map((url) => (
              <Image
                key={url}
                src={url}
                alt={form.crop}
                width={150}
                height={100}
                unoptimized
                className="rounded-xl object-cover"
              />
            ))}
          </div>
          {error && (
            <p role="alert" className="mk-error">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            onClick={async () => {
              await save("publish");
              setPreview(false);
            }}
            className="mk-btn w-full"
          >
            {busy
              ? c("Submitting…", "పంపుతోంది…")
              : c("Submit for publication", "ప్రచురణ కోసం పంపు")}
          </button>
        </div>
      </dialog>
    </>
  );
}
