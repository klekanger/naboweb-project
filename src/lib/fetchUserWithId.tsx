"use client";
import {
  type ReturnTypeForUserError,
  type ReturnTypeForUserSuccess,
  type ShowUserProps,
} from "@/types/types";

export async function fetchUserWithId(
  id: string,
): Promise<ShowUserProps | ReturnTypeForUserError> {
  try {
    const res = await fetch("/api/get-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userToFetch: id,
      }),
    });

    const data: ReturnTypeForUserSuccess | ReturnTypeForUserError =
      (await res.json()) || {
        error: "Kunne ikke hente brukerdata.",
      };

    if ("error" in data) {
      return data;
    } else {
      if ("success" in data) {
        const { user } = data;

        const userData: ShowUserProps = {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.emailAddresses[0]?.emailAddress,
          createdAt: user?.createdAt,
          image: user.imageUrl,
          lastSignInAt: user.lastSignInAt,
          roles: user.publicMetadata?.roles,
        };

        return userData;
      }
    }

    return {
      error: "Noe gikk galt.",
    };
  } catch (error) {
    console.error("Something went wrong:", error);
    return {
      error: "Kunne ikke hente brukerdata.",
    };
  }
}
