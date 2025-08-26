import type { PaginationData } from "@/types/types";
import type { UserResource } from "@clerk/types";

export function calculatePaginationData(
  currentPage: number,
  totalCount: number,
  limit: number,
): PaginationData {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
  };
}

export function mapUsersWithEmails(user: UserResource) {
  return {
    id: user.id,
    createdAt: user.createdAt,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: (user.publicMetadata?.roles as string[]) ?? [],
    email: user.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: user.imageUrl ?? "",
  };
}
