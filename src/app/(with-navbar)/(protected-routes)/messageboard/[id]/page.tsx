import MessagePage from "@/components/pages/messageBoard/MessagePage";
import { messageByIdQuery } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/live";
import { generateStaticIdPages } from "@/sanity/loader/generateStaticSlugs";
import { notFound } from "next/navigation";

type MessagePageParams = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const messages = await generateStaticIdPages("message");

  return messages.map((message) => ({
    id: message._id,
  }));
}

export default async function MessagePageIdRoute(props: MessagePageParams) {
  const params = await props.params;
  //   const initial = await loadMessageById(params.id);

  const { data } = await sanityFetch({
    query: messageByIdQuery,
    params: { id: params.id },
    perspective: "published",
    stega: false,
  });

  if (!data) {
    notFound();
  }

  return <MessagePage data={data} />;
}

// No need for a sanity preview page for visual editing,
// as we're using our own editor for editing message board messages
