import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "./config";

// The browser's Supabase client (a single shared instance). Null when Supabase
// isn't configured.
export function createClient() {
  if (!supabaseConfigured) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
