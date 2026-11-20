import { redirect } from "next/navigation";
import { Suspense } from "react";

// Group chats live in Messages now: the old address sends you there.
async function Go({ id }: { id: string }): Promise<never> {
  redirect(`/messages?c=group:${id}`);
}

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function ListingChatPage({ params }: PageProps<"/sublet/[id]/chat">) {
  return <Suspense fallback={null}>{params.then(({ id }) => <Go id={id} />)}</Suspense>;
}
