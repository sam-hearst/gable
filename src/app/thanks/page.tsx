import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { SignupTracker } from "./SignupTracker";

export const metadata: Metadata = {
  title: "Gable · You're on the list",
  robots: { index: false },
};

export default function Thanks() {
  return (
    <main className="mx-auto flex w-full max-w-[880px] flex-1 flex-col justify-center px-5 py-16">
      <Suspense>
        <SignupTracker />
      </Suspense>
      <Image src="/logo/gable-mark.svg" alt="" width={56} height={56} />
      <h1 className="mt-6 text-[2.25rem] sm:text-5xl">You’re on the list.</h1>
      <p className="mt-4 max-w-[60ch] text-ink-faint">
        Gable is opening in New York soon. When it does, we’ll email you places
        that fit what you told us, with why each one fits and what we checked.
      </p>
    </main>
  );
}
