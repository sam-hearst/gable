import { redirect } from "next/navigation";
import { Suspense } from "react";

// Private messages live in Messages now: the old address sends you there.
async function Go({ id, t }: { id: string; t: string | null }): Promise<never> {
  redirect(t ? `/messages?c=dm:${encodeURIComponent(t)}` : `/messages?c=new:${id}`);
}

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function DirectMessagePage({ params, searchParams }: PageProps<"/sublet/[id]/message">) {
  return (
    <Suspense fallback={null}>
      {Promise.all([params, searchParams]).then(([{ id }, q]) => (
        <Go id={id} t={typeof q.t === "string" ? q.t : null} />
      ))}
    </Suspense>
  );
}
