"use server";

import { clerkClient } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs";
import { type DeleteUserReturnType } from "@/types/types";

export async function deleteUser(
  userIDToDelete: string,
): Promise<DeleteUserReturnType> {
  let userWhoWasDeleted;
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
    userWhoWasDeleted = await clerkClient.users.deleteUser(userIDToDelete);

    return {
      success: {
        message: "User deleted successfully",
        userId: userIDToDelete,
      },
      status: 200,
    };
  } catch (error) {
    return {
      error: {
        message: "Failed to delete user",
      },
      status: 400,
    };
  }
}
