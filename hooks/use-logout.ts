"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { db } from "@/lib/instant";
import { logoutRequest } from "@/lib/auth-bridge-client";

export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const logout = React.useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logoutRequest();
    } finally {
      try {
        await db.auth.signOut();
      } catch {
        // ignore — the httpOnly cookie clearing above is what actually matters
      }
      router.replace("/login");
      router.refresh();
    }
  }, [router]);

  return { logout, isLoggingOut };
}
