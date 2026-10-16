"use client";

import { useActionState, useId, useRef } from "react";
import { joinWaitlist, type JoinState } from "@/app/actions";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

// The search box doubles as the waitlist form: what someone types is saved
// with their email, so we learn what people actually search for.
export function SignupForm({
  page,
  examples = [],
  onSage = false,
}: {
  page: string;
  // Example searches shown as chips; clicking one fills the box.
  examples?: string[];
  // On a sage section the form flips to cream so it still reads as one card.
  onSage?: boolean;
}) {
  const [state, action, pending] = useActionState<JoinState, FormData>(
    joinWaitlist,
    { error: null },
  );
  const id = useId();
  const searchRef = useRef<HTMLTextAreaElement>(null);
  const fieldBg = onSage ? "bg-sage" : "bg-cream";

  // Carry the visit's UTMs into the signup so we can see which post it came from.
  function submit(formData: FormData) {
    const params = new URLSearchParams(window.location.search);
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) formData.set(key, value.toLowerCase());
    }
    action(formData);
  }

  function fillExample(text: string) {
    const box = searchRef.current;
    if (!box) return;
    box.value = text;
    box.focus();
  }

  return (
    <div className="w-full">
      <form
        action={submit}
        className={`w-full rounded-2xl p-3 sm:p-4 ${onSage ? "bg-cream" : "bg-sage"}`}
      >
        <input type="hidden" name="page" value={page || "home"} />

        <label htmlFor={`${id}-looking`} className="block px-1 pb-2 text-[15px] font-medium">
          Describe your next home
        </label>
        <textarea
          ref={searchRef}
          id={`${id}-looking`}
          name="looking_for"
          rows={3}
          maxLength={500}
          placeholder="Budget, neighborhood, move-in date, pets, roommates, anything that matters to you…"
          className={`block w-full resize-none rounded-xl ${fieldBg} px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark`}
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <label htmlFor={`${id}-email`} className="sr-only">
            Email
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            className={`min-h-11 flex-1 rounded-xl ${fieldBg} px-4 text-ink placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark`}
          />
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 rounded-xl bg-accent px-6 font-bold text-cream transition-colors hover:bg-accent-dark disabled:opacity-70"
          >
            {pending ? "Joining…" : "Join the waitlist"}
          </button>
        </div>

        {state.error && (
          <p role="alert" className="mt-2 px-1 text-[15px] text-error">
            {state.error}
          </p>
        )}
      </form>

      {examples.length > 0 && (
        <div className="mt-4">
          <p className="px-1 text-[15px] text-ink-faint">Try a search like:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {examples.map((text) => (
              <li key={text}>
                <button
                  type="button"
                  onClick={() => fillExample(text)}
                  className="min-h-11 rounded-xl border-2 border-sage bg-cream px-3 py-2 text-left text-[15px] text-ink transition-colors hover:border-accent hover:text-accent-dark"
                >
                  {text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
