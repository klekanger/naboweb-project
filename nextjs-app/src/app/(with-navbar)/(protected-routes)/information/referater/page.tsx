import DocumentCollectionPage from "@/components/document-library/DocumentCollectionPage";
import MeetingMinutes from "@/components/document-library/MeetingMinutes";
import { sanityFetch } from "@/sanity/lib/live";
import NotLoggedIn from "@/components/NotLoggedIn";
import { getUserWithRole, RESIDENT_ROLES } from "@/lib/requireRole";
import { meetingMinutesQuery } from "@/sanity/lib/queries";

export default async function Page() {
  // Check the role here, not only in the layout, and before fetching data.
  if (!(await getUserWithRole(RESIDENT_ROLES))) return <NotLoggedIn />;

  const { data: documents } = await sanityFetch({
    query: meetingMinutesQuery,
  });

  return (
    <DocumentCollectionPage title="Dokumenter fra årsmøter" documents={documents}>
      <MeetingMinutes documents={documents ?? []} />
    </DocumentCollectionPage>
  );
}
