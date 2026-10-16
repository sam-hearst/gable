import Image from "next/image";
import type { Listing, SearchDemo as Demo } from "@/content/pages";
import { Icon } from "./Icon";

// A static example of a Gable search: what the person typed, Gable's reply,
// and the places it picked. Labeled "Example" because there are no live
// listings yet.
export function SearchDemo({ demo }: { demo: Demo }) {
  return (
    <figure
      aria-label="Example of a Gable search"
      className="w-full rounded-2xl bg-sage p-3 sm:p-4"
    >
      <div className="flex items-center justify-between px-1 pb-3">
        <span className="flex items-center gap-2 font-bold">
          <Image src="/logo/gable-mark.svg" alt="" width={24} height={24} />
          Gable
        </span>
        <span className="rounded-lg bg-cream px-2 py-1 text-[13px] font-medium text-ink-faint">
          Example search
        </span>
      </div>

      <div className="space-y-3 rounded-xl bg-cream p-3 sm:p-4">
        <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[15px] text-cream">
          {demo.query}
        </p>
        <div className="flex items-start gap-2">
          <Image
            src="/logo/gable-mark.svg"
            alt=""
            width={28}
            height={28}
            className="mt-0.5 shrink-0"
          />
          <p className="rounded-2xl rounded-tl-md bg-sage px-4 py-2.5 text-[15px]">
            {demo.reply}
          </p>
        </div>
        <ul className="space-y-3 pt-1">
          {demo.listings.map((listing) => (
            <ListingCard key={listing.title} listing={listing} />
          ))}
        </ul>
      </div>
    </figure>
  );
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <li className="flex gap-3 rounded-xl bg-sage/60 p-2">
      <div className="relative aspect-[4/3] w-28 shrink-0 self-start overflow-hidden rounded-lg sm:w-32">
        <Image
          src={listing.photo.src}
          alt={listing.photo.alt}
          fill
          sizes="128px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 py-0.5">
        <p className="text-[15px] leading-snug">
          <span className="font-bold">{listing.price}</span>
          <span className="text-ink-faint"> · {listing.title}</span>
        </p>
        <p className="text-[13px] leading-snug text-ink-faint">{listing.facts}</p>
        <p className="mt-1 flex items-start gap-1 text-[13px] leading-snug text-accent-dark">
          <Icon name="tick" className="mt-px size-3.5 shrink-0" />
          <span>{listing.why}</span>
        </p>
        <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-warm px-1.5 py-0.5 text-[12px] font-medium">
          <span className="size-1.5 rounded-full bg-sun" aria-hidden="true" />
          {listing.checked}
        </p>
      </div>
    </li>
  );
}
