import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { findLandingPage } from "@/content/pages";

const content = findLandingPage("interns")!;

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function Page() {
  return <LandingPage content={content} />;
}
