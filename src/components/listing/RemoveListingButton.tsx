"use client";

import { useState } from "react";
import { removeListing } from "@/app/sublet-your-room/actions";

// "Remove" on one of your own listings, with a confirm step so one tap can't
// delete it.
export function RemoveListingButton({ id, title }: { id: string; title: string }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function remove() {
    if (!window.confirm(`Remove "${title}"? Its photos are deleted too.`)) return;
    setBusy(true);
    setFailed(false);
    const result = await removeListing(id).catch(() => "error" as const);
    setBusy(false);
    if (result !== "ok") setFailed(true);
  }

  return (
    <>
      <button type="button" className="mine-remove" onClick={remove} disabled={busy}>
        {busy ? "Removing…" : "Remove"}
      </button>
      {failed && (
        <span className="list-error" role="alert">
          Couldn&apos;t remove it. Try again.
        </span>
      )}
    </>
  );
}
