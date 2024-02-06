"use server";

import { clerkClient } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs";
import { NewUser, createNewUserReturnType } from "@/types/types";

export async function createNewUser(
  newUser: NewUser,
): Promise<createNewUserReturnType> {
  console.log("newUser", newUser);

  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("admin")) {
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }

  const { email, firstName, lastName, password, roles } = newUser;

  try {
    const users = await clerkClient.users.getUserList({
      limit: 1,
      emailAddress: [email],
    });

    if (users.length > 0) {
      return {
        error: {
          message: `User with email ${email} already exists`,
        },
        status: 409,
      };
    }

    const userCreated = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName: firstName,
      lastName: lastName,
      publicMetadata: {
        roles: roles ?? [],
      },
      password: password,
    });

    const userRoles =
      (userCreated?.publicMetadata as { roles: string[] }) ?? [];

    return {
      success: {
        message: "User created",
        email: userCreated?.emailAddresses[0].emailAddress || "",
        firstName: userCreated?.firstName || "",
        lastName: userCreated?.lastName || "",
        roles: userRoles.roles,
        id: userCreated?.id,
      },
      status: 200,
    };
  } catch (error) {
    console.error("Something went wrong: ", error);

    const typedError = error as Error & {
      errors: { code: string; longMessage: string }[];
      status: number;
    };

    return {
      error: {
        errorName: typedError.name ?? "Unknown error",
        code: typedError.errors[0].code,
        message: typedError.message,
        longMessage: typedError.errors[0].longMessage ?? "",
      },
      status: typedError.status ?? 500,
    };
  }
}
