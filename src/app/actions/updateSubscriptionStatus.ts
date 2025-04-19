"use server";

import { clientWithWriteAccess } from "@/sanity/lib/client";
import { USER_SUBSCRIPTION_STATUS_QUERY } from "@/sanity/lib/queries";
import { currentUser } from "@clerk/nextjs/server";

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

export async function updateSubscriptionStatus({
  userId,
  isSubscribed,
}: UpdateSubscriptionParams): Promise<UpdateSubscriptionResponse> {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    return {
      error: { message: "Server configuration error" },
      status: 500,
    };
  }

  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("user")) {
    console.error("Authorization failed:", { user, userRoles });
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }

  try {
    // Get current subscription status directly from Sanity
    const currentData = await clientWithWriteAccess.fetch<{
      emailSubscription: boolean | null;
    }>(USER_SUBSCRIPTION_STATUS_QUERY, { id: userId }, { useCdn: false });

    const currentSubscriptionStatus = currentData?.emailSubscription ?? false;
    const newSubscriptionStatus = !currentSubscriptionStatus;

    try {
      // Create a transaction
      const transaction = clientWithWriteAccess.transaction();

      // Add createIfNotExists to handle new users and patch for existing ones
      // Should not be necessary as NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL is set in clerk redirecting to api/create-sanity-user
      transaction.createIfNotExists({
        _id: userId,
        _type: "authors",
        emailSubscription: newSubscriptionStatus,
      });

      transaction.patch(userId, {
        set: {
          emailSubscription: newSubscriptionStatus,
        },
      });

      // Commit the transaction with a tag for tracking
      await transaction.commit({
        tag: "subscription-update",
      });

      // Verify the update by fetching directly from Sanity with cache disabled
      const updatedData = await clientWithWriteAccess.fetch<{
        emailSubscription: boolean | null;
      }>(
        USER_SUBSCRIPTION_STATUS_QUERY,
        { id: userId },
        { perspective: "published", useCdn: false },
      );

      // Double-check if the value was actually updated
      if (
        !updatedData ||
        typeof updatedData.emailSubscription !== "boolean" ||
        updatedData.emailSubscription !== newSubscriptionStatus
      ) {
        console.error("Subscription status not updated correctly:", {
          expected: newSubscriptionStatus,
          actual: updatedData?.emailSubscription,
        });
        return {
          error: {
            message: "Failed to update subscription status - value mismatch",
          },
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
    } catch (writeError) {
      console.error("Error writing to Sanity:", {
        error: writeError,
        errorMessage:
          writeError instanceof Error ? writeError.message : "Unknown error",
        userId,
      });
      return {
        error: {
          message: "Failed to update subscription status in database",
          details:
            writeError instanceof Error ? writeError.message : "Unknown error",
        },
        status: 500,
      };
    }
  } catch (error) {
    console.error("Error updating subscription status:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      userId,
    });
    return {
      error: {
        message: "Failed to update subscription status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      status: 500,
    };
  }
}
