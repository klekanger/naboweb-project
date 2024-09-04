"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import type { MessageType } from "@/types/types";

export async function createNewMessage(message: MessageType) {
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("user")) {
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }

  const { author, bodyText, title, userId, messageImage } = message;

  // The user in Clerk should automatically have been created in Sanity when the user logs in the first time
  // If not, we should create it now
  if (user.id !== userId) {
    // TODO create a new user in Sanity if it doesn't exist
    // use the /api/create-sanity-user route

    console.error(
      `Clerk user ${user?.id ?? "unknown"} does not match Sanity user ${userId ?? "unknown"}`,
    );
    return {
      error: { message: "Clerk user does not exist in Sanity" },
      status: 401,
    };
  }

  return {
    success: { message: "DEBUG - return early" },
    status: 200,
  };

  // Create a new message in Sanity
  try {
    const result = await clientWithWriteAccess.create({
      _type: "message",
      title,
      bodyText,
      // messageImage
    });

    return {
      success: {
        message: "Message created",
        title: result?.title,
        createdAt: result?._createdAt,
      },
      status: 200,
    };
  } catch (error) {
    return {
      error: {
        message: "Error: Message could not be created",
        longMessage: error,
      },
      status: 500,
    };
  }
}
