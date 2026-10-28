"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { useMarket } from "./MarketProvider";

function message(error: unknown) {
  const code = (error as { code?: string }).code || "";
  if (code === "auth/configuration-not-found")
    return "Mobile login is not configured in Firebase yet. Contact Manakrishi support, or use your existing email account below. (auth/configuration-not-found)";
  if (code === "auth/invalid-phone-number")
    return "Enter a valid 10-digit Indian mobile number without +91.";
  if (code === "auth/network-request-failed")
    return "Could not reach phone verification. Check your connection and allow Google reCAPTCHA, then try again.";
  if (
    [
      "auth/invalid-verification-code",
      "auth/code-expired",
      "auth/session-expired",
    ].includes(code)
  )
    return "The OTP is incorrect or expired. Try again or request a new code.";
  if (code === "auth/too-many-requests" || code === "auth/quota-exceeded")
    return "SMS attempts are temporarily limited. Please wait and try again.";
  if (
    [
      "auth/operation-not-allowed",
      "auth/billing-not-enabled",
      "auth/unauthorized-domain",
      "auth/invalid-app-credential",
      "auth/captcha-check-failed",
      "auth/invalid-api-key",
    ].includes(code)
  )
    return "Phone verification is not available yet. Please contact support or use your existing email account.";
  return error instanceof Error && !code
    ? error.message
    : `Could not verify your mobile number. Please try again.${/^auth\/[a-z-]+$/.test(code) ? ` (${code})` : ""}`;
}

export function PhoneSignIn({ link = false }: { link?: boolean }) {
  const { user, api, refresh, c, notice } = useMarket();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const confirmation = useRef<ConfirmationResult | null>(null);
  const verifier = useRef<RecaptchaVerifier | null>(null);
  const container = `phone-captcha-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  useEffect(
    () => () => {
      verifier.current?.clear();
    },
    [],
  );
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(
      () => setCooldown((v) => Math.max(0, v - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    if (busy || cooldown) return;
    if (!/^[6-9]\d{9}$/.test(phone) || name.trim().length < 2) {
      setError("Enter your name and a valid 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { getPhoneAuth } = await import("@/lib/phone-client");
      const { RecaptchaVerifier, signInWithPhoneNumber } =
        await import("firebase/auth");
      const auth = await getPhoneAuth();
      verifier.current?.clear();
      verifier.current = new RecaptchaVerifier(auth, container, {
        size: "normal",
      });
      confirmation.current = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        verifier.current,
      );
      setSent(true);
      setCode("");
      setCooldown(60);
    } catch (e) {
      setError(message(e));
      verifier.current?.clear();
      verifier.current = null;
    } finally {
      setBusy(false);
    }
  }
  async function verify(event: FormEvent) {
    event.preventDefault();
    if (busy || !confirmation.current) return;
    setBusy(true);
    setError("");
    let credential;
    try {
      credential = await confirmation.current.confirm(code);
      await api("auth/phone", {
        name: name.trim(),
        idToken: await credential.user.getIdToken(),
        link,
      });
      await refresh();
      notice(
        link
          ? c("Mobile number linked", "మొబైల్ నంబర్ అనుసంధానించబడింది")
          : c("Welcome to Manakrishi", "మనకృషికి స్వాగతం"),
      );
    } catch (e) {
      setError(message(e));
    } finally {
      if (credential) {
        const { signOut } = await import("firebase/auth");
        const { getPhoneAuth } = await import("@/lib/phone-client");
        await signOut(await getPhoneAuth()).catch(() => {});
      }
      setBusy(false);
    }
  }
  return (
    <section className="mk-panel space-y-5">
      <h2 className="font-heading text-xl font-semibold">
        {link
          ? c("Link your mobile number", "మీ మొబైల్ నంబర్ అనుసంధానించండి")
          : c("Sign in with mobile OTP", "మొబైల్ OTPతో సైన్ ఇన్ చేయండి")}
      </h2>
      <form onSubmit={sent ? verify : send} className="space-y-5">
        <fieldset disabled={busy} className="space-y-5">
          <label className="mk-label">
            {c("Your name", "మీ పేరు")}
            <input
              className="mk-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={100}
              autoComplete="name"
              required
              readOnly={sent || link}
            />
          </label>
          <label className="mk-label">
            {c("Mobile number", "మొబైల్ నంబర్")}
            <div className="flex items-center gap-2">
              <span className="text-sm">+91</span>
              <input
                className="mk-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                required
                readOnly={sent}
              />
            </div>
          </label>
          {sent && (
            <label className="mk-label">
              {c(
                "Enter the 6-digit SMS OTP",
                "SMSలో వచ్చిన 6 అంకెల OTP ఇవ్వండి",
              )}
              <input
                className="mk-input"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
              />
            </label>
          )}
          <div id={container} />
          {error && (
            <p className="mk-error" role="alert">
              {error}
            </p>
          )}
          {sent && (
            <p role="status" className="text-sm text-green">
              {c("OTP sent to", "OTP పంపబడింది")} +91 {phone}
            </p>
          )}
          <button
            className="mk-btn w-full"
            disabled={busy || (!sent && cooldown > 0)}
          >
            {busy
              ? c("Please wait…", "వేచి ఉండండి…")
              : sent
                ? c("Verify and continue", "ధృవీకరించి కొనసాగించండి")
                : c("Send OTP", "OTP పంపండి")}
          </button>
          {sent && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="mk-secondary"
                disabled={busy || cooldown > 0}
                onClick={() => send()}
              >
                {cooldown
                  ? `${c("Resend in", "మళ్లీ పంపడానికి")} ${cooldown}s`
                  : c("Resend OTP", "OTP మళ్లీ పంపు")}
              </button>
              <button
                type="button"
                className="mk-secondary"
                onClick={() => {
                  setSent(false);
                  confirmation.current = null;
                  setError("");
                  setCode("");
                  verifier.current?.clear();
                  verifier.current = null;
                }}
              >
                {c("Change number", "నంబర్ మార్చండి")}
              </button>
            </div>
          )}
        </fieldset>
      </form>
      <p className="text-xs leading-6 text-muted">
        {c(
          "By continuing, you agree to receive a verification SMS. Your phone number is processed by Google/Firebase for authentication and abuse prevention.",
          "కొనసాగించడం ద్వారా ధృవీకరణ SMS స్వీకరించడానికి అంగీకరిస్తారు. ధృవీకరణ, దుర్వినియోగ నిరోధం కోసం Google/Firebase మీ నంబర్‌ను ప్రాసెస్ చేస్తుంది.",
        )}
      </p>
    </section>
  );
}
