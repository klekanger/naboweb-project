import AdminEditPageShell from "@/components/admin/AdminEditPageShell";
import MeetingMinutesManager from "@/components/admin/MeetingMinutesManager";
import { client } from "@/sanity/lib/client";
import { allMeetingMinutesAdminQuery } from "@/sanity/lib/queries";

export default async function AdminMeetingMinutesPage() {
  const minutes = await client.fetch(allMeetingMinutesAdminQuery);

  return (
    <AdminEditPageShell
      title="Møtereferater"
      backHref="/admin"
      description="Last opp og administrer referater fra møter og årsmøter."
    >
      <MeetingMinutesManager initialMinutes={minutes ?? []} />
    </AdminEditPageShell>
  );
}
