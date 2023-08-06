'use client';
import { UserProfile, useUser } from '@auth0/nextjs-auth0/client';
import { Avatar, AvatarGroup, AvatarIcon } from '@nextui-org/react';
import { User as UserImg } from 'lucide-react';

type User = UserProfile & {
  'https:/gartnerihagen-askim.no/roles': string[];
};

export default function MyPage() {
  const { user, error, isLoading } = useUser();

  if (!user) {
    console.warn('No user');
    return null;
  }

  const userRoles = user['https:/gartnerihagen-askim.no/roles'] || [];
  const isAdmin = userRoles.includes('admin');
  const isEditor = userRoles.includes('editor');

  console.log(user);
  return (
    <div className="flex  flex-col justify-center text-center align-middle">
      <h1>Min side</h1>

      <div className="m-auto mb-8">
        <Avatar src={user?.picture || ''} fallback={<UserImg />} size="lg" />
      </div>
      <p className="font-extralight">
        <b>Du er innlogget som:</b> {user?.name || ''}
        <br />
        <b>Epost:</b> {user?.email || ''}
        <br />
        <b>Roller:</b> {userRoles.join(', ')}
      </p>
    </div>
  );
}
