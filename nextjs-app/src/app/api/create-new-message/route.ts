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

    return NextResponse.json(
      {
        success: {
          message: "Message created",
          id: result?._id,
          title: result?.title,
          createdAt: result?._createdAt,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error: ", error);
    return serverErrorResponse("Error: Message could not be created", error);
  }
}
