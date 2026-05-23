export { calculatePaginationData } from "./pagination";

/**
 * Minimal Clerk user shape for list/detail mapping.
 * Covers backend `User` (e.g. `users.getUserList`) and client `UserResource` without requiring identical field types.
 */
type ClerkUserForEmailMapping = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: Date | number | null;
  publicMetadata: unknown;
  emailAddresses: ReadonlyArray<{ emailAddress: string }>;
};

function clerkCreatedAtToMillis(createdAt: Date | number | null): number {
  if (createdAt === null) {
    return 0;
  }
  return createdAt instanceof Date ? createdAt.getTime() : createdAt;
}

export function mapUsersWithEmails(user: ClerkUserForEmailMapping) {
  const publicMetadata = user.publicMetadata as
    | { roles?: unknown; emailSubscription?: unknown }
    | null
    | undefined;

  return {
    id: user.id,
    createdAt: clerkCreatedAtToMillis(user.createdAt),
    firstName: user.firstName,
    lastName: user.lastName,
    roles: (publicMetadata?.roles as string[]) ?? [],
    emailSubscription:
      typeof publicMetadata?.emailSubscription === "boolean"
        ? publicMetadata.emailSubscription
        : undefined,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: user.imageUrl ?? "",
  };
}
