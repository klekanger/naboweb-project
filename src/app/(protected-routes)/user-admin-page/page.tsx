import UserAdmin from "@/components/userAdmin/UserAdmin";
import type { UserWithRoles, UserWithEmails } from "@/types/types";
import { clerkClient, currentUser } from "@clerk/nextjs";
import { Button } from "@nextui-org/react";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";

async function checkIfAdmin() {
  const currentUserData: UserWithRoles | null = await currentUser();
  const roles = currentUserData?.publicMetadata?.roles;

  return roles?.includes("admin") ?? false;
}

async function fetchUsers() {
  try {
    const userList: UserWithRoles[] = await clerkClient.users.getUserList({
      limit: 500, // We're getting the maximum allowed by ClerkJS, as we want to be able to search locally for users on the client.
      // Minimize the number of API requests using the free version of Clerk.
      // Considering filtering users on the server later (https://clerk.com/docs/references/backend/user/get-user-list )
    });

    return {
      userData: {
        users: userList,
        hasAccess: true,
      },
    };
  } catch (error) {
    console.error("Something went wrong:", error);
    return {
      userData: {
        users: [],
        hasAccess: false,
      },
    };
  }
}

function mapUsersWithEmails(user: UserWithRoles) {
  return {
    id: user.id,
    createdAt: user.createdAt,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.publicMetadata.roles,
    email: user.emailAddresses[0].emailAddress,
  };
}

export default async function Page() {
  const isAdmin = await checkIfAdmin();

  if (!isAdmin) {
    return (
      <div className="mt-32 flex justify-center">
        <p>Du er ikke administrator</p>
      </div>
    );
  }

  const { userData } = await fetchUsers();

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

  const users = userData.users;

  const usersWithEmails: UserWithEmails[] = users.map(mapUsersWithEmails);

  return (
    <div className="text-center">
      <h1 className="mb-8 text-center">Administrer brukere</h1>

      <div className="base:py-24">
        <UserAdmin users={usersWithEmails} />
      </div>
    </div>
  );
}
