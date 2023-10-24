import UserCard from '@/components/UserCard';
import { UserProfile, currentUser } from '@clerk/nextjs';
import { Spinner } from '@nextui-org/spinner';

export default async function Page() {
  const user = await currentUser();

  if (!user) return <div>Not authenticated</div>;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center">Min side</h1>

      {user ? (
        <>
          <UserCard user={user} className="mb-16" />
          <UserProfile />
        </>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
