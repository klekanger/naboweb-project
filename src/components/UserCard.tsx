import CustomButton from "@/components/CustomButton";
import RoleDisplay from "@/components/userAdmin/RoleDisplay";
import { type UserCardProps } from "@/types/types";
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
                <CustomButton
                  href="/user-admin-page"
                  buttonText="Brukeradmin"
                />
              )}
              {isEditor && (
                <CustomButton href="/" buttonText="Rediger innhold" />
              )}

              {/* TODO Implement e-mail notifactions */}
              {/*  <CustomButton href="/" buttonText="Slå av e-post-varsling" /> */}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
