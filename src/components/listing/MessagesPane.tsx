import { redirect } from "next/navigation";
import { connection } from "next/server";
import { DirectMessage } from "@/components/listing/DirectMessage";
import { ListingChat } from "@/components/listing/ListingChat";
import { money, shortDate } from "@/lib/format";
import { getStudentListing } from "@/lib/student-listings";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="cm-pane-empty">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

// The right side of Messages: the conversation picked in ?c=
//   group:<listing id>  the group chat for a listing
//   dm:<thread id>      a private thread you're in
//   new:<listing id>    start a private message to that listing's lister
// Signed-in students only. The chat itself talks to Supabase from the browser.
export async function MessagesPane({ c }: { c: string | null }) {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(c ? `/messages?c=${c}` : "/messages")}`);

  const colon = (c ?? "").indexOf(":");
  const kind = colon > 0 ? c!.slice(0, colon) : "";
  const id = colon > 0 ? c!.slice(colon + 1) : "";
  if (!c || !id || !UUID.test(id) || !["group", "dm", "new"].includes(kind)) {
    return <Note title="Pick a conversation">Choose a group or a direct message on the left.</Note>;
  }

  // For a private thread, the listing comes from the thread (RLS: only people in it can see it).
  let listingId = id;
  if (kind === "dm") {
    const supabase = await createClient();
    const row = supabase ? await supabase.from("listing_dms").select("listing_id").eq("id", id).maybeSingle() : null;
    if (!row?.data) return <Note title="We couldn't find this message">It may have been removed.</Note>;
    listingId = row.data.listing_id as string;
  }

  const found = await getStudentListing(listingId);
  if (!found || found.listing.status !== "approved") return <Note title="This listing isn't open">It may have been taken down.</Note>;
  const { listing: l, isOwner } = found;

  // Your first name comes from your account; with none, fall back to the start of your email.
  const guess = (user.email ?? "").split("@")[0].split(/[._\d-]/)[0];
  const myName = user.name ?? (guess ? guess[0].toUpperCase() + guess.slice(1) : "Renter");

  if (kind === "group") {
    return (
      <ListingChat
        key={c}
        listingId={l.id}
        listingTitle={l.title}
        hostName={l.lister.firstName}
        isHost={isOwner}
        userId={user.id}
        defaultName={myName}
      />
    );
  }

  if (kind === "new" && isOwner) return <Note title="That's your own listing">Renters will message you here.</Note>;

  return (
    <DirectMessage
      key={c}
      listingId={l.id}
      listingTitle={l.title}
      listerName={l.lister.firstName}
      isLister={isOwner}
      threadId={isOwner ? id : null}
      userId={user.id}
      myName={myName}
      preview={{
        photo: l.photos[0]?.src ?? null,
        photoAlt: l.photos[0]?.alt ?? l.title,
        line: `${money(l.price)}/mo · ${shortDate(l.availableFrom)} – ${shortDate(l.availableTo)} · ${l.neighborhood}`,
        dates: `${shortDate(l.availableFrom)} to ${shortDate(l.availableTo)}`,
      }}
    />
  );
}
