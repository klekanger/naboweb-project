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

  const { title, bodyText, userId, image, fromAdmin } = res;

  // Create a new message in Sanity

  const messageData: any = {
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
    const result = await clientWithWriteAccess.create(messageData);

    return NextResponse.json({
      success: {
        message: "Message created",
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
