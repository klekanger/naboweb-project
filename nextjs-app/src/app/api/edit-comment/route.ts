import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  badRequestResponse,
  getCurrentUserWithRoles,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/app/api/_utils/routeUtils";
import { type NextRequest, NextResponse } from "next/server";

type EditCommentRequest = {
  messageId: string;
  commentKey: string;
  title: string;
  bodyText: string;
  userId: string;
};

export async function POST(request: NextRequest) {
  const { user, userRoles } = await getCurrentUserWithRoles();

  if (!user || !userRoles.isUser) {
    return unauthorizedResponse();
  }

  const res = (await request.json()) as EditCommentRequest;

  if (!res) {
    return badRequestResponse("Missing data");
  }

  const { messageId, commentKey, title, bodyText, userId } = res;

  if (user.id !== userId) {
    return unauthorizedResponse("Unauthorized (user can only edit their own comments)");
  }

  if (!messageId || messageId === "") {
    return badRequestResponse(
      "Missing messageId. Required for updating comment in Sanity.",
    );
  }

  if (!commentKey || commentKey === "") {
    return badRequestResponse(
      "Missing commentKey. Required for updating comment in Sanity.",
    );
  }

  try {
    // Update the specific comment in the message document
    const result = await clientWithWriteAccess
      .patch(messageId)
      .set({
        [`comments[_key=="${commentKey}"].commentTitle`]: title,
        [`comments[_key=="${commentKey}"].commentText`]: bodyText,
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
    console.error("Error: ", error);
    return serverErrorResponse("Error: Comment could not be updated", error);
  }
}
