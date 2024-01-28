import { clerkClient } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  const { userToDelete } = await request.json();
  let userWhoWasDeleted;

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

  if (!userToDelete) {
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
    userWhoWasDeleted = await clerkClient.users.deleteUser(userToDelete);

    return Response.json({
      success: {
        message: "User deleted",
      },
      user: userWhoWasDeleted,
    });
  } catch (error) {
    console.error("Something went wrong:", error);
  }

  return Response.json({
    success: {
      message: "User deleted",
      user: userWhoWasDeleted,
    },
  });
}
