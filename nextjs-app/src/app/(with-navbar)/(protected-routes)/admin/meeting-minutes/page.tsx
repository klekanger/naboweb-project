import AdminEditPageShell from "@/components/admin/AdminEditPageShell";
import MeetingMinutesManager from "@/components/admin/MeetingMinutesManager";
import { getAdminPagedItems } from "@/lib/admin-pagination";
import {
  countMeetingMinutesAdminQuery,
  meetingMinutesAdminPagedQuery,
} from "@/sanity/lib/queries";
import type { ComponentProps } from "react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type MinutesItem = ComponentProps<typeof MeetingMinutesManager>["initialMinutes"][number];

export default async function AdminMeetingMinutesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { items: minutes, pageNumber, totalPages } =
    await getAdminPagedItems<MinutesItem>({
      searchParams,
      countQuery: countMeetingMinutesAdminQuery,
      pagedQuery: meetingMinutesAdminPagedQuery,
      basePath: "/admin/meeting-minutes",
    });

  return (
    <AdminEditPageShell
      title="Møtereferater"
      backHref="/admin"
      description="Last opp og administrer referater fra møter og årsmøter."
    >
      <MeetingMinutesManager
        initialMinutes={minutes}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    </AdminEditPageShell>
  );
}
