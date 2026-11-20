import Link from "next/link";

// Shown on /search (production only) to visitors who aren't signed in: their
// question, and a card asking them to create an account before we show
// matches. The sign-up page sends them back to the same search afterward.
export function SignupGate({ messages }: { messages: string[] }) {
  const params = new URLSearchParams();
  messages.forEach((m) => params.append("q", m));
  const next = encodeURIComponent(`/search${messages.length ? `?${params.toString()}` : ""}`);
  const question = messages[messages.length - 1];

  return (
    <div className="search-gate">
      {question && <p className="search-gate-q">{question}</p>}
      <h2>Sign up to see your matches</h2>
      <p>Create a free account and we&apos;ll show the sublets that fit what you asked for.</p>
      <Link className="btn" href={`/signin?mode=signup&from=search&next=${next}`}>
        Sign up
      </Link>
      <Link className="search-gate-login" href={`/signin?from=search&next=${next}`}>
        Already have an account? Log in
      </Link>
    </div>
  );
}
