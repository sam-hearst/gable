import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./landing.css";
import { isDemo } from "@/lib/mode";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Gable's GA4 property (from Sam's #3). Production builds use it by default, so
// the tag doesn't depend on a Vercel env var; local dev stays untracked unless
// NEXT_PUBLIC_GA_ID is set.
const GABLE_GA_ID = "G-5MEBWDE6BD";
// The demo site (staging) stays untracked so demo clicks don't count as visits.
const gaId = isDemo
  ? undefined
  : process.env.NEXT_PUBLIC_GA_ID || (process.env.NODE_ENV === "production" ? GABLE_GA_ID : undefined);

export const metadata: Metadata = {
  title: "Gable",
  description:
    "Tell Gable what you need and get sublets near Columbia where every listing is checked.",
  icons: { icon: "/logo/gable-favicon.svg" },
  // Keep the demo site out of search results.
  ...(isDemo ? { robots: { index: false, follow: false } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <head>
        {gaId && (
          // Defines gtag before hydration so events fired on load (like
          // sign_up on /thanks) queue up behind the config call.
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        {gaId && (
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
