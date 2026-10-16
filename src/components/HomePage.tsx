import { home } from "@/content/pages";
import { HowItWorks } from "./HowItWorks";
import { Footer, Header } from "./PageChrome";
import { SearchDemo } from "./SearchDemo";
import { SignupForm } from "./SignupForm";

export function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-[1080px] items-start gap-10 px-5 py-10 sm:py-14 lg:grid-cols-[1fr_460px]">
          <div>
            <p className="text-[15px] font-medium text-accent-dark">{home.eyebrow}</p>
            <h1 className="mt-3 text-[2.25rem] sm:text-5xl">{home.headline}</h1>
            <p className="mt-5 max-w-[60ch] text-ink-faint">{home.subhead}</p>
            <div className="mt-8">
              <SignupForm page="home" examples={home.examples} />
            </div>
          </div>
          <SearchDemo demo={home.demo} />
        </section>

        <HowItWorks />

        <section className="bg-sage py-10 sm:py-16">
          <div className="mx-auto w-full max-w-[880px] px-5">
            <h2 className="text-2xl sm:text-3xl">{home.closingHeadline}</h2>
            <p className="mt-3 max-w-[60ch] text-ink-faint">{home.closingBody}</p>
            <div className="mt-8">
              <SignupForm page="home" onSage />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
