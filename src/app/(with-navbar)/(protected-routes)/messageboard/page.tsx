import MessageBoard from "@/components/pages/messageBoard/MessageBoard";
import { loadMessageBoard } from "@/sanity/loader/loadQuery";

export default async function MessageBoardRoute() {
  const initial = await loadMessageBoard();

  return (
    <>
      <MessageBoard messages={initial.data} />
    </>
  );
}

// https://www.sanity.io/plugins/javascript-api-client
