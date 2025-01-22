import MessageBoard from "@/components/pages/messageBoard/MessageBoard";
import { loadMessageBoard } from "@/sanity/loader/loadQuery";
import { countMessages } from "@/sanity/lib/queries";
import PaginationControls from "@/components/common/PaginationControls";
import { redirect } from "next/navigation";

export default async function MessageBoardRoute({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page =
    typeof searchParams.page === "string" ? Number(searchParams.page) : 0;
  const messagesPerPage = 10;

  const [initial, totalMessages] = await Promise.all([
    loadMessageBoard(page),
    countMessages(),
  ]);

  const totalPages = Math.ceil(totalMessages / messagesPerPage);

  if (page + 1 > totalPages) {
    return redirect(`/messageboard?page=${totalPages - 1}`);
  }

  return (
    <div>
      <MessageBoard messages={initial.data} />
      <PaginationControls
        totalPages={totalPages}
        currentPage={page}
        baseUrl="/messageboard"
      />
    </div>
  );
}
