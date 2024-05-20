"use server";

import { type UpdateUserReturnType, type UpdateUserType } from "@/types/types";
import { clerkClient, currentUser } from "@clerk/nextjs";

export async function updateUser(
  userToUpdate: UpdateUserType,
): Promise<UpdateUserReturnType> {
  const { id, firstName, lastName, roles } = userToUpdate;

  let userWhoWasUpdated;
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("admin")) {
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }
  if (!userToUpdate) {
    return {
      error: {
        message: "User data missing",
      },
      status: 400,
    };
  }

  try {
    userWhoWasUpdated = await clerkClient.users.updateUser(id, {
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      publicMetadata: {
        roles: roles ?? [],
      },
    });

    return {
      success: {
        message: "User updated successfully",
        email: userWhoWasUpdated.emailAddresses[0].emailAddress,
        firstName: userWhoWasUpdated.firstName ?? "",
        lastName: userWhoWasUpdated.lastName ?? "",
        roles: userWhoWasUpdated.publicMetadata.roles as string[],
        id: userWhoWasUpdated.id,
      },
      status: 200,
    };
  } catch (error) {
    const typedError = error as Error & {
      errors: { code: string; longMessage: string }[];
      status: number;
    };

    return {
      error: {
        code: typedError.errors[0].code,
        message: typedError.message ?? "Failed to update user",
        longMessage: typedError.errors[0].longMessage ?? "",
      },
      status: typedError.status ?? 500,
    };
  }
}
