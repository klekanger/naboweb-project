import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  badRequestResponse,
  getCurrentUserWithRoles,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/app/api/_utils/routeUtils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { user, userRoles } = await getCurrentUserWithRoles();

  if (!user || !userRoles.isUser) {
    return unauthorizedResponse();
  }

  const res = await request.json();

  if (!res) {
    return badRequestResponse("Missing data");
  }

  const { title, bodyText, userId, _id } = res;

  if (user.id !== userId) {
    return unauthorizedResponse("Unauthorized (user can only edit their own posts)");
  }

  if (!_id || _id === "") {
    return badRequestResponse("Missing _id. Required for updating post in Sanity.");
  }

  try {
    // Create a new comment object
    const newComment = {
      _type: "comment",
      commentTitle: title,
      commentText: bodyText,
      published: new Date().toISOString(),
      commentAuthor: {
        _type: "reference",
        _ref: userId,
      },
    };

    // Update the message document by appending the new comment
    const result = await clientWithWriteAccess
      .patch(_id)
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
    console.error("Error: ", error);
    return serverErrorResponse("Error: Message could not be created", error);
  }
}
