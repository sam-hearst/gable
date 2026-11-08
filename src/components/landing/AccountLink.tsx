"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/config";
import type { Session } from "@supabase/supabase-js";
import "./account.css";

// The first name from sign-up or Google. Accounts made before we asked for a
// name have none until they add it in the sidebar, so the header just says Sign out.
function displayName(session: Session | null): string {
  if (!session) return "";
  // Email sign-up stores a first name; Google gives a full name, so use the first word.
  const meta = session.user.user_metadata ?? {};
  const name = meta.name ?? meta.full_name;
  return typeof name === "string" && name.trim() ? name.trim().split(/\s+/)[0] : "";
}

// The right side of the site header. Signed out: "Log in" and "Sign up".
// Signed in: Favorites, "Hi, name" and Sign out (on phones, just a heart).
// It checks sign-in in the browser so the landing pages stay static.
export function AccountLink() {
  const pathname = usePathname();
  // Unknown until the browser checks; signed out for good when not configured.
  const [signedIn, setSignedIn] = useState<boolean | null>(supabaseConfigured ? null : false);
  const [name, setName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const update = (session: Session | null) => {
      setSignedIn(Boolean(session));
      setName(displayName(session));
    };
    supabase.auth.getSession().then(({ data }) => update(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => update(session));
    return () => data.subscription.unsubscribe();
  }, []);

  if (signedIn === null) return null;

  const signinHref = `/signin?next=${encodeURIComponent(pathname)}`;

  // Signed out: "Log in" and a "Sign up" button, like Ohana. Favorites only
  // means something once you have an account, so it waits until you're in.
  if (!signedIn) {
    return (
      <>
        <Link className="account-link" href={signinHref}>
          Log in
        </Link>
        <Link className="account-link account-signin" href={`${signinHref}&mode=signup`}>
          Sign up
        </Link>
      </>
    );
  }

  return (
    <>
      <Link className="account-fav" href="/favorites" aria-label="Favorites">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        <span className="account-fav-text">Favorites</span>
      </Link>
      <form action="/auth/signout" method="post" className="account-signed-in">
        {name && <span className="account-name">Hi, {name}</span>}
        <button className="account-link" type="submit">
          Sign out
        </button>
      </form>
    </>
  );
}
