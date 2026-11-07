import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { BrowseSection, HomeHero } from "@/components/landing/HomeSections";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { CtaPhoto } from "@/components/landing/blocks";
import { isDemo } from "@/lib/mode";

export const metadata: Metadata = {
  title: "Gable: real sublets near Columbia, through one chat",
  description:
    "Tell Gable what you need and get sublets near Columbia where every listing is checked and every lister is a verified tenant.",
};

function HomeBody() {
  return (
    <main>
      <HomeHero />
      <BrowseSection />
      {/* Email sign-up at the bottom, on both the demo and the waitlist site. */}
      <CtaPhoto
        photo={30775151}
        source="home"
        title="Be first in when Gable opens."
        body="We're opening to Columbia students first. Leave your email and we'll send your first verified sublets."
        button="Get early access"
        fine="No spam. One email when your matches are ready."
      />
    </main>
  );
}

// On the demo site the homepage has the same sidebar as the app (its items ask
// you to log in first), so signing in doesn't feel like a different site.
// Signed-in visitors are sent to /explore by src/proxy.ts. The waitlist site
// keeps the plain header and footer.
export default function Home() {
  if (isDemo) {
    return (
      <AppShell current="explore">
        <HomeBody />
      </AppShell>
    );
  }
  return (
    <>
      <SiteHeader current="home" showVerify />
      <HomeBody />
      <SiteFooter />
    </>
  );
}
