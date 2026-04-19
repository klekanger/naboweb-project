import type { UserResource } from "@clerk/types";

export { calculatePaginationData } from "./pagination";

export function mapUsersWithEmails(user: UserResource) {
  return {
    id: user.id,
    createdAt: user.createdAt,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: (user.publicMetadata?.roles as string[]) ?? [],
    emailSubscription:
      typeof user.publicMetadata?.emailSubscription === "boolean"
        ? user.publicMetadata.emailSubscription
        : undefined,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: user.imageUrl ?? "",
  };
}
