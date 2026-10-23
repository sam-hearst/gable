import type { Metadata } from "next";
import { BlogArticle } from "@/components/BlogArticle";
import { findBlogPost } from "@/content/blog";

const post = findBlogPost("how-to-find-your-dream-sublet-in-nyc")!;

export const metadata: Metadata = {
  title: `${post.title} · Gable`,
  description: post.metaDescription,
  openGraph: {
    type: "article",
    title: post.title,
    description: post.metaDescription,
    publishedTime: post.published,
    authors: [post.author],
  },
};

export default function Page() {
  return <BlogArticle post={post} />;
}
