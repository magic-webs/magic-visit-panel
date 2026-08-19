"use client";

import { init } from "@instantdb/react";
import schema from "@/lib/instant.schema";

// Browser InstantDB client. Handles the one-time login-token exchange (db.auth.signInWithToken) that seeds the httpOnly session cookie,
// plus realtime reads (db.useQuery) — safe to keep live app-wide since instant.perms.ts scopes every read to the operator and blocks all writes.
const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

if (!appId && process.env.NODE_ENV !== "production") {
  console.warn(
    "NEXT_PUBLIC_INSTANT_APP_ID is not set — InstantDB reads/login will fail. See .env.example.",
  );
}

export const db = init({
  appId: appId ?? "",
  schema,
});
