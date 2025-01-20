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
    return NextResponse.json({
      error: { message: "Missing data" },
      status: 400,
    });
  }

  const { title, bodyText, userId, image, fromAdmin, _id, isAdmin } = res;

  if (user.id !== userId && !isAdmin) {
    return NextResponse.json({
      error: { message: "Unauthorized (user can only edit their own posts)" },
      status: 401,
    });
  }

  if (!_id) {
    return NextResponse.json({
      error: { message: "Missing _id. Required for updating post in Sanity." },
      status: 401,
    });
  }

  // Create a new message in Sanity

  const messageData: any = {
    _id,
    _type: "message",
    title,
    bodyText,
    fromAdmin,
    author: {
      _type: "reference",
      _ref: userId,
    },
  };

  if (image) {
    messageData.messageImage = {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: image,
      },
    };
  }

  try {
    const result = await clientWithWriteAccess.createOrReplace(messageData);

    return NextResponse.json({
      success: {
        message: "Message updated",
        id: result?._id,
        title: result?.title,
        createdAt: result?._createdAt,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json({
      error: {
        message: "Error: Message could not be created",
        longMessage: error,
      },
      status: 500,
    });
  }
}
