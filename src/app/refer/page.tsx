import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { referralCode } from "@/lib/referral";
import { getCurrentUser } from "@/lib/supabase/server";
import { ShareCard } from "../thanks/ShareCard";

export const metadata: Metadata = {
  title: "Refer a friend | Gable",
  description: "Send a friend your Gable link and look for a sublet together.",
};

// Your personal share link, the same kind /thanks gives waitlist signups
// (made from your email, so `npm run referrals` can match who brought whom).
async function YourLink() {
  await connection();
  const user = await getCurrentUser();
  if (!user?.email) redirect("/signin?next=/refer");
  return <ShareCard code={referralCode(user.email)} />;
}

export default function ReferPage() {
  return (
    <AppShell current="refer">
      <main className="section">
        <div className="wrap" style={{ maxWidth: 640 }}>
          <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", marginBottom: 20 }}>Refer a friend</h1>
          <Suspense fallback={<p className="fine">Loading your link…</p>}>
            <YourLink />
          </Suspense>
        </div>
      </main>
    </AppShell>
  );
}
