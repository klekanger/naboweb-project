"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { getUserWithRole, RESIDENT_ROLES, rolesOf } from "@/lib/requireRole";

type UpdateSubscriptionParams = {
  userId: string;
  isSubscribed: boolean;
};

type UpdateSubscriptionResponse = {
  success?: {
    emailSubscription: boolean;
    message: string;
  };
  error?: {
    message: string;
    details?: string;
  };
  status: number;
};

const client = await clerkClient();

export async function updateSubscriptionStatus({
  userId,
  isSubscribed,
}: UpdateSubscriptionParams): Promise<UpdateSubscriptionResponse> {
  const user = await getUserWithRole(RESIDENT_ROLES);

  if (!user) {
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }

  const isAdmin = rolesOf(user).includes("admin");
  if (!isAdmin && userId !== user.id) {
    return {
      error: { message: "Unauthorized" },
      status: 403,
    };
  }

  if (!userId) {
    return {
      error: {
        message: "UserId missing",
      },
      status: 400,
    };
  }

  try {
    const userWhoWasUpdated = await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        emailSubscription: isSubscribed,
      },
    });

    const newSubscriptionStatus =
      userWhoWasUpdated?.publicMetadata?.emailSubscription;

    if (newSubscriptionStatus !== isSubscribed) {
      return {
        error: { message: "Could not update subscription state" },
        status: 500,
      };
    }

    return {
      success: {
        emailSubscription: newSubscriptionStatus,
        message: `Successfully ${newSubscriptionStatus ? "enabled" : "disabled"} email subscription`,
      },
      status: 200,
    };
  } catch (error) {
    return {
      error: {
        message: "Failed to update subscription status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      status: 500,
    };
  }
}
