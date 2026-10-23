import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "./config";

// A Supabase client for this request, reading the session from cookies.
// Returns null when Supabase isn't configured.
export async function createClient() {
  if (!supabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can't write cookies; src/proxy.ts refreshes the
          // session on the routes that use it.
        }
      },
    },
  });
}

export type CurrentUser = { id: string; email: string | null };

// The signed-in user, verified with getClaims (it checks the token's
// signature, unlike getSession). Null when signed out or not configured.
export async function getCurrentUser(supabase?: Awaited<ReturnType<typeof createClient>>): Promise<CurrentUser | null> {
  const client = supabase ?? (await createClient());
  if (!client) return null;
  const { data } = await client.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null };
}
