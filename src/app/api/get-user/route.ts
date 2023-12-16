import { clerkClient } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const requestBody = request;
  const parsedBody = await requestBody.json();
  const { userToFetch } = parsedBody;
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

  if (!userToFetch) {
    return Response.json(
      {
        error: "Please supply a user id",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const userWithId = await clerkClient.users.getUser(userToFetch);

    return Response.json({
      success: {
        message: "Successfully fetched user",
        user: userWithId,
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
}
