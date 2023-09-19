import { UserResource } from '@clerk/types';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  type ChipProps,
} from '@nextui-org/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type FriendlyUserRole = {
  role: string;
  friendlyName: string;
  color: ChipProps['color'];
};

type UserCardProps = {
  user: UserResource;
  className?: string;
};

export default function UserCard({ user, ...rest }: UserCardProps) {
  const router = useRouter();
  if (!user) {
    console.warn('No user');
    return null;
  }

  const { fullName } = user;
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  const isAdmin = roles.includes('admin') || false;
  const isEditor = roles.includes('editor') || false;

  const friendlyUserRoles: FriendlyUserRole[] = [
    {
      role: 'admin',
      friendlyName: 'Administrator',
      color: 'danger',
    },
    {
      role: 'editor',
      friendlyName: 'Redaktør',
      color: 'warning',
    },
    {
      role: 'user',
      friendlyName: 'Bruker',
      color: 'success',
    },
  ];

  const friendlyUserRoleNames = roles.map((role) => {
    const friendlyRole = friendlyUserRoles.find((r) => r.role === role);

    return {
      name: friendlyRole?.friendlyName || 'Bruker',
      color: friendlyRole?.color || 'primary',
    };
  });

  return (
    <>
      <div className={rest?.className}>
        <Card
          classNames={{
            /* base: 'md:mx-24', */
            base: 'mypage-card',
          }}
        >
          <CardHeader className="justify-between ">
            <div className="mx-2 flex flex-col items-start justify-center gap-1">
              <p>
                <b>Velkommen, {fullName}!</b>
              </p>
              <p>
                På denne siden kan du administrere kontoen din. Hvis du er
                administrator kan du også redigere innhold og administrere
                brukere på Gartnerihagens nettsider.
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex gap-5 ">
              <div>
                <b className="text-lg">Roller:</b>
              </div>
              <div className="flex flex-row flex-wrap items-center justify-start gap-2">
                {roles.length === 0 ? (
                  <Chip size="sm" color="primary">
                    Ingen roller
                  </Chip>
                ) : (
                  friendlyUserRoleNames.map((role, i) => (
                    <Chip key={`chip-${i}`} size="sm" color={role.color}>
                      {role.name}
                    </Chip>
                  ))
                )}
              </div>
            </div>
            <Divider className="mb-8 mt-4" />

            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
              {isAdmin && (
                <Button
                  onClick={() => router.push('/user-admin-page')}
                  size="lg"
                  color="primary"
                  className="bg-primary duration-100 transition hover:bg-primary-600"
                >
                  Brukeradmin
                </Button>
              )}
              {isEditor && (
                <Button
                  as={Link}
                  href="/"
                  size="lg"
                  color="primary"
                  className="bg-primary duration-100 transition hover:bg-primary-600"
                >
                  Rediger innhold
                </Button>
              )}
              <Button
                as={Link}
                href="/"
                size="lg"
                color="primary"
                className="bg-primary duration-100 transition hover:bg-primary-600"
              >
                Slå av e-post-varsling
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
