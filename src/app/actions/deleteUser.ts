"use server";

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type DeleteUserReturnType } from "@/types/types";

import { Authors } from "@/types/sanity.types";

const client = await clerkClient();

export async function deleteUser(
  userIDToDelete: string,
): Promise<DeleteUserReturnType> {
  let deletedFromClerk;
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("admin")) {
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }
  if (!userIDToDelete) {
    return {
      error: {
        message: "User id missing",
      },
      status: 400,
    };
  }

  try {
    // Delete from Clerk first
    deletedFromClerk = await client.users.deleteUser(userIDToDelete);

    if ("deleted" in deletedFromClerk === false) {
      throw new Error(`Failed to delete user with ID ${userIDToDelete}`);
    }

    let sanityUserHasBeenDeleted = false;
    let deletedSanityUserId = "";
    try {
      // Delete from Sanity
      const deletedFromSanity =
        await clientWithWriteAccess.delete<Authors>(userIDToDelete);

      if (
        "documentIds" in deletedFromSanity &&
        Array.isArray(
          (deletedFromSanity as { documentIds: unknown }).documentIds,
        )
      ) {
        const documentIds = deletedFromSanity.documentIds as Array<{
          id: string;
        }>;
        deletedSanityUserId = documentIds[0]?.id as string;
      }

      sanityUserHasBeenDeleted = true;
    } catch (sanityError) {
      console.warn(`Failed to delete user from Sanity: ${sanityError}`);
    }

    return {
      success: {
        message: "User deleted successfully",
        deletedClerkUserId: deletedFromClerk.id,
        sanityUserHasBeenDeleted,
        deletedSanityUserId,
      },
      status: 200,
    };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to delete user",
      },
      status: 400,
    };
  }
}
