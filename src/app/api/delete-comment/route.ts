import { clientWithWriteAccess } from "@/sanity/lib/client";
import { currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

type DeleteCommentRequest = {
  messageId: string;
  commentKey: string;
  userId: string;
};

export async function POST(request: NextRequest) {
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("user")) {
    return NextResponse.json({
      error: { message: "Unauthorized" },
      status: 401,
    });
  }

  const res = (await request.json()) as DeleteCommentRequest;

  if (!res) {
    return NextResponse.json({
      error: { message: "Missing data" },
      status: 400,
    });
  }

  const { messageId, commentKey, userId } = res;

  if (user.id !== userId) {
    return NextResponse.json({
      error: {
        message: "Unauthorized (user can only delete their own comments)",
      },
      status: 401,
    });
  }

  if (!messageId || messageId === "") {
    return NextResponse.json({
      error: {
        message: "Missing messageId. Required for deleting comment in Sanity.",
      },
      status: 401,
    });
  }

  if (!commentKey || commentKey === "") {
    return NextResponse.json({
      error: {
        message: "Missing commentKey. Required for deleting comment in Sanity.",
      },
      status: 401,
    });
  }

  try {
    // Remove the specific comment from the message document
    const result = await clientWithWriteAccess
      .patch(messageId)
      .unset([`comments[_key=="${commentKey}"]`])
      .commit();

    return NextResponse.json({
      success: {
        message: "Comment deleted successfully",
        id: result._id,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json({
      error: {
        message: "Error: Comment could not be deleted",
        longMessage: error,
      },
      status: 500,
    });
  }
}
