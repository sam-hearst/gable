"use client";

import { useEffect } from "react";
import { rememberUtm } from "@/lib/utm";

// Mounted once in the root layout: remembers the utm_ tags of the link a
// visitor arrived with (see src/lib/utm.ts). Renders nothing.
export function UtmCapture() {
  useEffect(() => {
    rememberUtm();
  }, []);
  return null;
}
