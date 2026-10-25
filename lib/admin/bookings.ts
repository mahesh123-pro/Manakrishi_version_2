import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { MarketError, requireValue } from "../marketplace/auth.ts";
import type { User } from "../marketplace/types.ts";
import { validateDispatch } from "./booking-rules.ts";

function firestore() {
  const credentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!credentials) throw new MarketError("booking_backend_unconfigured", 503);
  let serviceAccount: {
    project_id: string;
    client_email: string;
    private_key: string;
  };
  try {
    serviceAccount = JSON.parse(credentials);
  } catch {
    throw new MarketError("booking_backend_unconfigured", 503);
  }
  const project =
    process.env.FIREBASE_BOOKINGS_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FB_PROJECT_ID;
  if (
    !project ||
    serviceAccount.project_id !== project ||
    !serviceAccount.client_email ||
    !serviceAccount.private_key
  )
    throw new MarketError("booking_backend_unconfigured", 503);
  const app =
    getApps().find((a) => a.name === "admin-bookings") ||
    initializeApp(
      {
        credential: cert({
          projectId: project,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
      },
      "admin-bookings",
    );
  return getFirestore(app);
}
const string = (value: unknown, max = 1000) =>
  typeof value === "string" ? value.slice(0, max) : "";
export async function listBookings(user: User, cursor?: string) {
  requireValue(user.role === "admin", "forbidden", 403);
  const db = firestore();
  let query = db.collection("bookings").orderBy("__name__").limit(51);
  if (cursor) {
    requireValue(
      !cursor.includes("/") && cursor.length <= 1500,
      "invalid_fields",
    );
    query = query.startAfter(cursor);
  }
  // ID pagination includes historical documents without timestamps. Sorting by
  // preferred service date is performed in the admin client on loaded records.
  const snapshot = await query.get();
  const items = snapshot.docs.slice(0, 50).map((doc) => {
    const b = doc.data(),
      dispatch = b.adminDispatch || {};
    return {
      id: doc.id,
      fullname: string(b.fullname),
      mobile: string(b.mobile),
      village: string(b.village),
      date: string(b.date),
      crop: string(b.crop),
      acres: string(b.acres),
      serviceType: string(b.serviceType),
      chemicalOrImplement: string(b.chemicalOrImplement),
      preferredTime: string(b.preferredTime),
      contactPreference: string(b.contactPreference),
      notes: string(b.notes),
      status: string(b.status) || "new",
      operatorName: string(dispatch.operatorName),
      operatorPhone: string(dispatch.operatorPhone),
      scheduledDate: string(dispatch.scheduledDate),
      scheduledTime: string(dispatch.scheduledTime),
      reviewNote: string(dispatch.reason),
      updatedAt: string(dispatch.updatedAt),
    };
  });
  return {
    items,
    hasMore: snapshot.docs.length > 50,
    cursor: items.at(-1)?.id || "",
  };
}
export async function updateBooking(
  user: User,
  input: Record<string, unknown>,
) {
  requireValue(user.role === "admin", "forbidden", 403);
  requireValue(
    typeof input.id === "string" &&
      Boolean(input.id) &&
      input.id.length <= 1500 &&
      !input.id.includes("/"),
    "invalid_fields",
  );
  let details: ReturnType<typeof validateDispatch>;
  try {
    details = validateDispatch(input);
  } catch (error) {
    throw new MarketError((error as Error).message);
  }
  const db = firestore(),
    ref = db.collection("bookings").doc(input.id);
  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    requireValue(snapshot.exists, "not_found", 404);
    const prior = snapshot.data()!;
    requireValue(
      (prior.status || "new") === details.expected,
      "stale_booking",
      409,
    );
    const dispatch = {
      operatorName: details.operatorName,
      operatorPhone: details.operatorPhone,
      scheduledDate: details.scheduledDate,
      scheduledTime: details.scheduledTime,
      reason: details.reason,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };
    const audit = db.collection("booking_admin_audit").doc();
    tx.update(ref, { status: details.target, adminDispatch: dispatch });
    tx.create(audit, {
      bookingId: input.id,
      actorId: user.id,
      actorEmail: user.email,
      from: details.expected,
      to: details.target,
      ...dispatch,
      recordedAt: FieldValue.serverTimestamp(),
    });
  });
}
