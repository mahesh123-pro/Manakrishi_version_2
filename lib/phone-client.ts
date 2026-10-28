"use client";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
let ready: ReturnType<typeof setup> | undefined;
async function setup() {
  const app =
    getApps().find((a) => a.name === "marketplace-phone") ||
    initializeApp(
      {
        apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FB_APP_ID,
      },
      "marketplace-phone",
    );
  const auth = getAuth(app);
  await setPersistence(auth, inMemoryPersistence);
  return auth;
}
export function getPhoneAuth() {
  return (ready ||= setup().catch((error) => {
    ready = undefined;
    throw error;
  }));
}
