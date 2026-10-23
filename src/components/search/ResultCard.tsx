import { Photo } from "@/components/landing/Photo";
import type { SampleListing } from "@/content/listings";
import { money, shortDate } from "@/lib/format";
import { HeartButton } from "./HeartButton";

const ROOM_LABEL = { "private room": "Private room", studio: "Studio", shared: "Shared room" };

// The one "what we checked" item shown on the photo: the strongest check the
// listing has.
function photoBadge(l: SampleListing) {
  return l.checked.find((c) => c === "Lease on file") ?? l.checked.find((c) => c === "Photos checked") ?? l.checked[0];
}

// The short green line: how fast the lister replies, and the travel time from
// the listing's subway line ("Replies in ~3h · 20 min to Times Sq").
function quickFacts(l: SampleListing) {
  const reply = l.replySpeed.replace(/^Usually replies/, "Replies").replace(/ in (\d+)h$/, " in ~$1h");
  const travel = l.subway.split(", ").pop();
  return [reply, travel && /min|walk/.test(travel) ? travel : null].filter(Boolean).join(" · ");
}

// A search result: photo with one check and the heart, then price, what and
// where, dates, and a short line of facts. For a closest option (no full
// match), `misses` says honestly what's different.
export function ResultCard({ l, misses = [] }: { l: SampleListing; misses?: string[] }) {
  return (
    <article className="result">
      <div className="photo">
        <Photo id={l.photo.id} width={600} alt={l.photo.alt} />
        <span className="badge">
          <span className="dot" />
          {photoBadge(l)}
        </span>
        <HeartButton id={l.id} title={l.title} />
      </div>
      <div className="body">
        <div className="price">
          {money(l.price)}
          <span>/month</span>
        </div>
        <h2 className="kind">
          {ROOM_LABEL[l.roomType]} · {l.neighborhood}
        </h2>
        <div className="when">
          Sublet · {shortDate(l.availableFrom)} – {shortDate(l.availableTo)} · {l.furnished ? "furnished" : "unfurnished"}
        </div>
        <div className="fit">{quickFacts(l)}</div>
        {misses.length > 0 && <div className="misses">Not quite: {misses.join(" · ")}</div>}
      </div>
    </article>
  );
}
