import { clientWithWriteAccess } from "@/sanity/lib/client";
import { MESSAGE_OWNERSHIP_QUERY } from "@/sanity/lib/queries";
import type { MESSAGE_OWNERSHIP_QUERY_RESULT } from "@/types/sanity.types";
import {
  badRequestResponse,
  forbiddenResponse,
  notFoundResponse,
  unauthorizedResponse,
  type getCurrentUserWithRoles,
} from "@/app/api/_utils/routeUtils";
import type { NextResponse } from "next/server";

type CurrentUser = Awaited<ReturnType<typeof getCurrentUserWithRoles>>;

export type OwnedMessage = NonNullable<MESSAGE_OWNERSHIP_QUERY_RESULT>;

type MessageAccessResult =
  | { message: OwnedMessage; errorResponse?: never }
  | { message?: never; errorResponse: NextResponse };

/**
 * Loads a published message by id and checks that the signed-in user may
 * change it: admins may change any message, other users only their own.
 * Ownership comes from the stored author reference, never from the request.
 * The returned _rev must be used to guard the following write.
 */
export async function getMessageForMutation(
  id: unknown,
  { user, userRoles }: CurrentUser,
): Promise<MessageAccessResult> {
  if (!user || !userRoles.isUser) {
    return { errorResponse: unauthorizedResponse() };
  }

  if (typeof id !== "string" || id.length === 0) {
    return { errorResponse: badRequestResponse("Message ID is required") };
  }

  const message = await clientWithWriteAccess.fetch(
    MESSAGE_OWNERSHIP_QUERY,
    { id },
    { perspective: "published" },
  );

  if (!message) {
    return { errorResponse: notFoundResponse("Message not found") };
  }

  if (!userRoles.isAdmin && message.authorId !== user.id) {
    return {
      errorResponse: forbiddenResponse(
        "Unauthorized (user can only change their own messages)",
      ),
    };
  }

  return { message };
}

export const MESSAGE_CHANGED_MESSAGE =
  "Innlegget ble endret av noen andre i mellomtiden. Last inn siden og prøv igjen.";

export function isRevisionConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    (error as { statusCode?: number }).statusCode === 409
  );
}
