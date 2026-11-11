import Link from "next/link";
import type { ReactNode } from "react";

// A peek at a listing's group chat: who's in it, the last few things students
// said, and the button to join. Shown on every listing so people can see the
// conversation before they decide to join it.

export type PreviewMessage = { name: string; host?: boolean; body: string; time?: string };

export function ChatPreview({
  count,
  messages,
  href,
  joinLabel,
  hostName,
  hint,
  actions,
}: {
  count: number | null;
  messages: PreviewMessage[];
  href: string;
  joinLabel: string;
  hostName: string;
  hint?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="gp" aria-label="Group chat">
      <div className="gp-top">
        <div>
          <h2>Group chat</h2>
          <p>
            {hostName} (host) and {count ? `${count} student${count === 1 ? "" : "s"}` : "students"} interested in this room
          </p>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="gp-peek" aria-label="Recent messages">
          {messages.map((m, i) => (
            <div key={i} className="gp-msg">
              <b>
                {m.name}
                {m.host && <span className="gp-badge">Host</span>}
              </b>
              <p>{m.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="gp-actions">
        <Link className="btn" href={href}>
          {joinLabel}
        </Link>
        {actions}
      </div>
      {hint && <p className="gp-hint">{hint}</p>}
    </section>
  );
}
