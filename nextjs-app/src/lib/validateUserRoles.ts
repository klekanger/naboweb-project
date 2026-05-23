import type { UserWithRoles } from "@/types/types";
import { currentUser } from "@clerk/nextjs/server";

export enum validRoles {
  USER = "user",
  ADMIN = "admin",
}

/**
 * Validates if the current user has the required roles.
 * @param {validRoles[]} requiredRoles - The required roles
 * @returns {boolean} - A promise that resolves to a boolean indicating if the user has the required roles.
 *
 * @example <caption>Check if the logged in user has the "user" role:</caption>
 * validateUserRoles({ requiredRoles: [validRoles.USER]});
 *
 * Valid roles are:
 *   validRoles.USER
 *   validRoles.ADMIN
 *   validRoles.EDITOR
 */
export async function validateUserRoles({
  requiredRoles,
}: {
  requiredRoles: validRoles[];
}): Promise<boolean> {
  if (!requiredRoles) return false;

  const currentUserData = (await currentUser()) as UserWithRoles | null;
  const roles = currentUserData?.publicMetadata?.roles;

  if (!roles) return false;

  return requiredRoles?.every((role) => roles?.includes(role));
}
