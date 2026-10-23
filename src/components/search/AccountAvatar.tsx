"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/config";

// The account control in the /search header: a round avatar with your
// initial (it opens your favorites, where you can also sign out), or "Sign in"
// when signed out. Checks sign-in in the browser, like the site header does.
export function AccountAvatar() {
  const router = useRouter();
  // undefined while checking; null when signed out.
  const [email, setEmail] = useState<string | null | undefined>(supabaseConfigured ? undefined : null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (email === undefined) return <span className="search-account-slot" aria-hidden="true" />;

  if (email) {
    return (
      <Link className="search-account" href="/favorites" title={`Signed in as ${email}`} aria-label={`Your favorites (signed in as ${email})`}>
        {email[0].toUpperCase()}
      </Link>
    );
  }

  return (
    <Link
      className="search-signin"
      href="/signin"
      onClick={(e) => {
        e.preventDefault();
        router.push(`/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }}
    >
      Sign in
    </Link>
  );
}
