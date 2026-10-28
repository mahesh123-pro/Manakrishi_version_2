"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMarket, PageHeading } from "./MarketProvider";
import { PhoneSignIn } from "./PhoneSignIn";
import type { User } from "@/lib/marketplace/types";

export function Account() {
  const { user, c, api, refresh, notice } = useMarket();
  const [mode, setMode] = useState("login"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(`auth/${mode}`, data);
      await refresh();
      notice(c("Welcome to Manakrishi", "మనకృషికి స్వాగతం"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mk-container max-w-3xl">
      <PageHeading
        title={c(
          user
            ? "Your marketplace account"
            : "A better connection to our farms",
          user ? "మీ మార్కెట్ ఖాతా" : "మన పొలాలతో మెరుగైన బంధం",
        )}
        body={c(
          "Marketplace accounts are separate from service booking requests.",
          "మార్కెట్ ఖాతాలు సేవా బుకింగ్ అభ్యర్థనల నుండి వేరు.",
        )}
      />
      {user ? (
        <>
          <div className="mk-panel mb-5">
            <p className="font-semibold">{user.name}</p>
            <p className="mt-2 text-sm text-muted">
              {user.phone || user.email} ·{" "}
              {c(
                user.role === "farmer"
                  ? "Farmer"
                  : user.role === "admin"
                    ? "Administrator"
                    : user.role === "fpo"
                      ? "FPO"
                      : "Buyer",
                user.role === "farmer"
                  ? "రైతు"
                  : user.role === "admin"
                    ? "అడ్మిన్"
                    : user.role === "fpo"
                      ? "FPO"
                      : "కొనుగోలుదారు",
              )}
            </p>
            <div className="mt-5 flex gap-3">
              <Link href="/marketplace" className="mk-btn">
                {c("Explore crops", "పంటలు చూడండి")}
              </Link>
              <Link href="/marketplace/orders" className="mk-secondary">
                {c("My orders", "నా ఆర్డర్లు")}
              </Link>
              {user.role === "fpo" && (
                <Link href="/fpo" className="mk-secondary">
                  {c("FPO member desk", "FPO సభ్యుల డెస్క్")}
                </Link>
              )}
            </div>
          </div>
          {!user.phone && <PhoneSignIn link />}
          {user.role === "buyer" && (
            <button
              className="mk-btn my-5"
              onClick={async () => {
                try {
                  await api("become-seller", {});
                  await refresh();
                } catch (e) {
                  notice((e as Error).message);
                }
              }}
            >
              {c(
                "Sell my harvest — enable seller account",
                "నా పంట అమ్మాలి — విక్రేత ఖాతా ప్రారంభించు",
              )}
            </button>
          )}
          {user.role === "farmer" && <Profile user={user} />}
        </>
      ) : (
        <>
          <PhoneSignIn />
          <details className="mt-5">
            <summary className="cursor-pointer text-sm text-green">
              {c(
                "Existing email account / administrator sign in",
                "ఇప్పటికే ఉన్న ఇమెయిల్ ఖాతా / అడ్మిన్ సైన్ ఇన్",
              )}
            </summary>
            <p className="my-3 text-xs text-muted">
              {c(
                "Sign in once with your existing account, then link your mobile number to keep your listings and orders.",
                "మీ పాత ఖాతాతో ఒకసారి సైన్ ఇన్ చేసి మొబైల్ నంబర్‌ను అనుసంధానించండి.",
              )}
            </p>
            <form onSubmit={submit} className="mk-panel">
              <div className="mb-6 flex gap-3">
                <button
                  type="button"
                  className={mode === "login" ? "mk-btn" : "mk-secondary"}
                  onClick={() => setMode("login")}
                >
                  {c("Sign in", "సైన్ ఇన్")}
                </button>
                <button
                  type="button"
                  className={mode === "register" ? "mk-btn" : "mk-secondary"}
                  onClick={() => setMode("register")}
                >
                  {c("Create account", "ఖాతా సృష్టించు")}
                </button>
              </div>
              <fieldset disabled={busy} className="space-y-5">
                {mode === "register" && (
                  <>
                    <label className="mk-label">
                      {c("Your full name", "మీ పూర్తి పేరు")}
                      <input
                        name="name"
                        required
                        minLength={2}
                        maxLength={100}
                        autoComplete="name"
                        className="mk-input"
                      />
                    </label>
                    <label className="mk-label">
                      {c("I want to…", "నేను…")}
                      <select name="role" className="mk-input">
                        <option value="buyer">
                          {c("Buy farm produce", "వ్యవసాయ ఉత్పత్తులు కొనాలి")}
                        </option>
                        <option value="farmer">
                          {c("Sell my harvest", "నా పంట అమ్మాలి")}
                        </option>
                      </select>
                    </label>
                  </>
                )}
                <label className="mk-label">
                  {c("Email address", "ఇమెయిల్ చిరునామా")}
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    className="mk-input"
                  />
                </label>
                <label className="mk-label">
                  {c("Password", "పాస్‌వర్డ్")}
                  <input
                    type="password"
                    name="password"
                    autoComplete={
                      mode === "register" ? "new-password" : "current-password"
                    }
                    required
                    minLength={mode === "register" ? 12 : 1}
                    maxLength={128}
                    className="mk-input"
                  />
                  {mode === "register" && (
                    <span className="mt-2 block text-[11px] font-normal text-muted">
                      {c(
                        "At least 12 characters. Use a unique password.",
                        "కనీసం 12 అక్షరాలు. ప్రత్యేక పాస్‌వర్డ్ వాడండి.",
                      )}
                    </span>
                  )}
                </label>
                {error && (
                  <p role="alert" className="mk-error">
                    {error}
                  </p>
                )}
                <button className="mk-btn w-full" disabled={busy}>
                  {busy
                    ? c("Please wait…", "వేచి ఉండండి…")
                    : mode === "register"
                      ? c("Create my account", "నా ఖాతా సృష్టించు")
                      : c("Sign in", "సైన్ ఇన్")}
                </button>
              </fieldset>
              <p className="mt-5 text-xs leading-6 text-muted">
                {c(
                  "Publish crop listings directly from your farmer account. A verified seller badge requires a separate administrator check.",
                  "రైతు ఖాతా నుండి పంటలను నేరుగా ప్రచురించండి. ధృవీకరించిన విక్రేత బ్యాడ్జ్ కోసం అడ్మిన్ తనిఖీ అవసరం.",
                )}{" "}
                <Link href="/privacy-policy" className="underline">
                  {c("Privacy policy", "గోప్యతా విధానం")}
                </Link>
              </p>
              <p className="mt-3 text-xs text-muted">
                {c("Need account help?", "ఖాతా సహాయం కావాలా?")}{" "}
                <Link href="/support" className="underline">
                  {c("Contact support", "సహాయం పొందండి")}
                </Link>
              </p>
              <p className="mt-3 text-xs text-muted">
                {c("FPO member?", "FPO సభ్యులా?")}{" "}
                <Link href="/fpo" className="underline">
                  {c(
                    "Sign in to the FPO desk",
                    "FPO డెస్క్‌లోకి సైన్ ఇన్ చేయండి",
                  )}
                </Link>
              </p>
            </form>
          </details>
        </>
      )}
    </div>
  );
}
function Profile({ user }: { user: User }) {
  const { api, c, refresh, notice } = useMarket();
  const [photo, setPhoto] = useState(user.photo || "");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("profile", Object.fromEntries(new FormData(e.currentTarget)));
      await refresh();
      notice(c("Farm profile updated", "పొలం ప్రొఫైల్ నవీకరించబడింది"));
    } catch (e) {
      notice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="mk-panel">
      <h2 className="mb-5 font-heading text-xl">
        {c("Your public farm profile", "మీ పబ్లిక్ పొలం ప్రొఫైల్")}
      </h2>
      <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
        {(
          [
            ["name", "Farm / farmer name", "రైతు / పొలం పేరు"],
            ["village", "Village", "గ్రామం"],
            ["district", "District", "జిల్లా"],
            ["state", "State", "రాష్ట్రం"],
            [
              "publicContact",
              "Public business phone (optional)",
              "పబ్లిక్ వ్యాపార ఫోన్ (ఐచ్ఛికం)",
            ],
          ] as const
        ).map(([key, en, te]) => (
          <label className="mk-label" key={key}>
            {c(en, te)}
            <input
              className="mk-input"
              name={key}
              defaultValue={user[key]}
              maxLength={100}
              required={key === "name"}
            />
          </label>
        ))}
        <label className="mk-label">
          {c("About your farm", "మీ పొలం గురించి")}
          <textarea
            name="bio"
            defaultValue={user.bio}
            maxLength={1000}
            className="mk-input"
          />
        </label>
        <div>
          <label className="mk-label">
            {c(
              "Public farm photograph (optional)",
              "పబ్లిక్ పొలం చిత్రం (ఐచ్ఛికం)",
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mk-input"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                try {
                  const body = new FormData();
                  body.set("file", file);
                  const result = await api<{ url: string }>("upload", body);
                  setPhoto(result.url);
                } catch (error) {
                  notice((error as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {photo && (
            <Image
              src={photo}
              alt={user.name}
              width={120}
              height={90}
              unoptimized
              className="mt-3 rounded-xl"
            />
          )}
          <input type="hidden" name="photo" value={photo} />
        </div>
        <p className="text-xs leading-6 text-muted sm:col-span-2">
          {c(
            "Only add a phone number you explicitly want to share publicly. Your email and private listing contact remain private.",
            "పబ్లిక్‌గా పంచాలనుకున్న ఫోన్ నంబర్ మాత్రమే నమోదు చేయండి. ఇమెయిల్ మరియు ప్రైవేట్ సంప్రదింపు గోప్యంగా ఉంటాయి.",
          )}
        </p>
        <button className="mk-btn">
          {busy
            ? c("Saving…", "సేవ్ అవుతోంది…")
            : c("Save farm profile", "ప్రొఫైల్ సేవ్ చేయి")}
        </button>
      </fieldset>
    </form>
  );
}
