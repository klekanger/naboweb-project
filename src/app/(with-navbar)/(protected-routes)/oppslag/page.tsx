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

// Add clerk users to sanity: https://dev.to/julimancan/how-to-add-user-auth-with-clerk-to-nextjs-app-directory-and-store-it-in-embedded-sanity-cms-f0
