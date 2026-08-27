import BackButton from "@/components/BackButton";
import UserAdmin from "@/components/userAdmin/UserAdmin";
import { calculatePaginationData } from "@/lib/pagination";
import { mapUsersWithEmails } from "@/lib/userUtils";
import { validRoles, validateUserRoles } from "@/lib/validateUserRoles";
import type { UserWithEmails } from "@/types/types";
import { clerkClient, type User } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const MAX_USERS_PER_PAGE = 30;
const MAX_USERS_FOR_SEARCH = 50;
/** Clerk caps `getUserList` at 500 users per request. */
const CLERK_MAX_LIMIT = 500;
const SUPER_USER_ROLES = ["admin", "editor"];

/**
 * Fetches every user with an elevated role.
 *
 * Clerk cannot filter `getUserList` on `publicMetadata`, so we page through all
 * users and filter locally. This must stay independent of the paginated list
 * shown in the user table — filtering that page-sized slice would hide any
 * superuser who happens to fall outside the current page.
 */
async function fetchSuperUsers(): Promise<UserWithEmails[]> {
  const client = await clerkClient();
  const superUsers: UserWithEmails[] = [];
  let offset = 0;

  try {
    while (true) {
      const { data } = await client.users.getUserList({
        limit: CLERK_MAX_LIMIT,
        offset,
      });

      superUsers.push(
        ...(data as unknown as User[])
          .map(mapUsersWithEmails)
          .filter((user) =>
            user.roles.some((role) => SUPER_USER_ROLES.includes(role)),
          ),
      );

      // A short page means we reached the end
      if (data.length < CLERK_MAX_LIMIT) break;
      offset += data.length;
    }
  } catch (error) {
    console.error("Something went wrong:", error);
    throw new Error("Error fetching users");
  }

  // Same ordering as the user table: last name, then first name
  return superUsers.sort((a, b) => {
    const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
    const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}

async function fetchUsers(page: number = 1, searchQuery?: string) {
  const client = await clerkClient();
  try {
    if (searchQuery) {
      // Use global search when search query is provided
      const { data: users, totalCount } = await client.users.getUserList({
        query: searchQuery,
        limit: MAX_USERS_FOR_SEARCH,
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
        pagination: calculatePaginationData(page, 0, MAX_USERS_PER_PAGE),
        hasAccess: false,
        isSearchResult: false,
      },
    };
  }
}

// fallow-ignore-next-line unused-export
export async function UserAdminContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const isAdmin = await validateUserRoles({
    requiredRoles: [validRoles.ADMIN],
  });

  if (!isAdmin) {
    return (
      <div className="mt-32 flex justify-center" id="no-admin">
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

  let userData;
  let superUsers: UserWithEmails[];
  try {
    const [data, superUserData] = await Promise.all([
      fetchUsers(page, searchQuery),
      fetchSuperUsers(),
    ]);
    if (!data.userData.hasAccess) {
      throw new Error("Error fetching users");
    }
    userData = data.userData;
    superUsers = superUserData;
    // oxlint-disable-next-line no-useless-catch
  } catch (error) {
    throw error; // Let the nearest error boundary handle it (error.tsx)
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
    users as unknown as User[]
  ).map(mapUsersWithEmails);

  return (
    <div className="text-center">
      <h1 className="mb-8 text-center text-4xl lg:text-5xl font-semibold">
        Administrer brukere
      </h1>

      <div className="base:py-24">
        <UserAdmin
          users={usersWithEmails}
          superUsers={superUsers}
          pagination={userData.pagination}
          isSearchResult={userData.isSearchResult}
        />
      </div>
      <div className="pt-8 flex justify-start">
        <BackButton buttonLink="/admin" />
      </div>
    </div>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UserAdminContent searchParams={searchParams} />
    </Suspense>
  );
}
