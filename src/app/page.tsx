import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { home } from "@/content/pages";

export const metadata: Metadata = {
  title: home.metaTitle,
  description: home.metaDescription,
};

export default function Home() {
  return <HomePage />;
}
