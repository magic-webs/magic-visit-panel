"use client";

import { init } from "@instantdb/react";
import schema from "@/lib/instant.schema";

// Browser InstantDB client. Two jobs, both described in the panel spec:
//   1. The one-time login-token exchange (db.auth.signInWithToken) that
//      turns /api/auth/login's response into a live InstantDB session, whose
//      refresh_token is then handed to /api/auth/session to become the
//      canonical httpOnly cookie used for every privileged write.
//   2. Realtime reads (db.useQuery) for dashboards/lists — instant.perms.ts
//      already scopes every read to the signed-in panel operator, so this
//      session is safe to keep live for the whole app; it can never write to
//      any of these namespaces regardless (see instant.perms.ts).
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
