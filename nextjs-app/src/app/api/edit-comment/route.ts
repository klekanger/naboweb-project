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
  parseCommentInput,
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

    // Only the comment's author may edit it, admins included.
    const { comment, errorResponse } = await getCommentForMutation(
      { messageId: body.messageId, commentKey: body.commentKey },
      currentUser,
      { allowAdmin: false },
    );
    if (errorResponse) {
      return errorResponse;
    }

    const input = parseCommentInput(body);
    if (!input.value) {
      return badRequestResponse(input.error);
    }

    const path = `comments[_key=="${comment.commentKey}"]`;
    const result = await clientWithWriteAccess
      .patch(comment.messageId)
      .ifRevisionId(comment.messageRev)
      .set({
        [`${path}.commentTitle`]: input.value.title,
        [`${path}.commentText`]: input.value.bodyText,
      })
      .commit();

    return NextResponse.json({
      success: {
        message: "Comment updated successfully",
        id: result._id,
      },
      status: 200,
    });
  } catch (error) {
    if (isRevisionConflict(error)) {
      return conflictResponse(COMMENT_CHANGED_MESSAGE);
    }
    console.error("Error updating comment:", error);
    return serverErrorResponse("Error: Comment could not be updated");
  }
}
