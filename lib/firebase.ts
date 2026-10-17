"use client";

/**
 * Booking backend — mirrors the current live site's pipeline exactly:
 *   1. Firestore  (manakrishi-booking) → `bookings` collection  [primary]
 *   2. Realtime DB (db-vt-gsocp)        → `bookings` ref         [WhatsApp Automator]
 *   3. Google Apps Script /exec         → appends a Sheet row
 *
 * Firebase is imported lazily so it never lands in the initial bundle of the
 * marketing pages — only the /book route (and the CTA) pulls it in.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDatabase, ref, push } from "firebase/database";

const primaryConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID,
};

const rtdbConfig = {
  apiKey: process.env.NEXT_PUBLIC_RTDB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_RTDB_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_RTDB_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_RTDB_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_RTDB_APP_ID,
};

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

function getPrimaryApp(): FirebaseApp {
  const existing = getApps().find((a) => a.name === "[DEFAULT]");
  return existing ?? initializeApp(primaryConfig);
}

function getRtdbApp(): FirebaseApp {
  const existing = getApps().find((a) => a.name === "rtdb");
  return existing ?? initializeApp(rtdbConfig, "rtdb");
}

export interface BookingPayload {
  fullname: string;
  mobile: string;
  village: string;
  date: string;
  crop: string;
  acres: string;
  serviceType?: string;
  chemicalOrImplement?: string;
  preferredTime?: string;
  contactPreference?: string;
  notes?: string;
}

/**
 * Submit a booking to all three sinks. Firestore write is required; the RTDB
 * mirror and Sheet POST are best-effort (they never block success), matching
 * the current site's behaviour.
 */
export async function submitBooking(payload: BookingPayload): Promise<void> {
  const app = getPrimaryApp();
  const db = getFirestore(app);

  await addDoc(collection(db, "bookings"), {
    ...payload,
    timestamp: serverTimestamp(),
    status: "new",
  });

  // Secondary RTDB mirror — feeds the WhatsApp Automator.
  try {
    const rtdb = getDatabase(getRtdbApp());
    await push(ref(rtdb, "bookings"), { ...payload, status: "new" });
  } catch (err) {
    console.error("RTDB sync error:", err);
  }

  // Google Sheet append (fire-and-forget, no-cors).
  if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("REPLACE")) {
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}

export interface DeletionRequest {
  fullname: string;
  mobile: string;
  reason: string;
  otherReason: string;
}

/**
 * Submit an account / data deletion request. Mirrors the previous site:
 * writes to Firestore `delete_requests` (status `pending_deletion`) and mirrors
 * to the RTDB. Handled manually by the Manakrishi team.
 */
export async function submitDeletionRequest(payload: DeletionRequest): Promise<void> {
  const app = getPrimaryApp();
  const db = getFirestore(app);

  await addDoc(collection(db, "delete_requests"), {
    ...payload,
    timestamp: serverTimestamp(),
    status: "pending_deletion",
  });

  try {
    const rtdb = getDatabase(getRtdbApp());
    await push(ref(rtdb, "delete_requests"), {
      ...payload,
      status: "pending_deletion",
    });
  } catch (err) {
    console.error("RTDB deletion sync error:", err);
  }
}

export { getApp };
