import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  badRequestResponse,
  conflictResponse,
  getCurrentUserWithRoles,
  serverErrorResponse,
} from "@/app/api/_utils/routeUtils";
import {
  COMMENT_CHANGED_MESSAGE,
  getCommentForMutation,
} from "@/app/api/_utils/commentAccess";
import { isRevisionConflict } from "@/app/api/_utils/messageAccess";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserWithRoles();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return badRequestResponse("Missing data");
    }

    // Admins may delete any comment; others only their own.
    const { comment, errorResponse } = await getCommentForMutation(
      { messageId: body.messageId, commentKey: body.commentKey },
      currentUser,
      { allowAdmin: true },
    );
    if (errorResponse) {
      return errorResponse;
    }

    await clientWithWriteAccess
      .patch(comment.messageId)
      .ifRevisionId(comment.messageRev)
      .unset([`comments[_key=="${comment.commentKey}"]`])
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isRevisionConflict(error)) {
      return conflictResponse(COMMENT_CHANGED_MESSAGE);
    }
    console.error("Error deleting comment:", error);
    return serverErrorResponse("Failed to delete comment");
  }
}
