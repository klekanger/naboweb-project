import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  badRequestResponse,
  getCurrentUserWithRoles,
  serverErrorResponse,
} from "@/app/api/_utils/routeUtils";
import { getMessageForMutation } from "@/app/api/_utils/messageAccess";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserWithRoles();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return badRequestResponse("Missing data");
    }

    const { message, errorResponse } = await getMessageForMutation(
      body._id,
      currentUser,
    );
    if (errorResponse) {
      return errorResponse;
    }

    const { title, bodyText, image, fromAdmin } = body;

    if (typeof title !== "string" || title.trim().length === 0) {
      return badRequestResponse("Title is required");
    }
    if (!Array.isArray(bodyText)) {
      return badRequestResponse("bodyText must be an array");
    }
    if (image != null && typeof image !== "string") {
      return badRequestResponse("image must be an asset id");
    }

    // Patch only the editable fields. The author is never changed here, and
    // comments and other stored fields are kept.
    const fields: Record<string, unknown> = { title, bodyText };

    // Only admins may mark a message as coming from the board.
    if (currentUser.userRoles.isAdmin && typeof fromAdmin === "boolean") {
      fields.fromAdmin = fromAdmin;
    }

    if (image) {
      fields.messageImage = {
        _type: "image",
        asset: { _type: "reference", _ref: image },
      };
    }

    const result = await clientWithWriteAccess
      .patch(message._id)
      .set(fields)
      .commit();

    return NextResponse.json({
      success: {
        message: "Message updated",
        id: message._id,
        transactionId: result?._rev ?? "-",
        title,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return serverErrorResponse("Error: Message could not be updated");
  }
}
