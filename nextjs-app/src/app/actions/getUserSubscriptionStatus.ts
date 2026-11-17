"use server";

import { getUserWithRole, RESIDENT_ROLES, rolesOf } from "@/lib/requireRole";
import { sanityFetch } from "@/sanity/lib/live";
import { userSubscriptionStatusQuery } from "@/sanity/lib/queries";

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
  const user = await getUserWithRole(RESIDENT_ROLES);

  if (!user) {
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }

  if (!rolesOf(user).includes("admin") && userId !== user.id) {
    return {
      error: { message: "Unauthorized" },
      status: 403,
    };
  }

  if (!userId) {
    return {
      error: { message: "User id missing" },
      status: 400,
    };
  }

  try {
    const { data } = await sanityFetch({
      query: userSubscriptionStatusQuery,
      params: { id: userId },
      perspective: "published",
      stega: false,
    });

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
