import { clientWithWriteAccess } from "@/sanity/lib/client";
import { currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("user")) {
    return NextResponse.json({
      error: { message: "Unauthorized" },
      status: 401,
    });
  }

  const res = await request.json();

  if (!res) {
    return NextResponse.json(
      {
        error: { message: "Missing data" },
      },
      { status: 400 },
    );
  }

  const { title, bodyText, userId, _id } = res;

  if (user.id !== userId) {
    return NextResponse.json(
      {
        error: { message: "Unauthorized (user can only edit their own posts)" },
      },
      { status: 401 },
    );
  }

  if (!_id || _id === "") {
    return NextResponse.json(
      {
        error: {
          message: "Missing _id. Required for updating post in Sanity.",
        },
      },
      { status: 401 },
    );
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
    return NextResponse.json(
      {
        error: {
          message: "Error: Message could not be created",
          longMessage: error,
        },
      },
      { status: 500 },
    );
  }
}
