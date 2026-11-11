import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";

export const metadata: Metadata = {
  title: "Privacy policy | Gable",
  description: "What Gable collects, why, who helps us run it, and how to have your data deleted.",
};

const CONTACT = "gable.nyc.team@gmail.com";
const UPDATED = "November 7, 2026";

// Plain-language privacy policy. Public on both the waitlist and demo sites,
// and linked from the footer and the sign-in page.
// Keep it true: when the app starts collecting something new, add it here.
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "What we collect",
    body: (
      <ul>
        <li>
          <b>Waitlist:</b> your email, what you said you&apos;re looking for, and which page you signed up from.
        </li>
        <li>
          <b>Account:</b> your first name, email and password.
        </li>
        <li>
          <b>Favorites:</b> the places you save.
        </li>
        <li>
          <b>Your room&apos;s exact address:</b> if you list a room, we save the address you pick so we can check it
          against your lease. Only you and our team can see it. Students see the street, not the building number.
        </li>
        <li>
          <b>Group chats:</b> the first name you choose, and the messages you send in a listing&apos;s group chat. Only
          the students in that chat and the lister can read them, though signed-in students can see the last three
          messages and first names on the listing before they join. The lister can remove people, delete messages and end
          the chat.
        </li>
        <li>
          <b>Searches:</b> what you type or say in the chat box, so we can show sublets that fit.
        </li>
        <li>
          <b>Usage:</b> on gable.fit we use Google Analytics to see which pages people visit. It uses cookies.
        </li>
      </ul>
    ),
  },
  {
    title: "How we use it",
    body: (
      <p>
        To run Gable: show you sublets, save your favorites, keep you signed in, and email you about Gable if you joined
        the waitlist. We don&apos;t sell your data, and we don&apos;t share it for ads.
      </p>
    ),
  },
  {
    title: "Who helps us run Gable",
    body: (
      <ul>
        <li>
          <b>Supabase</b> stores accounts, favorites and waitlist emails.
        </li>
        <li>
          <b>Google Places and NYC Planning Labs (NYC GeoSearch)</b> suggest addresses as you type a street on List your
          room. Your browser sends them what you type, and nothing else about you.
        </li>
        <li>
          <b>Vercel</b> hosts the site.
        </li>
        <li>
          <b>Anthropic</b> (Claude) reads your search so we understand what you&apos;re asking for.
        </li>
        <li>
          <b>Google</b> runs Google Analytics.
        </li>
        <li>
          <b>Your browser</b> turns speech into text when you use the mic. Chrome and Safari may send that audio to Google
          or Apple to do it. We only get the text.
        </li>
      </ul>
    ),
  },
  {
    title: "Deleting your data",
    body: (
      <p>
        Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> from the address you used, and we&apos;ll delete your account,
        favorites and waitlist signup within 30 days.
      </p>
    ),
  },
  {
    title: "Changes and questions",
    body: (
      <p>
        If we change this policy, we&apos;ll update the date at the top. Questions? Email{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader current="none" />
      <main className="flex-1">
        <article className="privacy mx-auto w-full max-w-[720px] px-5 py-10 sm:py-14">
          <h1 className="text-[2.25rem] sm:text-5xl">Privacy policy</h1>
          <p className="mt-3 text-ink-faint">Last updated {UPDATED}</p>
          <p className="mt-6">
            Gable is a sublet search made by Columbia students. This page says what we collect when you use it, and what we
            do with it.
          </p>
          {SECTIONS.map((s) => (
            <section key={s.title} className="mt-10">
              <h2 className="text-2xl">{s.title}</h2>
              <div className="mt-3">{s.body}</div>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
