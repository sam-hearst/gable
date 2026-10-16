"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

// Fires the sign_up key event once the visitor lands here after joining.
export function SignupTracker() {
  const page = useSearchParams().get("page") ?? "unknown";
  useEffect(() => {
    trackEvent("sign_up", { method: "waitlist", signup_page: page });
  }, [page]);
  return null;
}
