"use server";

import {
  ClerkError,
  SearchUserReturnType,
  SearchUserSuccessType,
} from "@/types/types";
import { User } from "@clerk/nextjs/dist/types/server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

function mapUsersWithEmails(user: User) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user?.publicMetadata?.roles ?? [],
    email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    imageUrl: user?.imageUrl ?? "",
    createdAt: user?.createdAt ?? null,
  };
}

export async function searchUser({
  searchTerm,
  maxResults = 10,
}: {
  searchTerm: string;
  maxResults?: number;
}): Promise<SearchUserReturnType> {
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
    const { data: foundUsers } = await clerkClient.users.getUserList({
      query: searchTerm,
      limit: maxResults,
    });

    if (foundUsers.length > 0) {
      const allUsers = foundUsers.map((user) => mapUsersWithEmails(user));

      return {
        success: {
          message: "Successfully fetched user",
          users: allUsers as SearchUserSuccessType["success"]["users"],
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
