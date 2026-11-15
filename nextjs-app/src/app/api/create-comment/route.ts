import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  badRequestResponse,
  getCurrentUserWithRoles,
  notFoundResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/app/api/_utils/routeUtils";
import { parseCommentInput } from "@/app/api/_utils/commentAccess";
import { MESSAGE_OWNERSHIP_QUERY } from "@/sanity/lib/queries";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { user, userRoles } = await getCurrentUserWithRoles();

    if (!user || !userRoles.isUser) {
      return unauthorizedResponse();
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return badRequestResponse("Missing data");
    }

    const { _id } = body;
    if (typeof _id !== "string" || _id.length === 0) {
      return badRequestResponse("Message ID is required");
    }

    const input = parseCommentInput(body);
    if (!input.value) {
      return badRequestResponse(input.error);
    }

    // Only published messages can be commented on.
    const message = await clientWithWriteAccess.fetch(
      MESSAGE_OWNERSHIP_QUERY,
      { id: _id },
      { perspective: "published" },
    );
    if (!message) {
      return notFoundResponse("Message not found");
    }

    const newComment = {
      _type: "comment",
      commentTitle: input.value.title,
      commentText: input.value.bodyText,
      published: new Date().toISOString(),
      // The author is always the signed-in user, never an id from the request.
      commentAuthor: {
        _type: "reference",
        _ref: user.id,
      },
    };

    const result = await clientWithWriteAccess
      .patch(message._id)
      .setIfMissing({ comments: [] })
      .append("comments", [newComment])
      .commit({
        autoGenerateArrayKeys: true,
      });

    return NextResponse.json(
      {
        success: {
          message: "Message updated with a new comment",
          id: result._id,
          title: result.title,
          createdAt: result._createdAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return serverErrorResponse("Error: Comment could not be created");
  }
}
