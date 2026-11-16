import MessagePage from "@/components/pages/messageBoard/MessagePage";
import { sanityFetch } from "@/sanity/lib/live";
import { messageByIdQuery } from "@/sanity/lib/queries";
import NotLoggedIn from "@/components/NotLoggedIn";
import { getUserWithRole, RESIDENT_ROLES } from "@/lib/requireRole";
import { notFound } from "next/navigation";

type MessagePageParams = {
  params: Promise<{ id: string }>;
};

export default async function MessagePageIdRoute(props: MessagePageParams) {
  // Check the role here, not only in the layout, and before fetching data.
  if (!(await getUserWithRole(RESIDENT_ROLES))) return <NotLoggedIn />;

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
