import { UserProfile } from '@auth0/nextjs-auth0/client';
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  ChipProps,
  Divider,
} from '@nextui-org/react';
import { User as UserImg } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type FriendlyUserRole = {
  role: string;
  friendlyName: string;
  color: ChipProps['color'];
};

export default function UserCard({ user }: { user: UserProfile }) {
  const router = useRouter();
  if (!user) {
    console.warn('No user');
    return null;
  }

  const { email, name, picture } = user;
  const roles = (user['https:/gartnerihagen-askim.no/roles'] as string[]) || [];
  const isAdmin = roles.includes('admin');
  const isEditor = roles.includes('editor');

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
      <Card
        classNames={{
          base: 'md:max-w-[800px] m-auto',
        }}
      >
        <CardHeader className="justify-between ">
          <div className="flex gap-5">
            <Avatar src={picture || ''} fallback={<UserImg />} size="lg" />
            <div className="flex flex-col items-start justify-center gap-1">
              <div>
                <b>{name}</b>
              </div>
              <div>{email}</div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex gap-5 ">
            <div>
              <b className="text-lg">Roller:</b>
            </div>
            <div className="flex flex-row flex-wrap items-center justify-start gap-2">
              {friendlyUserRoleNames.map((role, i) => (
                <Chip key={`chip-${i}`} size="sm" color={role.color}>
                  {role.name}
                </Chip>
              ))}
            </div>
          </div>
          <Divider className="mb-8 mt-4" />

          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            <Button
              as={Link}
              href="/"
              size="lg"
              color="primary"
              className="bg-primary duration-100 transition hover:bg-primary-600"
            >
              Logg ut
            </Button>
            <Button
              as={Link}
              href="/"
              size="lg"
              color="primary"
              className="bg-primary duration-100 transition hover:bg-primary-600"
            >
              Bytt passord
            </Button>
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
    </>
  );
}
