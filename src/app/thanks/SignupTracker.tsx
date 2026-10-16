"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

// Fires the GA sign_up key event once the visitor lands here after joining.
export function SignupTracker() {
  const source = useSearchParams().get("source") ?? "unknown";
  useEffect(() => {
    trackEvent("sign_up", { method: "email", page_variant: source });
  }, [source]);
  return null;
}
