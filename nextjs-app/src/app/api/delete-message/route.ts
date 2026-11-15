import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  getCurrentUserWithRoles,
  serverErrorResponse,
} from "@/app/api/_utils/routeUtils";
import { getMessageForMutation } from "@/app/api/_utils/messageAccess";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUserWithRoles();
    const body = await request.json().catch(() => null);

    const { message, errorResponse } = await getMessageForMutation(
      body?.id,
      currentUser,
    );
    if (errorResponse) {
      return errorResponse;
    }

    await clientWithWriteAccess.delete(message._id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return serverErrorResponse("Failed to delete message");
  }
}
