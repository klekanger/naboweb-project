"use server";

import { loadUserSubscriptionStatus } from "@/sanity/loader/loadQuery";

export type GetUserSubscriptionStatusReturn = {
  success?: {
    emailSubscription: boolean;
    message: string;
  };
  error?: {
    message: string;
  };
  status: number;
};

export async function getUserSubscriptionStatus(
  userId: string,
): Promise<GetUserSubscriptionStatusReturn> {
  if (!userId) {
    return {
      error: { message: "User id missing" },
      status: 400,
    };
  }

  try {
    const { data } = await loadUserSubscriptionStatus(userId);

    if (!data) {
      return {
        error: { message: "No subscription data found" },
        status: 404,
      };
    }

    return {
      success: {
        emailSubscription: data.emailSubscription ?? false,
        message: "Successfully fetched subscription status",
      },
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return {
      error: {
        message: "Failed to fetch subscription status",
      },
      status: 500,
    };
  }
}
