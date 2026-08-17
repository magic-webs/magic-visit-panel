"use client";

import * as React from "react";

const subscribe = () => () => {};

/**
 * True once the client has hydrated. Prefer this over a `useState` +
 * `useEffect(() => setState(true), [])` pair (a common next-themes-adjacent
 * pattern) — that shape calls setState synchronously inside an effect body,
 * which triggers a cascading extra render. useSyncExternalStore's dedicated
 * server/client snapshot split gets the same hydration-safe result for free.
 */
export function useHydrated(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
