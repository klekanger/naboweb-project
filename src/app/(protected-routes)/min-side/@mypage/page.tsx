'use client';
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

  const friendlyUserRoles: FriendlyUserRole[] = [
    {
      role: 'admin',
      friendlyName: 'Administrator',
      color: 'danger',
    },
    {
      role: 'editor',
      friendlyName: 'Redaktør',
      color: 'primary',
    },
    {
      role: 'user',
      friendlyName: 'Bruker',
      color: 'success',
    },
  ];

  if (!user) {
    console.warn('No user');
    console.error(error);
    return null;
  }

  const userRoles =
    (user['https:/gartnerihagen-askim.no/roles'] as string[]) || [];

  const friendlyUserRoleNames = userRoles.map((role) => {
    const friendlyRole = friendlyUserRoles.find((r) => r.role === role);

    return {
      name: friendlyRole?.friendlyName || 'Bruker',
      color: friendlyRole?.color || 'primary',
    };
  });

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
      </p>
      <p>
        <b>Rolle{friendlyUserRoleNames.length > 1 ? 'r' : ''}:</b>{' '}
        {friendlyUserRoleNames.map((role, i) => (
          <Chip key={`chip-${i}`} size="sm" color={role.color} className="m-1">
            {role.name}
          </Chip>
        ))}
      </p>
    </div>
  );
}
