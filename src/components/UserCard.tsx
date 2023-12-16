import RoleDisplay from "@/components/RoleDisplay";
import { type UserCardProps } from "@/types/types";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import Link from "next/link";

export default function UserCard({ user, ...rest }: UserCardProps) {
  if (!user) {
    console.warn("No user");
    return null;
  }

  const { firstName, lastName } = user;

  const roles = (user?.publicMetadata?.roles as string[]) || [];

  const isAdmin = roles.includes("admin") || false;
  const isEditor = roles.includes("editor") || false;

  return (
    <>
      <div className={rest?.className}>
        <Card
          classNames={{
            base: "mypage-card",
          }}
        >
          <CardHeader className="justify-between ">
            <div className="mx-2 flex flex-col items-start justify-center gap-1">
              <p>
                <b>Velkommen, {`${firstName} ${lastName}`}!</b>
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
              <RoleDisplay roles={roles} />
            </div>
            <Divider className="mb-8 mt-4" />

            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
              {isAdmin && (
                <Button
                  as={Link}
                  href="/user-admin-page"
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
