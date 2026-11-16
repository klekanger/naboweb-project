import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type Role = "user" | "editor" | "admin";

export const RESIDENT_ROLES: Role[] = ["user"];
export const CMS_ROLES: Role[] = ["admin", "editor"];
export const ADMIN_ROLES: Role[] = ["admin"];

function rolesOf(user: Awaited<ReturnType<typeof currentUser>>): string[] {
  const roles = user?.publicMetadata?.roles;
  return Array.isArray(roles) ? roles.filter((r) => typeof r === "string") : [];
}

/**
 * Returns the signed-in Clerk user if they have at least one of `roles`,
 * otherwise null.
 *
 * Call this at the top of every protected page, before fetching protected
 * data. Layout checks alone are not enough: Next.js can serve a page segment
 * without running its layouts (partial rendering on navigation, prerendered
 * segment prefetches). Calling it first also makes the page dynamic, so
 * protected content is never baked into a prerendered segment.
 */
export async function getUserWithRole(roles: Role[]) {
  const user = await currentUser();
  if (!user) return null;

  const userRoles = rolesOf(user);
  return roles.some((role) => userRoles.includes(role)) ? user : null;
}

/** Like getUserWithRole, but redirects to the front page when access is denied. */
export async function requireRoleOrRedirect(roles: Role[], to = "/") {
  const user = await getUserWithRole(roles);
  if (!user) redirect(to);
  return user;
}
