import type { FirebaseOptions } from "firebase/app";

/**
 * Default Firebase web config for this app (client-safe; restrict in Google Cloud).
 * Override any field with VITE_FIREBASE_* in `.env` for other environments.
 */
export const DEFAULT_FIREBASE_WEB_CONFIG: FirebaseOptions = {
  apiKey: "AIzaSyBPN2W4fU7Gui3kZ2XkKT1dRrzHPtKGaro",
  authDomain: "chhabit-ab3e0.firebaseapp.com",
  projectId: "chhabit-ab3e0",
  storageBucket: "chhabit-ab3e0.firebasestorage.app",
  messagingSenderId: "567611978900",
  appId: "1:567611978900:web:7e50f3d1b0fc8706413081",
  measurementId: "G-QG48L0BT56",
};

function pick(
  env: string | undefined,
  fallback: string | undefined
): string {
  const v = typeof env === "string" ? env.trim() : "";
  return v || fallback || "";
}

/** Resolves config: non-empty VITE_* wins, else embedded default for local dev. */
export function resolveFirebaseWebConfig(): FirebaseOptions {
  const d = DEFAULT_FIREBASE_WEB_CONFIG;
  const measurementId = pick(
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    d.measurementId as string | undefined
  );
  const base: FirebaseOptions = {
    apiKey: pick(import.meta.env.VITE_FIREBASE_API_KEY, d.apiKey as string),
    authDomain: pick(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, d.authDomain),
    projectId: pick(import.meta.env.VITE_FIREBASE_PROJECT_ID, d.projectId),
    storageBucket: pick(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, d.storageBucket),
    messagingSenderId: pick(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, d.messagingSenderId),
    appId: pick(import.meta.env.VITE_FIREBASE_APP_ID, d.appId),
  };
  if (measurementId) base.measurementId = measurementId;
  return base;
}
