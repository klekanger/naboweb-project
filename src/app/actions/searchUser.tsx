"use server";

import {
  ClerkError,
  SearchUserReturnType,
  SearchUserType,
} from "@/types/types";
import { clerkClient, currentUser } from "@clerk/nextjs";

function mapUsersWithEmails(user: SearchUserType) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user?.publicMetadata?.roles ?? [],
    email: user?.emailAddresses?.[0]?.emailAddress ?? "",
  };
}

export async function searchUser(
  searchTerm: string,
): Promise<SearchUserReturnType> {
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("admin")) {
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }

  if (!searchTerm) {
    return {
      error: { message: "Search term missing" },
      status: 400,
    };
  }

  try {
    const foundUsers = await clerkClient.users.getUserList({
      query: searchTerm,
      limit: 5,
    });

    if (foundUsers.length > 0) {
      const allUsers = foundUsers.map((user) => mapUsersWithEmails(user));

      return {
        success: {
          message: "Successfully fetched user",
          users: allUsers,
          status: 200,
        },
      };
    } else {
      return {
        error: { message: "User not found" },
        status: 404,
      };
    }
  } catch (error) {
    const clerkError = error as ClerkError;
    console.error("Something went wrong:", error);

    return {
      error: {
        errorName: clerkError?.name ?? "Unknown error",
        code: clerkError?.errors[0]?.code,
        message: clerkError?.message,
        longMessage: clerkError?.errors[0]?.longMessage ?? "",
      },
      status: 500,
    };
  }
}
