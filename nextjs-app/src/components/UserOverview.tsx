import RoleDisplay from "@/components/userAdmin/RoleDisplay";
// import { getUserSubscriptionStatus } from "@/app/actions/getUserSubscriptionStatus";
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
  const roles = (user?.publicMetadata?.roles as string[]) || [];

  return (
    <>
      <div className={`prose lg:prose-xl ${rest?.className}`}>
        <p>
          <b>Velkommen, {`${firstName} ${lastName}`}!</b>
        </p>
        <p>
          På denne siden administrerer du kontoen din, for eksempel
          e-postvarsling og profil.{" "}
          {`${roles.includes("admin") || roles.includes("editor") ? "Innloggede administratorer og redaktører finner verktøy for innhold og brukere under Admin i menylinjen." : ""}`}
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
      </div>
    </>
  );
}
