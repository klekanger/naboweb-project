import { clerkClient } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { userToCreate, userRoles } = await request.json();
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
        userCreated,
      },
    });
  } catch (error) {
    console.error("Something went wrong: ", error);

    const typedError = error as Error & {
      errors: { code: string; longMessage: string }[];
      status: number;
    };

    return Response.json(
      {
        error: {
          errorName: typedError.name ?? "Unknown error",
          code: typedError.errors[0].code,
          message: typedError.message,
          longMessage: typedError.errors[0].longMessage ?? "",
        },
      },
      {
        status: typedError.status ?? 500,
      },
    );
  }
}
