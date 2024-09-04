import CustomButton from "@/components/CustomButton";
import RoleDisplay from "@/components/userAdmin/RoleDisplay";
import { currentUserRoles } from "@/lib/currentUserRoles";
import { type UserCardProps } from "@/types/types";

export default function UserOveview({ user, ...rest }: UserCardProps) {
  if (!user) {
    console.warn("No user");
    return null;
  }

  const { firstName, lastName } = user;
  const { isAdmin, isEditor } = currentUserRoles(user);
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  return (
    <>
      <div className={`prose lg:prose-xl ${rest?.className}`}>
        <p>
          <b>Velkommen, {`${firstName} ${lastName}`}!</b>
        </p>
        <p>
          På denne siden kan du administrere kontoen din. Hvis du er
          administrator kan du også redigere innhold og administrere brukere som
          skal ha tilgang til de lukkede områdene av nettsidene.
        </p>

        <div className="flex gap-4">
          <div>
            <b>Roller:</b>
          </div>
          <RoleDisplay roles={roles} />
        </div>

        <div className="my-8 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-fit not-prose justify-left">
          {isAdmin && (
            <CustomButton
              href="/user-admin-page"
              buttonText="Brukeradmin"
              className="w-40"
            />
          )}
          {isEditor && (
            <>
              <CustomButton
                href="/studio"
                asLink={false}
                buttonText="Rediger innhold"
                className="w-40"
              />

              <CustomButton
                href="/studio/structure/fileOtherDocuments"
                asLink={false}
                buttonText="Last opp filer"
                className="w-40"
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
