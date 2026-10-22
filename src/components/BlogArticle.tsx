import Link from "next/link";
import type { ReactNode } from "react";
import type { Block, BlogPost, Inline } from "@/content/blog";
import { CtaPhoto } from "./landing/blocks";
import { Photo } from "./landing/Photo";
import { SiteFooter, SiteHeader } from "./landing/SiteChrome";

// Template for a blog post, in the landing pages' header and footer. Unlike a
// landing page, a post links out: that's what makes it worth reading. It still
// ends with one action, the waitlist (saved with source "blog").
export function BlogArticle({ post }: { post: BlogPost }) {
  const published = new Date(`${post.published}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const sections = post.body.filter(
    (block): block is Extract<Block, { type: "h2" }> => block.type === "h2",
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.published,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "Gable" },
  };

  return (
    <>
      <SiteHeader current="none" />

      <main className="flex-1">
        <article className="mx-auto w-full max-w-[720px] px-5 py-10 sm:py-14">
          <p className="text-[15px] font-medium text-accent-dark">Gable guides</p>
          <h1 className="mt-3 text-[2.25rem] sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-[15px] text-ink-faint">
            By {post.author} · <time dateTime={post.published}>{published}</time> ·{" "}
            {post.readMinutes} min read
          </p>

          <figure className="mt-8">
            <Photo
              id={post.hero.id}
              width={1200}
              alt={post.hero.alt}
              className="aspect-[3/2] w-full rounded-2xl object-cover"
            />
            <figcaption className="mt-2 text-[15px] text-ink-faint">
              Photo by{" "}
              <a
                href={post.hero.pexelsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {post.hero.photographer} on Pexels
              </a>
            </figcaption>
          </figure>

          <div className="mt-8 space-y-5 text-lg">
            {post.intro.map((paragraph, i) => (
              <p key={i}>{renderInline(paragraph)}</p>
            ))}
          </div>

          <nav aria-label="In this guide" className="mt-10 rounded-2xl bg-sage p-6">
            <p className="font-bold">In this guide</p>
            <ol className="mt-3 space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-accent-dark underline">
                    {section.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-4">
            {post.body.map((block, i) => (
              <BlockView key={i} block={block} />
            ))}
          </div>

          <aside className="mt-12 border-t border-ink-faint/30 pt-6">
            <p className="font-bold">About the author</p>
            <p className="mt-2 text-ink-faint">{post.authorBio}</p>
          </aside>
        </article>

        <CtaPhoto
          photo={post.ctaPhoto}
          source="blog"
          title={post.closingHeadline}
          body={post.closingBody}
          button="Get early access"
          fine="No spam. We’ll only email you about Gable."
        />
      </main>

      <SiteFooter current={`/blog/${post.slug}`} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 id={block.id} className="mt-12 scroll-mt-6 text-2xl sm:text-3xl">
          {block.text}
        </h2>
      );
    case "p":
      return <p className="mt-5">{renderInline(block.text)}</p>;
    case "ul":
      return (
        <ul className="mt-5 list-disc space-y-3 pl-6 marker:text-accent">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-5 list-decimal space-y-3 pl-6 marker:font-bold marker:text-accent">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <figure className="mt-6 rounded-2xl bg-sage p-6">
          <blockquote className="text-lg font-medium">“{block.text}”</blockquote>
          <figcaption className="mt-3 text-[15px]">
            <a
              href={block.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-dark underline"
            >
              {block.source}
            </a>
          </figcaption>
        </figure>
      );
    case "next":
      return (
        <aside className="mt-6 rounded-2xl bg-warm p-6">
          <p>{block.text}</p>
          <Link
            href={block.href}
            className="mt-4 inline-flex min-h-11 items-center rounded-xl border-2 border-accent bg-cream px-5 font-bold text-accent-dark transition-colors hover:bg-sage"
          >
            {block.label}
          </Link>
        </aside>
      );
  }
}

// Strings can mark bold runs with **double asterisks**; links are objects.
function renderInline(parts: Inline[]): ReactNode[] {
  return parts.map((part, i) => {
    if (typeof part !== "string") {
      return (
        <a
          key={i}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-dark underline"
        >
          {part.text}
        </a>
      );
    }
    return part.split("**").map((run, j) =>
      j % 2 === 1 ? <strong key={`${i}-${j}`}>{run}</strong> : run,
    );
  });
}
