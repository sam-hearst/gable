"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinWaitlist } from "@/app/actions";

type SignupFormProps = {
  source: string;
  mode?: string;
  request?: string;
  button: string;
  placeholder?: string;
  stacked?: boolean;
  autoFocus?: boolean;
};

// Email capture used in the page CTA and the chat popup. Saves through the
// joinWaitlist server action, then sends the visitor to /thanks, which fires
// the GA sign_up key event.
export function SignupForm({
  source,
  mode,
  request,
  button,
  placeholder = "you@columbia.edu",
  stacked = false,
  autoFocus = false,
}: SignupFormProps) {
  const router = useRouter();
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    const params = new URLSearchParams(window.location.search);
    startTransition(async () => {
      const result = await joinWaitlist({
        email,
        source,
        mode,
        request,
        utm_source: params.get("utm_source") ?? undefined,
        utm_medium: params.get("utm_medium") ?? undefined,
        utm_campaign: params.get("utm_campaign") ?? undefined,
      });
      if (result.ok) {
        router.push(`/thanks?source=${encodeURIComponent(source)}&ref=${result.ref}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <form className="email-form" onSubmit={onSubmit} noValidate style={stacked ? { flexDirection: "column" } : undefined}>
        <label htmlFor={id} className="sr-only">
          Email
        </label>
        <input
          id={id}
          type="email"
          name="email"
          placeholder={placeholder}
          autoComplete="email"
          required
          autoFocus={autoFocus}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Saving..." : button}
        </button>
      </form>
      <div className="form-error" role="alert">
        {error}
      </div>
    </>
  );
}
