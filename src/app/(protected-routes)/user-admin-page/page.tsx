import UserAdmin from "@/components/UserAdmin";
import type { UserWithRoles, UsersWithEmails } from "@/types/types";
import { clerkClient, currentUser } from "@clerk/nextjs";

async function checkIfAdmin() {
  const currentUserData: UserWithRoles | null = await currentUser();
  const roles = currentUserData?.publicMetadata?.roles;

  return roles?.includes("admin") ?? false;
}

async function fetchUsers() {
  try {
    const userList: UserWithRoles[] = await clerkClient.users.getUserList();

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
        hasAccess: true,
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
      <div className="mt-32 flex justify-center">
        <p>Ingen tilgang.</p>
      </div>
    );
  }

  const users = userData.users;
  const usersWithEmails: UsersWithEmails[] = users.map(mapUsersWithEmails);

  // Temporary test code for testing pagination
  const mockUsers = [];
  for (let i = 1; i <= 200; i++) {
    const randomRole = ["admin", "editor", "user"]
      .map((role) => {
        if (Math.random() > 0.5) {
          return role;
        } else return null;
      })
      .filter((role) => role !== null);

    const user = {
      id: i,
      createdAt: new Date(),
      roles: randomRole,
      firstName: `Firstname ${i}`,
      lastName: `Lastname ${i}`,
      email: `user${i}@example.com`,
    };
    mockUsers.push(user);
  }

  return (
    <div className="text-center">
      <h1 className="mb-8 text-center">Administrer brukere</h1>

      <div className="base:py-24">
        <UserAdmin users={usersWithEmails} />
      </div>
    </div>
  );
}
