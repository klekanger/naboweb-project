import { clerkClient } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const requestBody = request;
  const parsedBody = await requestBody.json();
  const { userToCreate, userRoles } = parsedBody;
  const { userId } = getAuth(request);

  if (!userId) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const user = await clerkClient.users.getUser(userId);
  const { roles } = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!roles.includes("admin")) {
    return Response.json(
      {
        error: "User is not admin",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const users = await clerkClient.users.getUserList({
      limit: 1,
      emailAddress: [userToCreate?.email],
    });

    if (users.length > 0) {
      return Response.json(
        {
          error: "User already exists",
          message: `User with email ${userToCreate?.email} already exists`,
        },
        {
          status: 409,
        },
      );
    }

    const userCreated = await clerkClient.users.createUser({
      emailAddress: [userToCreate?.email],
      firstName: userToCreate?.firstName,
      lastName: userToCreate?.lastName,
      publicMetadata: {
        roles: userRoles,
      },
      password: userToCreate?.password,
    });

    console.log("userCreated ", userCreated);

    return Response.json({
      success: {
        message: "User created",
        user: {
          userCreated,
          publicMetadata: {
            roles: userRoles,
          },
        },
      },
    });
  } catch (error) {
    console.error("Something went wrong: ", error);

    return Response.json(
      {
        error: {
          errorName: error.name ?? "Unknown error",
          code: error.errors[0].code,
          message: error.message,
          longMessage: error.errors[0].longMessage ?? "",
        },
      },
      {
        status: error.status ?? 500,
      },
    );
  }

  // Create user with default role "user" into publicMetadata
  // https://clerk.com/docs/references/backend/user/create-user

  // Return error or success
}
