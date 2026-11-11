import Link from "next/link";
import { ChatPreview } from "@/components/listing/ChatPreview";

// DESIGN MOCKUP (sample data, nothing saved): a listing's group chat peek on
// the sample listing. It shows a few things students said, so people can see
// the conversation and want to join it.

const SAMPLE = [
  { name: "Amara", body: "Are utilities included in the $1,250?" },
  { name: "Daniel", host: true, body: "Yes, utilities are included. Wifi too." },
  { name: "Jordan", body: "I sublet this room last summer. The photos are accurate and Daniel was easy to work with." },
];

export function ListingCommunity({ interested = 12, lister = "Daniel" }: { interested?: number; lister?: string }) {
  return (
    <ChatPreview
      count={interested}
      messages={SAMPLE}
      href="/messages?chat=w118"
      joinLabel="Join the group chat"
      hostName={lister}
      hint="Ask questions together. Share your address or payment details only in a private message."
      actions={
        <Link className="btn btn-secondary" href="/messages?chat=dm-daniel">
          Message {lister}
        </Link>
      }
    />
  );
}
