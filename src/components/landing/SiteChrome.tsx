import Link from "next/link";
import { isDemo } from "@/lib/mode";
import { AccountLink } from "./AccountLink";

type NavKey = "home" | "summer" | "sublet" | "favorites" | "none";

// Favorites and sign-in are part of the MVP, so only the demo site shows them.
const NAV: { key: NavKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Explore" },
  { key: "summer", href: "/summer", label: "Summer" },
  { key: "sublet", href: "/sublet-your-room", label: "List a room" },
  ...(isDemo ? [{ key: "favorites" as const, href: "/favorites", label: "Favorites" }] : []),
];

function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link className="brand" href="/" style={small ? { fontSize: 18 } : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo/gable-mark.svg" alt="" style={small ? { width: 26, height: 26 } : undefined} />
      Gable
    </Link>
  );
}

export function SiteHeader({
  current,
  cta = "Get early access",
  showVerify = false,
}: {
  current: NavKey;
  cta?: string;
  showVerify?: boolean;
}) {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <nav className="pill-nav" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.key} href={item.href} aria-current={item.key === current ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Brand />
        <div className="top-actions">
          {isDemo && <AccountLink />}
          {showVerify && (
            <Link className="btn btn-secondary btn-sm" href="/verified">
              How we verify
            </Link>
          )}
          <a className="btn btn-sm" href="#join">
            {cta}
          </a>
        </div>
      </div>
    </header>
  );
}

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/verified", label: "How we verify" },
  { href: "/summer", label: "Summer sublets" },
  { href: "/sublet-your-room", label: "Sublet your room" },
];

export function SiteFooter({ current }: { current: string }) {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <Brand small />
        <nav aria-label="Footer">
          {FOOTER_LINKS.filter((l) => l.href !== current).map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <span>Made by Columbia students, for Columbia students. Photos from Pexels.</span>
      </div>
      <div className="footer-word" aria-hidden="true">
        Gable
      </div>
    </footer>
  );
}
