import { CircleCheck } from "@/components/landing/icons";
import { Photo } from "@/components/landing/Photo";
import type { SampleListing } from "@/content/listings";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2027-06-01" -> "Jun 1". Parsed by hand so the server's time zone can't
// shift the day.
function shortDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

const ROOM_LABEL = { "private room": "Private room", studio: "Studio", shared: "Shared room" };

// A search result: photo first, then what we checked. For a closest option
// (no full match), `misses` says honestly what's different.
export function ResultCard({ l, misses = [] }: { l: SampleListing; misses?: string[] }) {
  return (
    <article className="result">
      <div className="photo">
        <Photo id={l.photo.id} width={600} alt={l.photo.alt} />
        <span className="badge">
          <span className="dot" />
          {shortDate(l.availableFrom)} – {shortDate(l.availableTo)}
        </span>
      </div>
      <div className="body">
        <div className="price">
          ${l.price.toLocaleString("en-US")} <span>/ month</span>
        </div>
        <h2>{l.title}</h2>
        <div className="where">
          {l.neighborhood} · {l.crossStreets}
        </div>
        <div className="meta">
          {ROOM_LABEL[l.roomType]} · {l.furnished ? "Furnished" : "Unfurnished"} · {l.subway}
        </div>
        {misses.length > 0 && (
          <div className="misses">
            <b>What&apos;s different</b>
            {misses.join(" · ")}
          </div>
        )}
        <p className="good-for">{l.goodFor}</p>
        <div className="checked">
          <div className="k">What we checked</div>
          <ul>
            {l.checked.map((c) => (
              <li key={c}>
                <CircleCheck size={15} />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="src">
          Listed by {l.lister.firstName}, {l.lister.school} · {l.replySpeed}
        </div>
      </div>
    </article>
  );
}
