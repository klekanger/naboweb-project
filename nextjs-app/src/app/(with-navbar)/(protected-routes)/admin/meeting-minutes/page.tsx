import AdminEditPageShell from "@/components/admin/AdminEditPageShell";
import MeetingMinutesManager from "@/components/admin/MeetingMinutesManager";
import { FILE_LIST_POSTS_PER_PAGE } from "@/lib/constants";
import { groqSliceRange, totalPagesFromCount } from "@/lib/pagination";
import { client } from "@/sanity/lib/client";
import {
  countMeetingMinutesAdminQuery,
  meetingMinutesAdminPagedQuery,
} from "@/sanity/lib/queries";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function pageNumberFromSearchParam(value: string | string[] | undefined): number {
  if (!value) return 1;
  if (Array.isArray(value)) return 1;
  if (!/^\d+$/.test(value)) return 1;
  const pageNumber = Number(value);
  if (pageNumber < 1) return 1;
  return pageNumber;
}

export default async function AdminMeetingMinutesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const pageNumber = pageNumberFromSearchParam(params.page);
  const totalMinutes = await client.fetch(countMeetingMinutesAdminQuery);
  const totalPages = totalPagesFromCount(totalMinutes, FILE_LIST_POSTS_PER_PAGE);

  if (pageNumber > totalPages) {
    const targetPage =
      totalPages <= 1
        ? "/admin/meeting-minutes"
        : `/admin/meeting-minutes?page=${totalPages}`;
    redirect(targetPage);
  }

  const minutes = await client.fetch(
    meetingMinutesAdminPagedQuery,
    groqSliceRange(pageNumber, FILE_LIST_POSTS_PER_PAGE),
  );

  return (
    <AdminEditPageShell
      title="Møtereferater"
      backHref="/admin"
      description="Last opp og administrer referater fra møter og årsmøter."
    >
      <MeetingMinutesManager
        initialMinutes={minutes ?? []}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    </AdminEditPageShell>
  );
}
