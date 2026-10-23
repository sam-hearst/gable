import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ShareCard } from "./ShareCard";
import { SignupTracker } from "./SignupTracker";

export const metadata: Metadata = {
  title: "You're on the list · Gable",
  robots: { index: false },
};

export default function ThanksPage() {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <span />
          <Link className="brand" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/gable-mark.svg" alt="" />
            Gable
          </Link>
          <span />
        </div>
      </header>
      <main>
        <section className="hero" style={{ paddingTop: 80 }}>
          <div className="wrap narrow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/gable-mark.svg" alt="" width={72} height={72} style={{ margin: "0 auto" }} />
            <h1 style={{ marginTop: 20 }}>You&apos;re on the list.</h1>
            <p className="sub">Thanks for trusting us with this. We&apos;ll email you as soon as we have verified matches. No spam, ever.</p>
            <Suspense>
              <ShareCard />
            </Suspense>
            <p style={{ marginTop: 24 }}>
              <Link className="btn btn-secondary" href="/">
                Back to Gable
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Suspense>
        <SignupTracker />
      </Suspense>
    </>
  );
}
