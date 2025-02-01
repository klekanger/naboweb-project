"use server";

import { clientWithWriteAccess } from "@/sanity/lib/client";
import { currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { loadUserSubscriptionStatus } from "@/sanity/loader/loadQuery";

export async function updateSubscriptionStatus(
  userId: string,
  isSubscribed: boolean,
) {
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("user")) {
    return NextResponse.json({
      error: { message: "Unauthorized" },
      status: 401,
    });
  }

  try {
    const { data } = await loadUserSubscriptionStatus(userId);

    if (!data) {
      return {
        error: { message: "No subscription data found" },
        status: 404,
      };
    }

    const emailSubscription = data.emailSubscription ?? false;

    clientWithWriteAccess
      .patch(userId)
      .set({
        emailSubscription: !emailSubscription,
      })
      .commit();

    return {
      success: {
        emailSubscription: !emailSubscription,
        message: "Successfully updated subscription status",
      },
      status: 200,
    };
  } catch (error) {
    console.error("Error updating subscription status:", error);
    return {
      error: {
        message: "Failed to update subscription status",
      },
      status: 500,
    };
  }
}
