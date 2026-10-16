import type { ExampleMatch, LandingContent } from "@/content/pages";
import { Icon } from "./Icon";
import { Footer, Header } from "./PageChrome";
import { SearchDemo } from "./SearchDemo";
import { SignupForm } from "./SignupForm";

// One template for every landing page. Per the class rules a landing page has
// one job: no nav bar, no "learn more," one action (the form).
export function LandingPage({ content }: { content: LandingContent }) {
  const page = content.slug;

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-[1080px] items-start gap-10 px-5 py-10 sm:py-14 lg:grid-cols-[1fr_460px]">
          <div>
            <p className="text-[15px] font-medium text-accent-dark">
              {content.eyebrow}
            </p>
            <h1 className="mt-3 text-[2.25rem] sm:text-5xl">{content.headline}</h1>
            <p className="mt-5 max-w-[60ch] text-ink-faint">{content.subhead}</p>
            <div className="mt-8">
              <SignupForm page={page} examples={content.examples} />
            </div>
          </div>
          <SearchDemo demo={content.demo} />
        </section>

        {/* Pain, in real people's words */}
        <section className="bg-sage py-10 sm:py-16">
          <div className="mx-auto w-full max-w-[1080px] px-5">
            <h2 className="text-2xl sm:text-3xl">{content.painHeading}</h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {content.quotes.map((quote) => (
                <li key={quote.text} className="flex flex-col rounded-2xl bg-cream p-6">
                  <blockquote className="flex-1 text-lg font-medium">
                    “{quote.text}”
                  </blockquote>
                  <a
                    href={quote.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-[15px] text-accent-dark underline"
                  >
                    {quote.source}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[15px] text-ink-faint">
              From our research: 68 posts across six NYC and student subreddits,
              plus five interviews with people searching in New York.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-[1080px] px-5 py-10 sm:py-16">
          <h2 className="text-2xl sm:text-3xl">{content.stepsHeading}</h2>
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_400px]">
            <ol className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
              {content.steps.map((step) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sage text-accent">
                    <Icon name={step.icon} />
                  </span>
                  <div>
                    <h3 className="text-lg">{step.title}</h3>
                    <p className="mt-1 text-ink-faint">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <MatchCard match={content.example} />
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-sage py-10 sm:py-16">
          <div className="mx-auto w-full max-w-[880px] px-5">
            <h2 className="text-2xl sm:text-3xl">{content.closingHeadline}</h2>
            <p className="mt-3 max-w-[60ch] text-ink-faint">{content.closingBody}</p>
            <div className="mt-8">
              <SignupForm page={page} onSage />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function MatchCard({ match }: { match: ExampleMatch }) {
  return (
    <figure className="rounded-2xl bg-warm p-6">
      <figcaption className="text-[13px] font-bold uppercase tracking-wide text-ink-faint">
        Example match
      </figcaption>
      <h3 className="mt-3 text-xl">{match.title}</h3>
      <p className="mt-1 text-ink-faint">{match.meta}</p>
      <p className="mt-4">
        <span className="font-bold">Why it fits: </span>
        {match.whyItFits}
      </p>
      <p className="mt-4 font-bold">What we checked</p>
      <ul className="mt-2 space-y-2">
        {match.checks.map((check) => (
          <li key={check.label} className="flex items-start gap-2">
            <Icon
              name={check.ok ? "tick" : "dash"}
              className={`mt-1 size-4 shrink-0 ${check.ok ? "text-accent-dark" : "text-ink-faint"}`}
            />
            <span className={check.ok ? "" : "text-ink-faint"}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
