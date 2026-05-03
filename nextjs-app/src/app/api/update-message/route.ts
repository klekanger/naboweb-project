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

  const { title, bodyText, userId, image, fromAdmin, _id, isAdmin } = res;

  if (user.id !== userId && !isAdmin) {
    return unauthorizedResponse(
      "Unauthorized (user can only edit their own posts)",
    );
  }

  if (!_id) {
    return badRequestResponse("Missing _id. Required for updating post in Sanity.");
  }

  try {
    // First get the existing document to ensure it exists
    const existingMessage = await clientWithWriteAccess.getDocument(_id);

    if (!existingMessage) {
      return NextResponse.json({
        error: { message: "Message not found" },
        status: 404,
      });
    }

    // Create the update document
    const updateDoc: {
      _id: string;
      _type: string;
      title: any;
      bodyText: any;
      fromAdmin: boolean;
      author: {
        _type: string;
        _ref: string;
      };
      messageImage?: {
        _type: string;
        asset: {
          _type: string;
          _ref: string;
        };
      };
    } = {
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

    // Handle image - either new image or preserve existing
    if (image) {
      // New image uploaded
      updateDoc.messageImage = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: image,
        },
      };
    } else if (existingMessage.messageImage) {
      // No new image, preserve existing image
      updateDoc.messageImage = existingMessage.messageImage;
    }

    // Update using transaction
    const transaction = clientWithWriteAccess.transaction();
    transaction.createOrReplace(updateDoc);

    const result = await transaction.commit();

    return NextResponse.json({
      success: {
        message: "Message updated",
        id: _id,
        transactionId: result?.transactionId ?? "-",
        title: title,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error: ", error);
    return serverErrorResponse("Error: Message could not be updated", error);
  }
}
