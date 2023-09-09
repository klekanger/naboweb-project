'use client';

import UserCard from '@/components/UserCard';
import { UserProfile, useUser } from '@clerk/nextjs';
import { Spinner } from '@nextui-org/react';

export default function MyPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!user) return <div>Not authenticated</div>;

  return (
    <div className="flex  flex-col items-center">
      <h1 className="text-center">Min side</h1>

      {isSignedIn ? (
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
