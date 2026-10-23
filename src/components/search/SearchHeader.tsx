import Link from "next/link";
import { AccountAvatar } from "./AccountAvatar";

// The /search header: logo on the left; the "Sample listings" label and the
// account avatar on the right. Only /search uses it, so the shared site header
// on the other pages is unchanged.
export function SearchHeader() {
  return (
    <header className="search-topbar">
      <div className="search-wrap search-topbar-inner">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/gable-mark.svg" alt="" />
          Gable
        </Link>
        <div className="search-topbar-right">
          <span className="sample-pill">Sample listings</span>
          <AccountAvatar />
        </div>
      </div>
    </header>
  );
}
