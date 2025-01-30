import UserOverview from "@/components/UserOverview";
import { UserWithRoles } from "@/types/types";
import { UserProfile } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import type { UserData } from "@clerk/types";
import { Spinner } from "@heroui/spinner";

export default async function Page() {
  const user = (await currentUser()) as UserData;

  return (
    <section className="flex flex-col items-center">
      <h1 className="prose lg:prose-xl text-4xl lg:text-5xl mb-8 font-semibold self-start">
        Min side
      </h1>
      {user ? (
        <div className="self-start w-full">
          <UserOverview user={user as UserWithRoles} className="mb-16" />

          <UserProfile />
        </div>
      ) : (
        <Spinner />
      )}
    </section>
  );
}
