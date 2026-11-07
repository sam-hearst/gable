import Link from "next/link";
import { isDemo } from "@/lib/mode";
import { AccountLink } from "./AccountLink";

// "current" is kept so pages can still say where they are, but the header no
// longer has tab links: the logo goes home, and Favorites shows once you're
// signed in (see AccountLink).
type NavKey = "home" | "summer" | "favorites" | "none";

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
    // Logo at the far left, account at the far right, like most sites people know.
    <header className="topbar" data-current={current}>
      <div className="topbar-inner">
        <Brand />
        {/* The demo site is the working product, so it has no waitlist buttons. */}
        <div className="top-actions">
          {isDemo && <AccountLink />}
          {!isDemo && showVerify && (
            <Link className="btn btn-secondary btn-sm" href="/verified">
              How we verify
            </Link>
          )}
          {!isDemo && (
            <a className="btn btn-sm" href="#join">
              {cta}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

// One centered line, plus the privacy policy (Google sign-in needs it linked).
export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>Made by Columbia students, for Columbia students. Photos from Pexels.</span>
        <Link href="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}
