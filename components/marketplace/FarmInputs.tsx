"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Droplets,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Sprout,
  X,
} from "lucide-react";
import { SITE } from "@/lib/content";
import { useMarket } from "./MarketProvider";

const INPUTS = [
  {
    id: "mulch",
    title: "Mulch sheets",
    titleTe: "మల్చింగ్ షీట్లు",
    image: "/assets/marketplace-inputs-mulch.webp",
    alt: "Vegetable rows growing through reflective mulch sheets",
    summary:
      "Choose sheet dimensions and material to suit your crop, bed layout and season.",
    summaryTe:
      "మీ పంట, బెడ్ అమరిక, కాలానికి సరిపోయే షీట్ పరిమాణం మరియు పదార్థాన్ని ఎంచుకోండి.",
    details: [
      ["Match roll width to your prepared beds and crop spacing.", "మీ బెడ్ వెడల్పు, పంట దూరానికి సరిపోయే రోల్ వెడల్పు ఎంచుకోండి."],
      ["Ask about thickness, colour, roll length and material options.", "మందం, రంగు, రోల్ పొడవు, పదార్థ ఎంపికల గురించి అడగండి."],
      ["Plan drip-line placement and responsible collection after use.", "డ్రిప్ లైన్ అమరిక, వాడిన తర్వాత సురక్షిత సేకరణను ముందే ప్లాన్ చేయండి."],
    ],
    note: "Availability and current price depend on size, material and delivery location.",
    noteTe: "పరిమాణం, పదార్థం, డెలివరీ ప్రాంతాన్ని బట్టి స్టాక్, ప్రస్తుత ధర మారవచ్చు.",
    icon: Leaf,
  },
  {
    id: "seeds",
    title: "Seeds & saplings",
    titleTe: "విత్తనాలు & మొక్కలు",
    image: "/assets/marketplace-inputs-seedlings.webp",
    alt: "Healthy vegetable seedlings growing in nursery trays",
    summary:
      "Find planting material for your crop plan, sowing window and local conditions.",
    summaryTe:
      "మీ పంట ప్రణాళిక, విత్తే సమయం, స్థానిక పరిస్థితులకు సరిపోయే నాటే పదార్థాన్ని కనుగొనండి.",
    details: [
      ["Share crop, preferred variety and expected sowing date.", "పంట, కావలసిన రకం, విత్తే అంచనా తేదీ చెప్పండి."],
      ["Confirm the seed label, lot details and germination information.", "విత్తన లేబుల్, లాట్ వివరాలు, మొలకెత్తే సమాచారాన్ని నిర్ధారించండి."],
      ["For saplings, ask about age, root condition and safe transport.", "మొక్కల వయస్సు, వేర్ల స్థితి, సురక్షిత రవాణా గురించి అడగండి."],
    ],
    note: "Varieties and planting dates should be checked for your district and season.",
    noteTe: "మీ జిల్లా, కాలానికి సరిపోయే రకం, నాటే తేదీని నిర్ధారించుకోండి.",
    icon: Sprout,
  },
  {
    id: "protection",
    title: "Plant protection",
    titleTe: "పంట రక్షణ",
    image: "/assets/marketplace-inputs-protection.webp",
    alt: "A farmer checking vegetable leaves for early signs of pests",
    summary:
      "Describe what you see and get help finding suitable crop-care options.",
    summaryTe:
      "పంటలో కనిపిస్తున్న సమస్యను వివరించి, తగిన పంట సంరక్షణ ఎంపికల గురించి తెలుసుకోండి.",
    details: [
      ["Share crop, growth stage, symptoms and the affected area.", "పంట, ఎదుగుదల దశ, లక్షణాలు, ప్రభావిత విస్తీర్ణం చెప్పండి."],
      ["Ask first about field hygiene, monitoring and integrated pest management.", "పొలం శుభ్రత, పరిశీలన, సమగ్ర సస్యరక్షణ గురించి ముందుగా అడగండి."],
      ["Use any plant-protection product only as its label and local adviser direct.", "పంట రక్షణ ఉత్పత్తిని లేబుల్, స్థానిక నిపుణుల సూచనల ప్రకారమే వాడండి."],
    ],
    note: "Product choice and application guidance must be confirmed for the crop and pest.",
    noteTe: "ఉత్పత్తి, వినియోగ విధానం పంట మరియు పురుగుకు సరిపోతాయో నిర్ధారించండి.",
    icon: ShieldCheck,
  },
  {
    id: "irrigation",
    title: "Drip & crop nutrition",
    titleTe: "డ్రిప్ & పంట పోషణ",
    image: "/assets/marketplace-inputs-irrigation.webp",
    alt: "Drip irrigation lines watering a vegetable crop",
    summary:
      "Plan water delivery and crop nutrition around the field and crop stage.",
    summaryTe:
      "పొలం, పంట దశకు అనుగుణంగా నీటి సరఫరా, పంట పోషణను ప్లాన్ చేయండి.",
    details: [
      ["Share plot size, water source and existing pump or filter setup.", "పొలం విస్తీర్ణం, నీటి వనరు, ఉన్న పంపు లేదా ఫిల్టర్ వివరాలు చెప్పండి."],
      ["Ask about line length, dripper spacing and filtration before ordering.", "ఆర్డర్‌కు ముందు లైన్ పొడవు, డ్రిప్పర్ దూరం, ఫిల్ట్రేషన్ గురించి అడగండి."],
      ["Use soil or water test results when planning nutrient inputs.", "పోషకాలను ప్లాన్ చేసేప్పుడు నేల లేదా నీటి పరీక్ష ఫలితాలను ఉపయోగించండి."],
    ],
    note: "The team can confirm compatible sizes and current availability for your area.",
    noteTe: "మీ ప్రాంతానికి సరిపోయే పరిమాణాలు, ప్రస్తుత లభ్యతను బృందం నిర్ధారిస్తుంది.",
    icon: Droplets,
  },
] as const;

