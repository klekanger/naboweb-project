import CustomButton from "@/components/CustomButton";
import RoleDisplay from "@/components/userAdmin/RoleDisplay";
import { type UserCardProps } from "@/types/types";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import Link from "next/link";

export default function UserOveview({ user, ...rest }: UserCardProps) {
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
      <div className={`prose lg:prose-xl ${rest?.className}`}>
        <p>
          <b>Velkommen, {`${firstName} ${lastName}`}!</b>
        </p>
        <p>
          På denne siden kan du administrere kontoen din. Hvis du er
          administrator kan du også redigere innhold og administrere brukere på
          Gartnerihagens nettsider.
        </p>

        <div className="flex gap-4">
          <div>
            <b className="text-lg">Roller:</b>
          </div>
          <RoleDisplay roles={roles} />
        </div>

        <div className="my-8 flex flex-row gap-4 not-prose m-full justify-left">
          {isAdmin && (
            <CustomButton
              href="/user-admin-page"
              buttonText="Brukeradmin"
              className="w-40"
            />
          )}
          {isEditor && (
            <CustomButton
              href="/"
              buttonText="Rediger innhold"
              className="w-40"
            />
          )}

          {/* TODO Implement e-mail notifactions */}
          {/*  <CustomButton href="/" buttonText="Slå av e-post-varsling" /> */}
        </div>
      </div>
    </>
  );
}
