// Sends a GA4 event. The root layout defines window.gtag before hydration when
// NEXT_PUBLIC_GA_ID is set; without it (local dev) this is a no-op.
export function trackEvent(name: string, params: Record<string, string> = {}) {
  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", name, params);
}
