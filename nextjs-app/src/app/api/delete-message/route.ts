import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  badRequestResponse,
  getCurrentUserWithRoles,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/app/api/_utils/routeUtils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { user, userRoles } = await getCurrentUserWithRoles();

    if (!user) {
      return unauthorizedResponse();
    }

    const { id, userId } = await request.json();

    if (!id) {
      return badRequestResponse("Message ID is required");
    }

    // Allow admins to delete any message, but regular users can only delete their own
    if (!(userRoles.isAdmin || user.id === userId)) {
      return unauthorizedResponse(
        "Unauthorized (user can only delete their own messages)",
      );
    }

    // Delete the message from Sanity
    await clientWithWriteAccess.delete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return serverErrorResponse(error?.message ?? "Failed to delete message");
  }
}
