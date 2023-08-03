'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile, useUser } from '@auth0/nextjs-auth0/client';
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

      <Avatar className="m-auto h-32 w-32">
        <AvatarImage src={user?.picture || ''} />
        <AvatarFallback>
          <UserImg />
        </AvatarFallback>
      </Avatar>
      <p>
        <b>Du er innlogget som:</b> {user?.name || ''}
      </p>
      <p>
        <b>Epost:</b> {user?.email || ''}
      </p>
      <p>
        <b>Roller:</b> {userRoles.join(', ')}
      </p>
    </div>
  );
}
