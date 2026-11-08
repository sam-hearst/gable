"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setFavorite } from "@/app/favorites/actions";
import { createClient } from "@/lib/supabase/client";

// Email and password, like any listing site: create an account or sign in, and
// you're in right away. Then a heart you clicked while signed out is saved and
// you go back to where you were.
export function SignInForm({
  next,
  save,
  configured,
  linkFailed,
  googleFailed = false,
  startWithSignup = false,
}: {
  next: string;
  save: string | null;
  configured: boolean;
  linkFailed: boolean;
  googleFailed?: boolean;
  startWithSignup?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(startWithSignup ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    googleFailed
      ? "Google sign-in didn't finish. Try again, or use your email below."
      : linkFailed
        ? "That sign-in link didn't work. Sign in below instead."
        : "",
  );
  const [notice, setNotice] = useState("");

  if (!configured) {
    return (
      <div className="signin-card">
        <h1>Sign in</h1>
        <p className="signin-lead">Sign-in isn&apos;t set up on this copy of Gable yet, so saving places is off for now.</p>
      </div>
    );
  }

  async function finish() {
    if (save) await setFavorite(save, true).catch(() => null);
    router.replace(next);
    router.refresh();
  }

  // Google sign-in: Supabase sends you to Google and back to /auth/callback,
  // which signs you in and returns you to where you were.
  async function google() {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const back = new URL("/auth/callback", window.location.origin);
    back.searchParams.set("next", next);
    if (save) back.searchParams.set("save", save);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: back.toString() },
    });
    if (error) {
      setBusy(false);
      setError("Google sign-in isn't working right now. Use your email below instead.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setNotice("");
    const credentials = { email: email.trim(), password };

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword(credentials);
      if (error) {
        setBusy(false);
        setError("That email and password don't match. Check them, or create an account.");
        return;
      }
      return finish();
    }

    // The first name shows in the header once you're signed in.
    const { data, error } = await supabase.auth.signUp({
      ...credentials,
      options: { data: { name: name.trim() } },
    });
    if (error) {
      setBusy(false);
      setError(
        /registered|exists/i.test(error.message)
          ? "There's already an account with that email. Sign in instead."
          : /password/i.test(error.message)
            ? "Pick a longer password (at least 6 characters)."
            : "We couldn't create the account. Try again in a minute.",
      );
      return;
    }
    if (data.session) return finish();
    // Supabase is still set to require email confirmation.
    setBusy(false);
    setNotice("Account created. Check your email to confirm it, then sign in here.");
    setMode("signin");
  }

  const signup = mode === "signup";

  return (
    <div className="signin-card">
      <h1>{signup ? "Create an account" : "Sign in to save places"}</h1>
      <p className="signin-lead">
        Heart places as you search, then see them all on a map.
        {save && " The place you hearted will be saved once you're in."}
      </p>

      <button type="button" className="btn btn-secondary signin-google" onClick={google} disabled={busy}>
        <GoogleMark />
        Continue with Google
      </button>
      <div className="signin-or" aria-hidden="true">
        <span>or use your email</span>
      </div>

      <form onSubmit={submit} className="signin-form">
        {signup && (
          <>
            <label htmlFor="signin-name">First name</label>
            <input
              id="signin-name"
              type="text"
              required
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </>
        )}
        <label htmlFor="signin-email">Email</label>
        <input
          id="signin-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@columbia.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="signin-password">Password</label>
        <input
          id="signin-password"
          type="password"
          required
          minLength={6}
          autoComplete={signup ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? (signup ? "Creating account…" : "Signing in…") : signup ? "Create account" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        className="signin-back"
        onClick={() => {
          setMode(signup ? "signin" : "signup");
          setError("");
          setNotice("");
        }}
      >
        {signup ? "Already have an account? Sign in" : "New to Gable? Create an account"}
      </button>

      <p className="signin-privacy">
        By continuing you agree to our <Link href="/privacy">privacy policy</Link>.
      </p>

      {notice && (
        <p className="signin-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="signin-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Google's "G", which Google asks sign-in buttons to show.
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
