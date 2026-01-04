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
    return NextResponse.json({
      error: {
        message: "Error: Message could not be updated",
        longMessage: error,
      },
      status: 500,
    });
  }
}
