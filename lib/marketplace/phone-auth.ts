import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { randomBytes, randomUUID } from "node:crypto";
import {
  MarketError,
  requireValue,
  hashPassword,
  newSession,
  limit,
  tokenHash,
} from "./auth.ts";
import { one, run, transaction } from "./db.ts";
import type { User } from "./types.ts";

export async function phoneLogin(
  input: Record<string, unknown>,
  linkUser: User | null,
) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  requireValue(raw, "phone_auth_unconfigured", 503);
  let identity;
  try {
    const credentials = JSON.parse(raw);
    const project = process.env.NEXT_PUBLIC_FB_PROJECT_ID;
    requireValue(
      project && credentials.project_id === project,
      "phone_auth_unconfigured",
      503,
    );
    const app =
      getApps().find((a) => a.name === "marketplace-phone") ||
      initializeApp(
        {
          credential: cert({
            projectId: credentials.project_id,
            clientEmail: credentials.client_email,
            privateKey: credentials.private_key,
          }),
        },
        "marketplace-phone",
      );
    identity = await getAuth(app).verifyIdToken(
      String(input.idToken || ""),
      true,
    );
  } catch (error) {
    if (error instanceof MarketError) throw error;
    throw new MarketError("invalid_otp", 401);
  }
  requireValue(
    identity.firebase.sign_in_provider === "phone" &&
      typeof identity.phone_number === "string" &&
      /^\+91[6-9]\d{9}$/.test(identity.phone_number) &&
      identity.auth_time >= Date.now() / 1000 - 300 &&
      identity.auth_time <= Date.now() / 1000 + 60,
    "invalid_otp",
    401,
  );
  await limit(`phone-login:${tokenHash(identity.phone_number)}`, 10, 900);
  const id = await connectPhone(
    identity.uid,
    identity.phone_number,
    String(input.name || "").trim(),
    input.link === true ? linkUser : null,
    input.link === true,
  );
  return newSession(id);
}

// Only call with a phone identity verified by Firebase Admin, never request fields.
export async function connectPhone(
  uid: string,
  phone: string,
  name: string,
  user: User | null = null,
  linking = false,
) {
  requireValue(
    /^\+91[6-9]\d{9}$/.test(phone) && uid.length > 0 && uid.length <= 128,
    "invalid_otp",
    401,
  );
  requireValue(!linking || user, "sign_in", 401);
  return transaction(async () => {
    if (linking)
      requireValue(
        await one("SELECT id FROM users WHERE id=? AND suspended=0", user!.id),
        "invalid_login",
        401,
      );
    const existing = await one<{
      userId: string;
      firebaseUid: string;
      suspended: number;
    }>(
      "SELECT p.userId,p.firebaseUid,u.suspended FROM phone_identities p JOIN users u ON u.id=p.userId WHERE p.phone=?",
      phone,
    );
    if (existing) {
      requireValue(
        existing.firebaseUid === uid && !existing.suspended,
        "invalid_login",
        401,
      );
      requireValue(
        !linking || existing.userId === user!.id,
        "phone_already_linked",
        409,
      );
      return existing.userId;
    }
    requireValue(
      !(await one(
        "SELECT userId FROM phone_identities WHERE firebaseUid=?",
        uid,
      )),
      "phone_already_linked",
      409,
    );
    if (linking)
      requireValue(
        !(await one(
          "SELECT userId FROM phone_identities WHERE userId=?",
          user!.id,
        )),
        "phone_already_linked",
        409,
      );
    else
      requireValue(name.length >= 2 && name.length <= 100, "invalid_account");
    const id = user?.id || randomUUID();
    if (!user)
      await run(
        "INSERT INTO users(id,email,password,name,role,createdAt) VALUES(?,?,?,?,?,?)",
        id,
        `${id}@phone.manakrishi.invalid`,
        await hashPassword(randomBytes(32).toString("hex")),
        name,
        "buyer",
        new Date().toISOString(),
      );
    await run(
      "INSERT INTO phone_identities(userId,phone,firebaseUid,createdAt) VALUES(?,?,?,?)",
      id,
      phone,
      uid,
      new Date().toISOString(),
    );
    await run(
      "INSERT INTO audit(actorId,action,targetId,detail,createdAt) VALUES(?,?,?,?,?)",
      id,
      linking ? "account.phone-linked" : "account.phone-created",
      id,
      "Verified Firebase phone identity",
      new Date().toISOString(),
    );
    return id;
  });
}