type InputProduct = (typeof INPUTS)[number];
type Request = {
  name: string;
  phone: string;
  crop: string;
  quantity: string;
  location: string;
  details: string;
};
const emptyRequest: Request = {
  name: "",
  phone: "",
  crop: "",
  quantity: "",
  location: "",
  details: "",
};

export function FarmInputs() {
  const { c } = useMarket();
  const [selected, setSelected] = useState<InputProduct | null>(null);
  const [fields, setFields] = useState<Request>(emptyRequest);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);

  const close = () => {
    dialog.current?.close();
    setSelected(null);
    setWhatsAppUrl("");
  };

  const requestQuote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const productName = c(selected.title, selected.titleTe);
    const message = [
      "Hello Manakrishi, I would like to check farm-input availability and a current quote.",
      `Category: ${productName}`,
      `Name: ${fields.name.trim()}`,
      `Phone: ${fields.phone}`,
      `Crop / variety: ${fields.crop.trim()}`,
      `Area or quantity: ${fields.quantity.trim()}`,
      `Village / district: ${fields.location.trim()}`,
      fields.details.trim() ? `Notes: ${fields.details.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const url = `${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
    setWhatsAppUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openRequest = (input: InputProduct) => {
    setSelected(input);
    setFields(emptyRequest);
    setWhatsAppUrl("");
  };

  return (
    <>
      <section
        className="mx-auto max-w-7xl px-5 pb-12"
        aria-labelledby="farm-inputs-heading"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mk-eyebrow">
              {c("Plan your next crop", "తదుపరి పంటకు సిద్ధం అవ్వండి")}
            </p>
            <h2
              id="farm-inputs-heading"
              className="mt-2 font-heading text-3xl font-semibold"
            >
              {c("Farm inputs & growing essentials", "వ్యవసాయ ఇన్‌పుట్లు & అవసరాలు")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              {c(
                "Browse mulch sheets, seeds and saplings, plant protection, and drip supplies. Tell us what you grow to check suitable options, local availability and today's quote.",
                "మల్చింగ్ షీట్లు, విత్తనాలు మరియు మొక్కలు, పంట రక్షణ, డ్రిప్ సామగ్రిని చూడండి. సరైన ఎంపికలు, స్థానిక లభ్యత, నేటి ధర తెలుసుకోవడానికి మీ పంట వివరాలు పంపండి.",
              )}
            </p>
          </div>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mk-secondary"
          >
            <MessageCircle size={16} />
            {c("Ask our team", "మా బృందాన్ని అడగండి")}
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {INPUTS.map((input) => {
            const Icon = input.icon;
            return (
              <article
                key={input.id}
                className="mk-input-product group overflow-hidden rounded-3xl border border-green/10 bg-white shadow-sm transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-green/5">
                  <Image
                    src={input.image}
                    alt={c(input.alt, input.alt)}
                    fill
                    sizes="(max-width:640px) 92vw, (max-width:1280px) 46vw, 24vw"
                    className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-green">
                    <Icon size={13} className="mr-1 inline-block" />
                    {c("Farm essential", "వ్యవసాయ అవసరం")}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-xl font-semibold text-[#243e2d]">
                    {c(input.title, input.titleTe)}
                  </h3>
                  <p className="mt-2 min-h-[3.25rem] text-xs leading-6 text-muted">
                    {c(input.summary, input.summaryTe)}
                  </p>
                  <ul className="mt-4 space-y-2.5 border-t border-green/10 pt-4">
                    {input.details.map(([en, te]) => (
                      <li
                        key={en}
                        className="flex gap-2 text-[11px] leading-5 text-[#536451]"
                      >
                        <BadgeCheck
                          size={14}
                          className="mt-0.5 shrink-0 text-green"
                        />
                        <span>{c(en, te)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 min-h-10 rounded-xl bg-[#f5f8f0] px-3 py-2.5 text-[10px] leading-5 text-[#667560]">
                    {c(input.note, input.noteTe)}
                  </p>
                  <button
                    type="button"
                    className="mk-btn mt-4 w-full justify-center"
                    onClick={() => openRequest(input)}
                  >
                    {c("Check price & availability", "ధర, లభ్యత తెలుసుకోండి")}
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-[10px] leading-5 text-muted">
          {c(
            "Images are illustrative. Items, suppliers, stock, delivery and prices are confirmed with you before you decide to buy.",
            "చిత్రాలు సూచన కోసం మాత్రమే. కొనుగోలు నిర్ణయానికి ముందు ఉత్పత్తులు, సరఫరాదారులు, స్టాక్, డెలివరీ, ధర మీతో నిర్ధారిస్తాము.",
          )}
        </p>
      </section>

      <dialog
        ref={dialog}
        className="mk-input-request-dialog"
        aria-labelledby="farm-input-request-title"
        onCancel={close}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        {selected && (
          <div>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mk-eyebrow">
                  {c("Availability & quote", "లభ్యత & ధర")}
                </p>
                <h2
                  id="farm-input-request-title"
                  className="mt-1 font-heading text-2xl font-semibold"
                >
                  {c(selected.title, selected.titleTe)}
                </h2>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {c(
                    "Add a few farm details. WhatsApp opens with your request ready to send.",
                    "కొన్ని వ్యవసాయ వివరాలు ఇవ్వండి. పంపడానికి సిద్ధంగా ఉన్న అభ్యర్థనతో వాట్సాప్ తెరుచుకుంటుంది.",
                  )}
                </p>
              </div>
              <button
                type="button"
                aria-label={c("Close request", "అభ్యర్థన మూసివేయి")}
                onClick={close}
                className="mk-icon shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <form className="space-y-3.5" onSubmit={requestQuote}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="mk-label">
                  {c("Your name", "మీ పేరు")}
                  <input
                    className="mk-input"
                    autoComplete="name"
                    maxLength={100}
                    required
                    value={fields.name}
                    onChange={(e) => setFields({ ...fields, name: e.target.value })}
                  />
                </label>
                <label className="mk-label">
                  {c("Mobile number", "మొబైల్ నంబర్")}
                  <input
                    className="mk-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    pattern="[6-9][0-9]{9}"
                    title={c("Enter a 10-digit Indian mobile number", "10 అంకెల భారతీయ మొబైల్ నంబర్ ఇవ్వండి")}
                    maxLength={10}
                    required
                    value={fields.phone}
                    onChange={(e) =>
                      setFields({
                        ...fields,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                  />
                </label>
              </div>
              <label className="mk-label">
                {c("Crop and variety", "పంట మరియు రకం")}
                <input
                  className="mk-input"
                  placeholder={c("e.g. chilli, tomato, cotton", "ఉదా: మిరప, టమాటా, పత్తి")}
                  maxLength={100}
                  required
                  value={fields.crop}
                  onChange={(e) => setFields({ ...fields, crop: e.target.value })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="mk-label">
                  {c("Area or quantity needed", "కావలసిన విస్తీర్ణం లేదా పరిమాణం")}
                  <input
                    className="mk-input"
                    placeholder={c("e.g. 2 acres or 10 rolls", "ఉదా: 2 ఎకరాలు లేదా 10 రోల్స్")}
                    maxLength={80}
                    required
                    value={fields.quantity}
                    onChange={(e) => setFields({ ...fields, quantity: e.target.value })}
                  />
                </label>
                <label className="mk-label">
                  {c("Village / district", "గ్రామం / జిల్లా")}
                  <input
                    className="mk-input"
                    autoComplete="address-level2"
                    maxLength={100}
                    required
                    value={fields.location}
                    onChange={(e) => setFields({ ...fields, location: e.target.value })}
                  />
                </label>
              </div>
              <label className="mk-label">
                {c("Anything else we should know? (optional)", "ఇంకేమైనా వివరాలు? (ఐచ్ఛికం)")}
                <textarea
                  className="mk-input min-h-20 resize-y"
                  maxLength={500}
                  value={fields.details}
                  onChange={(e) => setFields({ ...fields, details: e.target.value })}
                />
              </label>

              <button type="submit" className="mk-btn w-full justify-center">
                <MessageCircle size={16} />
                {c("Continue on WhatsApp", "వాట్సాప్‌లో కొనసాగించండి")}
              </button>
              {whatsAppUrl && (
                <p role="status" className="rounded-xl bg-[#f0f6eb] p-3 text-xs leading-5 text-[#365c3b]">
                  {c(
                    "WhatsApp opened in a new tab. Review your request and tap Send; it has not been sent yet.",
                    "కొత్త ట్యాబ్‌లో వాట్సాప్ తెరుచుకుంది. అభ్యర్థనను చూసి Send నొక్కండి; ఇంకా పంపబడలేదు.",
                  )}{" "}
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2"
                  >
                    {c("Open WhatsApp again", "వాట్సాప్ మళ్లీ తెరవండి")}
                  </a>
                </p>
              )}
              <p className="flex items-center justify-center gap-1.5 text-center text-[10px] leading-5 text-muted">
                <ShieldCheck size={13} />
                {c(
                  `Your details go only in the WhatsApp message you choose to send. Call ${SITE.phone} if you prefer.`,
                  `మీరు పంపాలని ఎంచుకున్న వాట్సాప్ సందేశంలోనే మీ వివరాలు ఉంటాయి. కావాలంటే ${SITE.phone}కు కాల్ చేయండి.`,
                )}
              </p>
            </form>
          </div>
        )}
      </dialog>
    </>
  );
}
