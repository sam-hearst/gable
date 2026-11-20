import { money, shortDate } from "@/lib/format";
import type { ExternalListing } from "@/lib/external-listing-fields";

const ROOM_LABEL = { "private room": "Private room", studio: "Studio", shared: "Shared room" };

// A link card: a sublet someone found on another site. Same layout as a
// Gable result so it's easy to compare, but it says plainly where it's from
// and that we didn't check it, and its button opens the original listing on
// that site in a new tab. The photo is the page's own preview image, loaded
// from its site (never copied to ours).
export function ExternalCard({ l }: { l: ExternalListing }) {
  return (
    <article className="result result-external">
      <div className="photo">
        {l.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={l.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <div className="photo-none" aria-hidden="true">
            {l.source}
          </div>
        )}
        <span className="badge badge-external">
          <span className="dot" />
          On {l.source}
        </span>
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
        <div className="external-title">{l.title}</div>
        <div className="external-note">
          {l.sample ? "Sample card for the demo" : `Shared ${shortDate(l.addedOn)}`} · not checked by Gable
        </div>
        <a
          className="btn btn-sm btn-secondary"
          href={l.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          style={{ marginTop: 12, alignSelf: "flex-start" }}
        >
          View on {l.source} ↗
        </a>
      </div>
    </article>
  );
}
