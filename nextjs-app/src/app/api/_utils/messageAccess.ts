import { clientWithWriteAccess } from "@/sanity/lib/client";
import { MESSAGE_OWNERSHIP_QUERY } from "@/sanity/lib/queries";
import type { MESSAGE_OWNERSHIP_QUERY_RESULT } from "@/types/sanity.types";
import type { getCurrentUserWithRoles } from "@/app/api/_utils/routeUtils";
import { NextResponse } from "next/server";

type CurrentUser = Awaited<ReturnType<typeof getCurrentUserWithRoles>>;

export type OwnedMessage = NonNullable<MESSAGE_OWNERSHIP_QUERY_RESULT>;

type MessageAccessResult =
  | { message: OwnedMessage; errorResponse?: never }
  | { message?: never; errorResponse: NextResponse };

/**
 * Loads a published message by id and checks that the signed-in user may
 * change it: admins may change any message, other users only their own.
 * Ownership comes from the stored author reference, never from the request.
 */
export async function getMessageForMutation(
  id: unknown,
  { user, userRoles }: CurrentUser,
): Promise<MessageAccessResult> {
  if (!user || !userRoles.isUser) {
    return { errorResponse: errorJson("Unauthorized", 401) };
  }

  if (typeof id !== "string" || id.length === 0) {
    return { errorResponse: errorJson("Message ID is required", 400) };
  }

  const message = await clientWithWriteAccess.fetch(
    MESSAGE_OWNERSHIP_QUERY,
    { id },
    { perspective: "published" },
  );

  if (!message) {
    return { errorResponse: errorJson("Message not found", 404) };
  }

  if (!userRoles.isAdmin && message.authorId !== user.id) {
    return {
      errorResponse: errorJson(
        "Unauthorized (user can only change their own messages)",
        403,
      ),
    };
  }

  return { message };
}

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: { message } }, { status });
}
