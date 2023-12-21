import { ClerkError } from "@/types/types";
import { clerkClient } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  const requestBody = request;
  const parsedBody = await requestBody.json();
  const { userToFetch }: { userToFetch: string } = parsedBody;
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
        error: "User id missing",
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
      },
      user: userWithId,
    });
  } catch (error) {
    const clerkError = error as ClerkError;
    console.error("Something went wrong: ", error);

    return Response.json(
      {
        error: {
          errorName: clerkError?.name ?? "Unknown error",
          code: clerkError?.errors[0].code,
          message: clerkError?.message,
          longMessage: clerkError?.errors[0]?.longMessage ?? "",
        },
      },
      {
        status: clerkError?.status ?? 500,
      },
    );
  }
}
