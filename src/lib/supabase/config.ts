// Public Supabase settings for sign-in and favorites. Both are safe in the
// browser: the publishable key only allows what the table's row level
// security allows. Without them, sign-in shows a "not set up" message and the
// rest of the site works as before.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
