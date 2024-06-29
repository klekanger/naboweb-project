// import UserCard from "@/components/UserCard";
import NotLoggedIn from "@/components/NotLoggedIn";
import UserOverview from "@/components/UserOverview";
import { UserProfile } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Spinner } from "@nextui-org/spinner";

export default async function Page() {
  const user = await currentUser();
  if (!user) return <NotLoggedIn />;

  return (
    <section className="flex flex-col items-center">
      <h1 className="prose lg:prose-xl text-4xl lg:text-5xl mb-8 font-semibold self-start">
        Min side
      </h1>
      {user ? (
        <div className="self-start w-full">
          <UserOverview user={user} className="mb-16" />
          <div>
            <UserProfile />
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </section>
  );
}
