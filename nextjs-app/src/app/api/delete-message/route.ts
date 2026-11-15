import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  conflictResponse,
  getCurrentUserWithRoles,
  serverErrorResponse,
} from "@/app/api/_utils/routeUtils";
import {
  getMessageForMutation,
  MESSAGE_CHANGED_MESSAGE,
} from "@/app/api/_utils/messageAccess";
import { NextResponse } from "next/server";

// Deletes the published message only if it still has the revision the
// ownership check saw. Params are server-controlled, never from the request.
const DELETE_MESSAGE_AT_REVISION = `*[
  _type == "message"
  && _id == $id
  && _rev == $rev
]`;

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUserWithRoles();
    const body = await request.json().catch(() => null);

    const { message, errorResponse } = await getMessageForMutation(
      body?.id,
      currentUser,
    );
    if (errorResponse) {
      return errorResponse;
    }

    const result = await clientWithWriteAccess.delete({
      query: DELETE_MESSAGE_AT_REVISION,
      params: { id: message._id, rev: message._rev },
    });

    if (!result.results?.length) {
      return conflictResponse(MESSAGE_CHANGED_MESSAGE);
    }

    // Remove any Studio draft too, so publishing it cannot bring the
    // message back.
    await clientWithWriteAccess.delete(`drafts.${message._id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return serverErrorResponse("Failed to delete message");
  }
}
