import MessagePage from "@/components/pages/messageBoard/MessagePage";
import { generateStaticIdPages } from "@/sanity/loader/generateStaticSlugs";
import { loadMessageById } from "@/sanity/loader/loadQuery";
import { notFound } from "next/navigation";

type MessagePageParams = {
  params: { id: string };
};

export async function generateStaticParams() {
  const messages = await generateStaticIdPages("message");

  return messages.map((message) => ({
    id: message._id,
  }));
}

export default async function MessagePageIdRoute({
  params,
}: MessagePageParams) {
  const initial = await loadMessageById(params.id);

  if (!initial.data) {
    notFound();
  }

  return <MessagePage data={initial.data} />;
}

// No need for a sanity preview page for visual editing,
// as we're using our own editor for editing message board messages
