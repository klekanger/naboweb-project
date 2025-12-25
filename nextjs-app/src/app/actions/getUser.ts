"use server";

import { ClerkError, GetUserReturnType } from "@/types/types";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

const client = await clerkClient();

export async function getUser(userToFetch: string): Promise<GetUserReturnType> {
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("admin")) {
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }

  if (!userToFetch) {
    return {
      error: { message: "User id missing" },
      status: 400,
    };
  }

  try {
    const userWithId = await client.users.getUser(userToFetch);

    return {
      success: {
        message: "Successfully fetched user",
        user: {
          id: userWithId?.id,
          firstName: userWithId?.firstName ?? "",
          lastName: userWithId?.lastName ?? "",
          email: userWithId?.emailAddresses[0].emailAddress,
          createdAt: userWithId?.createdAt,
          lastSignInAt: userWithId?.lastSignInAt,
          roles: userWithId?.publicMetadata.roles as string[],
          emailSubscription: Boolean(
            userWithId?.publicMetadata?.emailSubscription,
          ),
          imageUrl: userWithId?.imageUrl ?? "",
          hasImage: userWithId?.hasImage ?? false,
        },
        status: 200,
      },
    };
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
