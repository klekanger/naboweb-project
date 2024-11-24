import MessagePage from "@/components/pages/messageBoard/MessagePage";
import { generateStaticSlugs } from "@/sanity/loader/generateStaticSlugs";
import { loadMessageById } from "@/sanity/loader/loadQuery";
import { notFound } from "next/navigation";

type MessagePageParams = {
  params: { id: string };
};

export async function generateStaticParams() {
  return await generateStaticSlugs("message");
}

export default async function MessagePageIdRoute({
  params,
}: MessagePageParams) {
  const initial = await loadMessageById(params?.id);

  if (!initial.data) {
    notFound();
  }

  return <MessagePage data={initial.data} />;
}

// TODO make sanity preview page for visual editing
