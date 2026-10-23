"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Mail, MessageCircle, Share, Users } from "@/components/landing/icons";
import { trackEvent } from "@/lib/analytics";

const SITE = "https://www.gable.fit";

// The share pitch on /thanks: subletting with a friend. Each signup gets a link
// with their own code (?ref= from the signup), so a friend who joins through it
// is saved with utm_campaign=ref_<code> and we can match the two of them to
// places for two (scripts/referrals.mjs lists the pairs).
export function ShareCard() {
  const raw = useSearchParams().get("ref");
  const code = raw && /^[a-f0-9]{10}$/.test(raw) ? raw : null;
  const link = `${SITE}/?utm_source=referral&utm_medium=share&utm_campaign=${code ? `ref_${code}` : "thanks"}`;
  const message = `I'm looking for a sublet near Columbia on Gable, where every listing is checked. Want to find a place together? ${link}`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    track("copy");
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the link is still selectable in the box.
    }
  }

  // The phone's own share sheet, where there is one; otherwise copy the link.
  async function shareSheet() {
    if (typeof navigator.share !== "function") return copy();
    track("native");
    try {
      await navigator.share({ title: "Gable", text: message });
    } catch {
      // Closing the share sheet throws; nothing to do.
    }
  }

  function track(method: string) {
    trackEvent("share", { method, content_type: "referral_link" });
  }

  return (
    <div className="callout share-card">
      <span className="share-icon">
        <Users size={22} />
      </span>
      <h3>Subletting with a friend?</h3>
      <p>
        Send them your link. When they join, we&apos;ll match the two of you to sublets that work for two: your dates, two
        beds or two rooms, one search.
      </p>

      <div className="share-link">
        <label htmlFor="share-link" className="sr-only">
          Your share link
        </label>
        <input id="share-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
        <button className="btn btn-sm" type="button" onClick={copy}>
          <Copy size={16} />
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <div className="share-row">
        <a className="btn btn-secondary btn-sm" href={`sms:?&body=${encodeURIComponent(message)}`} onClick={() => track("sms")}>
          <MessageCircle size={16} />
          Text
        </a>
        <a
          className="btn btn-secondary btn-sm"
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp")}
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
        <a
          className="btn btn-secondary btn-sm"
          href={`mailto:?subject=${encodeURIComponent("Want to find a sublet together?")}&body=${encodeURIComponent(message)}`}
          onClick={() => track("email")}
        >
          <Mail size={16} />
          Email
        </a>
        <button className="btn btn-secondary btn-sm" type="button" onClick={shareSheet}>
          <Share size={16} />
          More
        </button>
      </div>

      <p className="share-fine">Your link only tells us a friend came from you. We never show them your email.</p>
    </div>
  );
}
