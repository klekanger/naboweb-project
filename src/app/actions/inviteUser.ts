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

  try {
    // First check if user already exists
    const existingUsers = await client.users.getUserList({
      emailAddress: [email],
    });

    const existingUser = existingUsers.data[0];
    if (existingUser) {
      console.log("User already exists:", {
        email,
        userId: existingUser.id,
      });

      // Update the existing user's roles instead of creating a new invitation
      await client.users.updateUser(existingUser.id, {
        publicMetadata: {
          roles: roles,
        },
      });

      return {
        success: {
          message: "User already exists. Updated roles.",
          email: email,
          roles: roles,
          status: 200,
        },
      };
    }

    // Check for existing pending invitations
    const pendingInvitations = await client.invitations.getInvitationList();
    const existingInvitation = pendingInvitations.data.find(
      (invitation) => invitation.emailAddress === email,
    );

    // If there's a pending invitation, revoke it
    if (existingInvitation) {
      await client.invitations.revokeInvitation(existingInvitation.id);
    }

    // Create new invitation

    const invitedUser = await client.invitations.createInvitation({
      emailAddress: email,
      ignoreExisting: false, // Changed to false to get proper error if user exists
      publicMetadata: {
        roles: roles,
      },
      // redirectUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    });

    console.log("Invitation created:", {
      email: invitedUser.emailAddress,
      status: invitedUser.status,
      id: invitedUser.id,
    });

    return {
      success: {
        message: "Successfully invited user",
        email: invitedUser.emailAddress,
        roles: roles,
        status: 200,
      },
    };
  } catch (error) {
    console.error("Error inviting user:", {
      error,
      email,
      roles,
    });

    const typedError = error as Error & {
      errors: { code: string; longMessage: string }[];
      status: number;
    };

    return {
      error: {
        errorName: typedError.name ?? "Unknown error",
        code: typedError.errors[0]?.code ?? "UNKNOWN_ERROR",
        message: typedError.message ?? "Unknown error occurred",
        longMessage: typedError.errors[0]?.longMessage ?? "",
      },
      status: typedError.status ?? 500,
    };
  }
}
