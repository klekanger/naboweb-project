import { clientWithWriteAccess } from "@/sanity/lib/client";
import { COMMENT_OWNERSHIP_QUERY } from "@/sanity/lib/queries";
import {
  badRequestResponse,
  forbiddenResponse,
  notFoundResponse,
  unauthorizedResponse,
  type getCurrentUserWithRoles,
} from "@/app/api/_utils/routeUtils";
import { KEY_PATTERN } from "@/app/api/_utils/messageInput";
import type { NextResponse } from "next/server";

type CurrentUser = Awaited<ReturnType<typeof getCurrentUserWithRoles>>;

export const MAX_COMMENT_TITLE_LENGTH = 200;
export const MAX_COMMENT_TEXT_LENGTH = 5_000;

type OwnedComment = {
  messageId: string;
  messageRev: string;
  /** Validated against KEY_PATTERN, so it is safe inside a patch path. */
  commentKey: string;
};

type CommentAccessResult =
  | { comment: OwnedComment; errorResponse?: never }
  | { comment?: never; errorResponse: NextResponse };

/**
 * Loads a comment on a published message and checks that the signed-in user
 * may change it. Ownership comes from the stored commentAuthor reference,
 * never from the request. Admins may act on any comment only when
 * `allowAdmin` is set. The returned messageRev must guard the following write.
 */
export async function getCommentForMutation(
  { messageId, commentKey }: { messageId: unknown; commentKey: unknown },
  { user, userRoles }: CurrentUser,
  { allowAdmin }: { allowAdmin: boolean },
): Promise<CommentAccessResult> {
  if (!user || !userRoles.isUser) {
    return { errorResponse: unauthorizedResponse() };
  }

  if (typeof messageId !== "string" || messageId.length === 0) {
    return { errorResponse: badRequestResponse("Message ID is required") };
  }

  if (typeof commentKey !== "string" || !KEY_PATTERN.test(commentKey)) {
    return { errorResponse: badRequestResponse("Invalid comment key") };
  }

  const message = await clientWithWriteAccess.fetch(
    COMMENT_OWNERSHIP_QUERY,
    { id: messageId, key: commentKey },
    { perspective: "published" },
  );

  if (!message?.comment) {
    return { errorResponse: notFoundResponse("Comment not found") };
  }

  const isAuthor = message.comment.authorId === user.id;
  if (!isAuthor && !(allowAdmin && userRoles.isAdmin)) {
    return {
      errorResponse: forbiddenResponse(
        "Unauthorized (user can only change their own comments)",
      ),
    };
  }

  return {
    comment: {
      messageId: message._id,
      messageRev: message._rev,
      commentKey: message.comment._key,
    },
  };
}

export function parseCommentInput(body: Record<string, unknown>) {
  const { title, bodyText } = body;

  if (typeof title !== "string" || title.trim().length === 0) {
    return { error: "Title is required" } as const;
  }
  if (title.length > MAX_COMMENT_TITLE_LENGTH) {
    return {
      error: `Title can be at most ${MAX_COMMENT_TITLE_LENGTH} characters`,
    } as const;
  }
  if (typeof bodyText !== "string" || bodyText.trim().length === 0) {
    return { error: "Comment text is required" } as const;
  }
  if (bodyText.length > MAX_COMMENT_TEXT_LENGTH) {
    return {
      error: `Comment can be at most ${MAX_COMMENT_TEXT_LENGTH} characters`,
    } as const;
  }

  return { value: { title, bodyText } } as const;
}

export const COMMENT_CHANGED_MESSAGE =
  "Innlegget ble endret av noen andre i mellomtiden. Last inn siden og prøv igjen.";
