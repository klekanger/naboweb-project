'use client';

import UserCard from '@/components/UserCard';
import { UserProfile, useUser } from '@clerk/nextjs';

export default function MyPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!user) return <div>Not authenticated</div>;

  return (
    <div className="flex  flex-col items-center">
      <h1 className="text-center">Min side</h1>

      <UserCard user={user} className="mb-16" />

      <UserProfile />
    </div>
  );
}
