import MessageBoard from "@/components/pages/messageBoard/MessageBoard";
import {
  countMessages,
  countMessagesQuery,
  messageboardQuery,
} from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/live";
import PaginationControls from "@/components/common/PaginationControls";
import { redirect } from "next/navigation";

export default async function MessageBoardRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page = "0" } = await searchParams;
  const messagesPerPage = 10;

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
      <MessageBoard messages={messages} />
      <PaginationControls
        totalPages={totalPages}
        currentPage={Number(page)}
        baseUrl="/messageboard"
      />
    </div>
  );
}

// No need for a sanity preview page for visual editing,
// as we're using our own editor for editing message board messages
