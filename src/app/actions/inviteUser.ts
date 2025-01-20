"use server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

const client = await clerkClient();

export async function inviteUser({
  email,
  roles,
}: {
  email: string;
  roles: string[];
}) {
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("admin")) {
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }

  if (!email || !roles) {
    return {
      error: { message: "email or roles not received from client" },
      status: 400,
    };
  }

  // Invite user
  try {
    const invitedUser = await client.invitations.createInvitation({
      emailAddress: email,
      ignoreExisting: false,
      publicMetadata: {
        roles: roles ?? [],
      },
    });

    const userRoles =
      (invitedUser?.publicMetadata as { roles: string[] }) ?? [];

    return {
      success: {
        message: "Successfully invited user",
        email: invitedUser?.emailAddress || "",
        roles: userRoles.roles,
        status: 200,
      },
    };
  } catch (error) {
    console.error("Something went wrong:", error);

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
