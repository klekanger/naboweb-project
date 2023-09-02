'use client';

import UserCard from '@/components/user-card';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function MyPage() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <>
      <h1 className="text-center">Min side</h1>

      <UserCard user={user} />
    </>
  );
}
