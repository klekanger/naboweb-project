"use server";

import { type UpdateUserReturnType, type UpdateUserType } from "@/types/types";
import { clerkClient } from "@clerk/nextjs/server";
import { ADMIN_ROLES, getUserWithRole } from "@/lib/requireRole";

const client = await clerkClient();

export async function updateUser(
  userToUpdate: UpdateUserType,
): Promise<UpdateUserReturnType> {
  const { id, firstName, lastName, roles, emailSubscription } = userToUpdate;

  let userWhoWasUpdated;
  const user = await getUserWithRole(ADMIN_ROLES);

  if (!user) {
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
    // Fetch existing user to preserve existing publicMetadata
    const existingUser = await client.users.getUser(id);
    const existingMetadata =
      (existingUser.publicMetadata as {
        roles?: string[];
        emailSubscription?: boolean;
      }) ?? {};

    // Ensure "user" role is always included
    const rolesArray =
      Array.isArray(roles) && roles.length > 0
        ? roles
        : existingMetadata.roles && existingMetadata.roles.length > 0
          ? existingMetadata.roles
          : ["user"];
    const finalRoles = rolesArray.includes("user")
      ? rolesArray
      : [...rolesArray, "user"];

    userWhoWasUpdated = await client.users.updateUser(id, {
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      publicMetadata: {
        roles: finalRoles,
        emailSubscription:
          emailSubscription !== undefined
            ? emailSubscription
            : existingMetadata.emailSubscription ?? true,
      },
    });

    const updatedRoles =
      (userWhoWasUpdated.publicMetadata as { roles?: string[] })?.roles ??
      finalRoles;

    return {
      success: {
        message: "User updated successfully",
        email: userWhoWasUpdated.emailAddresses[0].emailAddress,
        firstName: userWhoWasUpdated.firstName ?? "",
        lastName: userWhoWasUpdated.lastName ?? "",
        roles: updatedRoles,
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
