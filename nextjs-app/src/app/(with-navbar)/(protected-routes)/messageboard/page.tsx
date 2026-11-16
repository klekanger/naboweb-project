import MessageBoard from "@/components/pages/messageBoard/MessageBoard";
import {
  countMessages,
  countMessagesQuery,
  messageboardQuery,
} from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/live";
import NotLoggedIn from "@/components/NotLoggedIn";
import { getUserWithRole, RESIDENT_ROLES } from "@/lib/requireRole";
import PaginationControls from "@/components/common/PaginationControls";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

async function MessageBoardContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Check the role here, not only in the layout, and before fetching data.
  if (!(await getUserWithRole(RESIDENT_ROLES))) return <NotLoggedIn />;

  const { page = "0" } = await searchParams;
  const messagesPerPage = 10;
  const messageCount = await countMessages();

  const [{ data: messages }, { data: totalMessages }] = await Promise.all([
    sanityFetch({
      query: messageboardQuery,
      params: {
        start: Number(page) * messagesPerPage,
        end: (Number(page) + 1) * messagesPerPage,
      },
      perspective: "published",
      stega: false,
    }),
    sanityFetch({
      query: countMessagesQuery,
      perspective: "published",
      stega: false,
    }),
  ]);

  const totalPages = Math.ceil(totalMessages / messagesPerPage);

  if (Number(page) + 1 > totalPages) {
    return redirect(`/messageboard?page=${totalPages - 1}`);
  }

  return (
    <div>
      <MessageBoard messages={messages} messageCount={messageCount} />
      <PaginationControls
        totalPages={totalPages}
        currentPage={Number(page)}
        baseUrl="/messageboard"
      />
    </div>
  );
}

export default async function MessageBoardRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MessageBoardContent searchParams={searchParams} />
    </Suspense>
  );
}

// No need for a sanity preview page for visual editing,
// as we're using our own editor for editing message board messages
