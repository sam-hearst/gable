import Image from "next/image";
import { allPhotos, home } from "@/content/pages";
import { Icon } from "./Icon";

type Step = { title: string; body: string };

// "How Gable works" as four small pictures of the product, not paragraphs.
export function HowItWorks() {
  const { how } = home;
  const [living, brownstone] = allPhotos;

  return (
    <section className="mx-auto w-full max-w-[1080px] px-5 py-10 sm:py-16">
      <h2 className="text-2xl sm:text-3xl">{how.heading}</h2>
      <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Panel n={1} step={how.describe}>
          <div className="rounded-xl bg-cream p-3 text-[14px] leading-snug">
            Quiet 1-bedroom, laundry in unit, near the 7 train, under $2,900
            <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-accent" />
          </div>
          <div className="mt-2 flex justify-end">
            <span className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-bold text-cream">
              Search
            </span>
          </div>
        </Panel>

        <Panel n={2} step={how.picked}>
          {[
            { photo: living, line: "$2,850 · 1 bd · Sunnyside", why: "Laundry in unit · 3 min to the 7" },
            { photo: brownstone, line: "$2,700 · 1 bd · Woodside", why: "Quiet block · 5 min to the 7" },
          ].map((row) => (
            <div key={row.line} className="mb-2 flex gap-2 rounded-lg bg-cream p-1.5 last:mb-0">
              <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md">
                <Image src={row.photo.src} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 text-[12px] leading-snug">
                <p className="font-bold">{row.line}</p>
                <p className="text-accent-dark">{row.why}</p>
              </div>
            </div>
          ))}
        </Panel>

        <Panel n={3} step={how.refine}>
          <p className="ml-auto w-fit max-w-[90%] rounded-xl rounded-br-sm bg-accent px-3 py-1.5 text-[13px] text-cream">
            Cheaper, and it has to allow cats
          </p>
          <p className="mt-2 w-fit max-w-[90%] rounded-xl rounded-tl-sm bg-cream px-3 py-1.5 text-[13px]">
            Done. 4 places under $2,600 that allow cats.
          </p>
        </Panel>

        <Panel n={4} step={how.checked}>
          <ul className="space-y-1.5 rounded-xl bg-cream p-3 text-[13px] leading-snug">
            {[
              ["Lister’s identity confirmed", true],
              ["Photos not found elsewhere", true],
              ["Building record checked", true],
              ["Lease holder not confirmed yet", false],
            ].map(([label, ok]) => (
              <li key={String(label)} className="flex items-start gap-1.5">
                <Icon
                  name={ok ? "tick" : "dash"}
                  className={`mt-0.5 size-3.5 shrink-0 ${ok ? "text-accent-dark" : "text-ink-faint"}`}
                />
                <span className={ok ? "" : "text-ink-faint"}>{label}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </ol>
    </section>
  );
}

function Panel({
  n,
  step,
  children,
}: {
  n: number;
  step: Step;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col">
      <div aria-hidden="true" className="flex h-44 flex-col justify-center rounded-2xl bg-sage p-3">
        {children}
      </div>
      <h3 className="mt-4 text-lg">
        <span className="text-accent">{n}.</span> {step.title}
      </h3>
      <p className="mt-1 text-ink-faint">{step.body}</p>
    </li>
  );
}
