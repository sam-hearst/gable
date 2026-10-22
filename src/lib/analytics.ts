// Sends a GA4 event. The root layout defines window.gtag before hydration when
// GA is on (production builds, or NEXT_PUBLIC_GA_ID set); otherwise a no-op.
export function trackEvent(name: string, params: Record<string, string> = {}) {
  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", name, params);
}
