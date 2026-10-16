import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
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
            <div className="callout" style={{ margin: "40px auto 0", maxWidth: 560, textAlign: "left" }}>
              <h3>Know someone else looking?</h3>
              <p>
                Most students find housing through friends. Send Gable to a classmate who&apos;s hunting for a sublet, or who has a
                room to fill.
              </p>
              <p style={{ marginTop: 16 }}>
                <Link className="btn btn-secondary" href="/">
                  Back to Gable
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Suspense>
        <SignupTracker />
      </Suspense>
    </>
  );
}
