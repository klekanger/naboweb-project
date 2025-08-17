import BackButton from "@/components/BackButton";
import UserAdmin from "@/components/userAdmin/UserAdmin";
import { validRoles, validateUserRoles } from "@/lib/validateUserRoles";
import type { PaginationData, UserWithEmails } from "@/types/types";
import { clerkClient } from "@clerk/nextjs/server";
import type { UserResource } from "@clerk/types";
import { Button } from "@heroui/button";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const MAX_USERS_PER_PAGE = 30;

function calculatePaginationData(
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

async function fetchUsers(page: number = 1, searchQuery?: string) {
  const client = await clerkClient();

  try {
    if (searchQuery) {
      // Use global search when search query is provided
      const { data: users, totalCount } = await client.users.getUserList({
        query: searchQuery,
        limit: 50, // Show more results for search
      });

      // For search results, we don't use pagination
      const paginationData = {
        currentPage: 1,
        totalPages: 1,
        totalCount,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      return {
        userData: {
          users,
          pagination: paginationData,
          hasAccess: true,
          isSearchResult: true,
        },
      };
    } else {
      // Use pagination when no search query
      const offset = (page - 1) * MAX_USERS_PER_PAGE;

      const { data: users, totalCount } = await client.users.getUserList({
        limit: MAX_USERS_PER_PAGE,
        offset,
      });

      const paginationData = calculatePaginationData(
        page,
        totalCount,
        MAX_USERS_PER_PAGE,
      );

      return {
        userData: {
          users,
          pagination: paginationData,
          hasAccess: true,
          isSearchResult: false,
        },
      };
    }
  } catch (error) {
    console.error("Something went wrong:", error);
    return {
      userData: {
        users: [],
        pagination: calculatePaginationData(page, 0, 10),
        hasAccess: false,
        isSearchResult: false,
      },
    };
  }
}

function mapUsersWithEmails(user: UserResource) {
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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const isAdmin = await validateUserRoles({
    requiredRoles: [validRoles.ADMIN],
  });

  if (!isAdmin) {
    return (
      <div className="mt-32 flex justify-center">
        <p>Du er ikke administrator</p>
      </div>
    );
  }

  const params = await searchParams;
  const pageParam = params.page;
  const searchParam = params.search;
  let page = 1;
  let searchQuery: string | undefined;

  if (pageParam) {
    const parsedPage = parseInt(
      Array.isArray(pageParam) ? pageParam[0] : pageParam,
      10,
    );
    if (isNaN(parsedPage) || parsedPage < 1) {
      redirect("/user-admin-page?page=1");
    }
    page = parsedPage;
  }

  if (searchParam) {
    searchQuery = Array.isArray(searchParam) ? searchParam[0] : searchParam;
    // When searching, always go to page 1
    page = 1;
  }

  const { userData } = await fetchUsers(page, searchQuery);

  if (!userData.hasAccess) {
    return (
      <div className="mt-32 text-center">
        <p>Noe gikk galt</p>
        <Button as={Link} href="/min-side/" startContent={<ArrowBigLeft />}>
          Gå tilbake
        </Button>
      </div>
    );
  }

  // Validate page number against total pages and redirect if invalid
  if (
    userData.pagination &&
    page > userData.pagination.totalPages &&
    userData.pagination.totalPages > 0
  ) {
    redirect("/user-admin-page?page=1");
  }

  const users = userData.users;
  const usersWithEmails: UserWithEmails[] = (
    users as unknown as UserResource[]
  ).map(mapUsersWithEmails);

  return (
    <div className="text-center">
      <h1 className="mb-8 text-center text-4xl lg:text-5xl font-semibold">
        Administrer brukere
      </h1>

      <div className="base:py-24">
        <UserAdmin
          users={usersWithEmails}
          pagination={userData.pagination}
          isSearchResult={userData.isSearchResult}
        />
      </div>
      <div className="pt-8 flex justify-start">
        <BackButton buttonLink="/min-side" />
      </div>
    </div>
  );
}
