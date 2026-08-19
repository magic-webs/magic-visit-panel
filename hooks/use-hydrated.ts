"use client";

import * as React from "react";

const subscribe = () => () => {};

/**
 * True once the client has hydrated. Uses useSyncExternalStore instead of a
 * useState+useEffect pair, avoiding the extra render that setState-in-effect causes.
 */
export function useHydrated(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
