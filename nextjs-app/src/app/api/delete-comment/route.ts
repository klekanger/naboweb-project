import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  badRequestResponse,
  getCurrentUserWithRoles,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/app/api/_utils/routeUtils";
import { type NextRequest, NextResponse } from "next/server";

type DeleteCommentRequest = {
  messageId: string;
  commentKey: string;
  userId: string;
};

export async function POST(request: NextRequest) {
  try {
    const { user, userRoles } = await getCurrentUserWithRoles();

    if (!user) {
      return unauthorizedResponse();
    }

    const res = (await request.json()) as DeleteCommentRequest;

    if (!res) {
      return badRequestResponse("Missing data");
    }

    const { messageId, commentKey, userId } = res;

    if (!messageId || messageId === "") {
      return badRequestResponse(
        "Missing messageId. Required for deleting comment in Sanity.",
      );
    }

    if (!commentKey || commentKey === "") {
      return badRequestResponse(
        "Missing commentKey. Required for deleting comment in Sanity.",
      );
    }

    // Allow admins to delete any comment, but regular users can only delete their own
    if (!(userRoles.isAdmin || user.id === userId)) {
      return unauthorizedResponse(
        "Unauthorized (user can only delete their own comments)",
      );
    }

    // Remove the specific comment from the message document
    const result = await clientWithWriteAccess
      .patch(messageId)
      .unset([`comments[_key=="${commentKey}"]`])
      .commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    return serverErrorResponse(error?.message ?? "Failed to delete comment");
  }
}
