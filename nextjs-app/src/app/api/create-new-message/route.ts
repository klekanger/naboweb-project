import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  badRequestResponse,
  getCurrentUserWithRoles,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/app/api/_utils/routeUtils";
import {
  messageImageField,
  parseMessageInput,
} from "@/app/api/_utils/messageInput";
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

    const input = parseMessageInput(body);
    if (!input.value) {
      return badRequestResponse(input.error);
    }
    const { title, bodyText, image } = input.value;

    const messageData: { _type: "message"; [field: string]: unknown } = {
      _type: "message",
      title,
      bodyText,
      // Only admins may post as the board.
      fromAdmin: userRoles.isAdmin && body.fromAdmin === true,
      // The author is always the signed-in user, never an id from the request.
      author: {
        _type: "reference",
        _ref: user.id,
      },
    };

    if (image) {
      messageData.messageImage = messageImageField(image);
    }

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
    console.error("Error creating message:", error);
    return serverErrorResponse("Error: Message could not be created");
  }
}
