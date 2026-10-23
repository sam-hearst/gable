import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { SignInForm } from "@/components/search/SignInForm";
import { isListingId } from "@/lib/favorites";
import { supabaseConfigured } from "@/lib/supabase/config";
import "./signin.css";

export const metadata: Metadata = {
  title: "Sign in | Gable",
  description: "Sign in or create an account to save places and see them on a map.",
};

// Only send people back to a page on this site.
function safeNext(value: string | string[] | undefined) {
  const ok = typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/signin");
  return ok ? value : "/favorites";
}

async function Form({ searchParams }: { searchParams: PageProps<"/signin">["searchParams"] }) {
  const params = await searchParams;
  const save = isListingId(params.save) ? params.save : null;
  return (
    <SignInForm
      next={safeNext(params.next)}
      save={save}
      configured={supabaseConfigured}
      linkFailed={params.error === "link"}
    />
  );
}

export default function SignIn({ searchParams }: PageProps<"/signin">) {
  return (
    <>
      <SiteHeader current="none" />
      <main>
        <section className="section">
          <div className="wrap signin-wrap">
            <Suspense fallback={null}>
              <Form searchParams={searchParams} />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter current="/signin" />
    </>
  );
}
