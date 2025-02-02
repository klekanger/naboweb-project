"use server";

import { clientWithWriteAccess } from "@/sanity/lib/client";
import { currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { loadUserSubscriptionStatus } from "@/sanity/loader/loadQuery";

export async function updateSubscriptionStatus(
  userId: string,
  isSubscribed: boolean,
) {
  // Validate that we have a write token
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
    return NextResponse.json({
      error: { message: "Unauthorized" },
      status: 401,
    });
  }

  try {
    const { data } = await loadUserSubscriptionStatus(userId);

    if (!data) {
      console.error("No subscription data found for userId:", userId);
      return {
        error: { message: "No subscription data found" },
        status: 404,
      };
    }

    const emailSubscription = data.emailSubscription ?? false;
    console.log("Current subscription status:", { userId, emailSubscription });

    try {
      // Validate the user document exists before attempting to patch
      const userDoc = await clientWithWriteAccess.getDocument(userId);
      if (!userDoc) {
        console.error("User document not found in Sanity:", userId);
        return {
          error: { message: "User not found in database" },
          status: 404,
        };
      }

      const result = await clientWithWriteAccess
        .patch(userId)
        .set({
          emailSubscription: !emailSubscription,
        })
        .commit();

      console.log("Sanity write result:", result);

      return {
        success: {
          emailSubscription: !emailSubscription,
          message: "Successfully updated subscription status",
        },
        status: 200,
      };
    } catch (writeError) {
      console.error("Error writing to Sanity:", {
        error: writeError,
        errorMessage:
          writeError instanceof Error ? writeError.message : "Unknown error",
        errorStack: writeError instanceof Error ? writeError.stack : undefined,
        userId,
        attemptedValue: !emailSubscription,
        token: process.env.SANITY_API_WRITE_TOKEN ? "Present" : "Missing",
        clientConfig: {
          projectId: clientWithWriteAccess.config().projectId,
          dataset: clientWithWriteAccess.config().dataset,
          apiVersion: clientWithWriteAccess.config().apiVersion,
        },
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
      errorStack: error instanceof Error ? error.stack : undefined,
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
