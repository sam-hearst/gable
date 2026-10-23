"use client";

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
}: {
  next: string;
  save: string | null;
  configured: boolean;
  linkFailed: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(linkFailed ? "That sign-in link didn't work. Sign in below instead." : "");
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

    const { data, error } = await supabase.auth.signUp(credentials);
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

      <form onSubmit={submit} className="signin-form">
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
