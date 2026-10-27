"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Search, Sprout, Users, Wheat } from "lucide-react";
import { money } from "@/lib/marketplace/types";
import { Empty, PageHeading, Skeleton, useMarket } from "./MarketProvider";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "buyer";
  verified: number;
  village: string;
  district: string;
  state: string;
  publicContact: string;
  createdAt: string;
};
type Crop = {
  id: string;
  crop: string;
  category: string;
  status: string;
  quantity: number;
  unit: string;
  price: number;
  sellerId: string;
  seller: string;
  village: string;
  district: string;
  state: string;
};
type DeskData = { members: Member[]; crops: Crop[] };

export function Fpo() {
  const { user, loading, api, refresh, c } = useMarket();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await api<{ user: { role: string } | null }>(
        "auth/login",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      if (result.user?.role !== "fpo") {
        await api("logout", {});
        setError(
          c(
            "This account does not have FPO access yet. Ask a marketplace administrator to enable it.",
            "ఈ ఖాతాకు ఇంకా FPO ప్రవేశం లేదు. మార్కెట్ అడ్మిన్‌ను ప్రారంభించమని అడగండి.",
          ),
        );
      } else await refresh();
    } catch {
      setError(
        c(
          "Email or password is incorrect, or this account is unavailable.",
          "ఇమెయిల్ లేదా పాస్‌వర్డ్ తప్పు, లేదా ఖాతా అందుబాటులో లేదు.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mk-container max-w-7xl">
      {loading ? (
        <Skeleton />
      ) : !user ? (
        <section className="mx-auto max-w-xl py-10">
          <PageHeading
            eyebrow="MANAKRISHI FPO"
            title={c("FPO sign in", "FPO సైన్ ఇన్")}
            body={c(
              "Use your enabled marketplace account to access the member and crop directory.",
              "సభ్యులు మరియు పంట డైరెక్టరీ కోసం ప్రారంభించిన మార్కెట్ ఖాతాతో సైన్ ఇన్ చేయండి.",
            )}
          />
          <form onSubmit={signIn} className="mk-panel space-y-5">
            <label className="mk-label">
              {c("Email address", "ఇమెయిల్ చిరునామా")}
              <input
                className="mk-input"
                name="email"
                type="email"
                autoComplete="username"
                maxLength={254}
                required
              />
            </label>
            <label className="mk-label">
              {c("Password", "పాస్‌వర్డ్")}
              <input
                className="mk-input"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={128}
                required
              />
            </label>
            {error && (
              <p className="mk-error" role="alert">
                {error}
              </p>
            )}
            <button className="mk-btn w-full" disabled={busy}>
              {busy
                ? c("Signing in…", "సైన్ ఇన్ అవుతోంది…")
                : c("Sign in to FPO desk", "FPO డెస్క్‌లోకి సైన్ ఇన్")}
            </button>
            <p className="text-xs leading-6 text-muted">
              {c(
                "FPO access is enabled by an administrator for an existing farmer or buyer account. It cannot be self-selected during registration.",
                "ఇప్పటికే ఉన్న రైతు లేదా కొనుగోలుదారు ఖాతాకు అడ్మిన్ FPO ప్రవేశాన్ని ప్రారంభిస్తారు. నమోదు సమయంలో స్వయంగా ఎంచుకోలేరు.",
              )}
            </p>
          </form>
        </section>
      ) : user.role !== "fpo" ? (
        <Empty
          title={c("FPO access is not enabled", "FPO ప్రవేశం ప్రారంభించలేదు")}
          body={c(
            "Ask a marketplace administrator to enable FPO access for this account.",
            "ఈ ఖాతాకు FPO ప్రవేశం ప్రారంభించమని మార్కెట్ అడ్మిన్‌ను అడగండి.",
          )}
        />
      ) : (
        <MemberDesk />
      )}
    </div>
  );
}

function MemberDesk() {
  const { api, c } = useMarket();
  const [data, setData] = useState<DeskData | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"members" | "crops">("members");

  useEffect(() => {
    let active = true;
    api<DeskData>("fpo")
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason) => {
        if (active) setError((reason as Error).message);
      });
    return () => {
      active = false;
    };
  }, [api]);

  const members = useMemo(
    () =>
      (data?.members || []).filter((member) =>
        [
          member.name,
          member.email,
          member.role,
          member.village,
          member.district,
          member.state,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [data?.members, query],
  );
  const crops = useMemo(
    () =>
      (data?.crops || []).filter((crop) =>
        [
          crop.crop,
          crop.category,
          crop.seller,
          crop.village,
          crop.district,
          crop.state,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [data?.crops, query],
  );

  if (error)
    return (
      <div className="mk-panel my-8" role="alert">
        {c(
          "The FPO desk could not load. Please sign in again or contact an administrator.",
          "FPO డెస్క్ లోడ్ కాలేదు. మళ్లీ సైన్ ఇన్ చేయండి లేదా అడ్మిన్‌ను సంప్రదించండి.",
        )}
      </div>
    );
  if (!data) return <Skeleton />;

  const farmers = data.members.filter(
    (member) => member.role === "farmer",
  ).length;
  const buyers = data.members.length - farmers;
  const visible = view === "members" ? members.length : crops.length;
  const metrics = [
    {
      label: c("Farmer / seller accounts", "రైతు / విక్రేత ఖాతాలు"),
      value: farmers,
      Icon: Sprout,
    },
    {
      label: c("Buyer accounts", "కొనుగోలుదారుల ఖాతాలు"),
      value: buyers,
      Icon: Users,
    },
    {
      label: c("Crop listings", "పంట లిస్టింగ్‌లు"),
      value: data.crops.length,
      Icon: Wheat,
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="FPO MEMBER DESK"
        title={c(
          "Your farmer and buyer network",
          "మీ రైతులు మరియు కొనుగోలుదారుల నెట్‌వర్క్",
        )}
        body={c(
          "Find farmer/seller and buyer accounts, review published crop availability, and contact members who have chosen to share a business phone number.",
          "రైతు/విక్రేత మరియు కొనుగోలుదారుల ఖాతాలను కనుగొనండి, ప్రచురించిన పంట లభ్యతను చూడండి, వ్యాపార ఫోన్ పంచుకున్న సభ్యులను సంప్రదించండి.",
        )}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {metrics.map(({ label, value, Icon }) => {
          return (
            <div className="mk-panel flex items-center gap-4" key={label}>
              <Icon className="text-green" size={23} />
              <div>
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-1 font-heading text-2xl font-semibold">
                  {value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mk-panel mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            className={view === "members" ? "mk-btn" : "mk-secondary"}
            aria-pressed={view === "members"}
            onClick={() => setView("members")}
          >
            {c("Members", "సభ్యులు")}
          </button>
          <button
            className={view === "crops" ? "mk-btn" : "mk-secondary"}
            aria-pressed={view === "crops"}
            onClick={() => setView("crops")}
          >
            {c("Crop availability", "పంట లభ్యత")}
          </button>
        </div>
        <label className="relative block sm:w-80">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            className="mk-input pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={c(
              "Search names, crops or locations",
              "పేర్లు, పంటలు లేదా ప్రాంతాలను వెతకండి",
            )}
            aria-label={c("Search FPO directory", "FPO డైరెక్టరీని వెతకండి")}
          />
        </label>
      </div>

      <p className="mb-3 text-sm text-muted">
        {visible}{" "}
        {view === "members"
          ? c("accounts", "ఖాతాలు")
          : c("crop listings", "పంట లిస్టింగ్‌లు")}
      </p>

      {view === "members" ? (
        members.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <article className="mk-panel" key={member.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-lg font-semibold">
                      {member.name}
                    </h2>
                    <p className="mt-1 text-xs uppercase tracking-wide text-green">
                      {member.role === "farmer"
                        ? c("Farmer / seller", "రైతు / విక్రేత")
                        : c("Buyer", "కొనుగోలుదారు")}
                    </p>
                  </div>
                  {member.role === "farmer" && member.verified ? (
                    <span className="admin-badge admin-badge-good">
                      {c("Verified", "ధృవీకరించబడింది")}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 break-all text-sm">{member.email}</p>
                <p className="mt-2 text-sm text-muted">
                  {[member.village, member.district, member.state]
                    .filter(Boolean)
                    .join(", ") ||
                    c("Location not provided", "ప్రాంతం ఇవ్వలేదు")}
                </p>
                {member.role === "farmer" && (
                  <Link
                    className="mk-secondary mt-4 inline-flex"
                    href={`/marketplace/farmer/${member.id}`}
                  >
                    {c(
                      "Open public farm profile",
                      "పబ్లిక్ పొలం ప్రొఫైల్ చూడండి",
                    )}
                  </Link>
                )}
                {member.publicContact && (
                  <a
                    className="mk-btn mt-4 inline-flex"
                    href={`tel:${member.publicContact}`}
                  >
                    {c(
                      "Call shared business number",
                      "పంచుకున్న వ్యాపార నంబర్‌కు కాల్ చేయండి",
                    )}
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="mk-empty">
            {c(
              "No member accounts match this search.",
              "ఈ వెతుకులాటకు సభ్యుల ఖాతాలు లేవు.",
            )}
          </div>
        )
      ) : crops.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {crops.map((crop) => (
            <article className="mk-panel" key={crop.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold">
                    {crop.crop}
                  </h2>
                  <p className="mt-1 text-xs text-muted">{crop.category}</p>
                </div>
                <span className="admin-badge">
                  {crop.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-4 text-sm">{crop.seller}</p>
              <p className="mt-1 text-sm text-muted">
                {[crop.village, crop.district, crop.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="mt-3 text-sm">
                {crop.quantity} {crop.unit} {c("listed", "లిస్టు చేశారు")}
              </p>
              <p className="mt-2 text-sm font-semibold">
                {money(crop.price)} / {crop.unit}
              </p>
              <Link
                className="mk-secondary mt-4 inline-flex"
                href={`/marketplace/product/${crop.id}`}
              >
                {c("View crop listing", "పంట లిస్టింగ్ చూడండి")}
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mk-empty">
          {c(
            "No crop listings match this search.",
            "ఈ వెతుకులాటకు పంట లిస్టింగ్‌లు లేవు.",
          )}
        </div>
      )}

      <p className="mt-6 text-xs leading-6 text-muted">
        {c(
          "FPO access is read-only. Passwords and private buyer order details are never shown here. Members appear in this directory only while their marketplace accounts are active.",
          "FPO ప్రవేశం వీక్షణకు మాత్రమే. పాస్‌వర్డ్‌లు మరియు కొనుగోలుదారుల ప్రైవేట్ ఆర్డర్ వివరాలు ఇక్కడ చూపబడవు. మార్కెట్ ఖాతాలు క్రియాశీలంగా ఉన్నప్పుడే సభ్యులు కనిపిస్తారు.",
        )}
      </p>
    </>
  );
}
