import MessageBoard from "@/components/pages/messageBoard/MessageBoard";
import { loadMessageBoard } from "@/sanity/loader/loadQuery";
import { countMessages } from "@/sanity/lib/queries";
import PaginationControls from "@/components/common/PaginationControls";
import { redirect } from "next/navigation";

export default async function MessageBoardRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page = "0" } = await searchParams;
  const messagesPerPage = 10;

  const [initial, totalMessages] = await Promise.all([
    loadMessageBoard(Number(page)),
    countMessages(),
  ]);

  const totalPages = Math.ceil(totalMessages / messagesPerPage);

  if (Number(page) + 1 > totalPages) {
    return redirect(`/messageboard?page=${totalPages - 1}`);
  }

  return (
    <div>
      <MessageBoard messages={initial.data} />
      <PaginationControls
        totalPages={totalPages}
        currentPage={Number(page)}
        baseUrl="/messageboard"
      />
    </div>
  );
}
