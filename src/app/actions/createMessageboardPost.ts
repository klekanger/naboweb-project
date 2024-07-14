"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@sanity/client";

export async function createMessageboardPost() {
  const user = await currentUser();
  const userRoles = (user?.publicMetadata as { roles: string[] }) ?? [];

  if (!user || !userRoles.roles.includes("user")) {
    return {
      error: { message: "Unauthorized" },
      status: 401,
    };
  }
}
