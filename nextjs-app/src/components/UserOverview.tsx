import CustomButton from "@/components/CustomButton";
import RoleDisplay from "@/components/userAdmin/RoleDisplay";
// import { getUserSubscriptionStatus } from "@/app/actions/getUserSubscriptionStatus";
import { currentUserRoles } from "@/lib/currentUserRoles";
import type { UserOverviewProps } from "@/types/types";
import SubscriptionStatus from "./SubscriptionStatus";

export default async function UserOveview({
  user,
  ...rest
}: UserOverviewProps) {
  if (!user) {
    console.warn("No user");
    return null;
  }

  const initialSubscriptionStatus =
    user?.publicMetadata?.emailSubscription ?? false;

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

        <SubscriptionStatus
          userId={user.id}
          initialSubscriptionStatus={initialSubscriptionStatus}
        />

        <div className="flex gap-4">
          <div>
            <b>Roller:</b>
          </div>
          <RoleDisplay roles={roles} />
        </div>

        <div className="my-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-fit not-prose justify-left">
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
                href="https://gartnerihagen.sanity.studio/"
                buttonText="Rediger innhold"
                className="w-40"
              />

              <CustomButton
                href="https://gartnerihagen.sanity.studio/structure/fileOtherDocuments"
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
