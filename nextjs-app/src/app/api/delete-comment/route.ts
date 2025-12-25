import { clientWithWriteAccess } from "@/sanity/lib/client";
import { currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

type DeleteCommentRequest = {
  messageId: string;
  commentKey: string;
  userId: string;
};

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];
    const isAdmin = userRoles.roles.includes("admin");
    const isUser = userRoles.roles.includes("user");

    // Allow access if user is admin OR has user role
    if (!(isAdmin || isUser)) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const res = (await request.json()) as DeleteCommentRequest;

    if (!res) {
      return NextResponse.json(
        { error: { message: "Missing data" } },
        { status: 400 },
      );
    }

    const { messageId, commentKey, userId } = res;

    if (!messageId || messageId === "") {
      return NextResponse.json(
        {
          error: {
            message:
              "Missing messageId. Required for deleting comment in Sanity.",
          },
        },
        { status: 400 },
      );
    }

    if (!commentKey || commentKey === "") {
      return NextResponse.json(
        {
          error: {
            message:
              "Missing commentKey. Required for deleting comment in Sanity.",
          },
        },
        { status: 400 },
      );
    }

    // Allow admins to delete any comment, but regular users can only delete their own
    if (!(isAdmin || user.id === userId)) {
      return NextResponse.json(
        {
          error: {
            message: "Unauthorized (user can only delete their own comments)",
          },
        },
        { status: 401 },
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
    return NextResponse.json(
      { error: { message: error?.message ?? "Failed to delete comment" } },
      { status: 500 },
    );
  }
}
