'use client';
import UserCard from '@/components/user-card';
import { UserProfile, useUser } from '@auth0/nextjs-auth0/client';
import { Avatar, Chip, ChipProps } from '@nextui-org/react';
import { User as UserImg } from 'lucide-react';

type FriendlyUserRole = {
  role: string;
  friendlyName: string;
  color: ChipProps['color'];
};

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
