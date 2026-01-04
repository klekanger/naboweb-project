import MessagePage from "@/components/pages/messageBoard/MessagePage";
import { sanityFetch } from "@/sanity/lib/live";
import { allMessageIdsQuery, messageByIdQuery } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";

type MessagePageParams = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: allMessageIdsQuery,
    // Use the published perspective in generateStaticParams
    perspective: "published",
    stega: false,
  });

  return data.map((message) => ({
    id: message._id,
  }));
}

export default async function MessagePageIdRoute(props: MessagePageParams) {
  const params = await props.params;

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
