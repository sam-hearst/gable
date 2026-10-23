"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/config";
import "./account.css";

// "Sign in" / "Sign out" in the site header, plus a Favorites link on narrow
// screens (where the header's tab links are hidden). On phones it's just a
// heart icon so the header doesn't get crowded. It checks sign-in in the browser
// so the landing pages stay static.
export function AccountLink() {
  const pathname = usePathname();
  // Unknown until the browser checks; signed out for good when not configured.
  const [signedIn, setSignedIn] = useState<boolean | null>(supabaseConfigured ? null : false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  if (signedIn === null) return null;

  return (
    <>
      <Link className="account-fav" href="/favorites" aria-label="Favorites">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        <span className="account-fav-text">Favorites</span>
      </Link>
      {signedIn ? (
        <form action="/auth/signout" method="post">
          <button className="account-link" type="submit">
            Sign out
          </button>
        </form>
      ) : (
        <Link className="account-link" href={`/signin?next=${encodeURIComponent(pathname)}`}>
          Sign in
        </Link>
      )}
    </>
  );
}
