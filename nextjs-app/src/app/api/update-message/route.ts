import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  badRequestResponse,
  conflictResponse,
  getCurrentUserWithRoles,
  serverErrorResponse,
} from "@/app/api/_utils/routeUtils";
import {
  getMessageForMutation,
  isRevisionConflict,
  MESSAGE_CHANGED_MESSAGE,
} from "@/app/api/_utils/messageAccess";
import {
  messageImageField,
  parseMessageInput,
} from "@/app/api/_utils/messageInput";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserWithRoles();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return badRequestResponse("Missing data");
    }

    const { message, errorResponse } = await getMessageForMutation(
      body._id,
      currentUser,
    );
    if (errorResponse) {
      return errorResponse;
    }

    const input = parseMessageInput(body);
    if (!input.value) {
      return badRequestResponse(input.error);
    }
    const { title, bodyText, image } = input.value;

    // Patch only the editable fields. The author is never changed here, and
    // comments and other stored fields are kept.
    const fields: Record<string, unknown> = { title, bodyText };

    // Only admins may mark a message as coming from the board.
    if (currentUser.userRoles.isAdmin && typeof body.fromAdmin === "boolean") {
      fields.fromAdmin = body.fromAdmin;
    }

    if (image) {
      fields.messageImage = messageImageField(image);
    }

    // ifRevisionId ties the write to the version the ownership check saw.
    const result = await clientWithWriteAccess
      .patch(message._id)
      .ifRevisionId(message._rev)
      .set(fields)
      .commit();

    return NextResponse.json({
      success: {
        message: "Message updated",
        id: message._id,
        rev: result?._rev ?? null,
        title,
      },
      status: 200,
    });
  } catch (error) {
    if (isRevisionConflict(error)) {
      return conflictResponse(MESSAGE_CHANGED_MESSAGE);
    }
    console.error("Error updating message:", error);
    return serverErrorResponse("Error: Message could not be updated");
  }
}
