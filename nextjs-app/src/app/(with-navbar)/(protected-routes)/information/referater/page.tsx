import DocumentCollectionPage from "@/components/document-library/DocumentCollectionPage";
import MeetingMinutes from "@/components/document-library/MeetingMinutes";
import { sanityFetch } from "@/sanity/lib/live";
import { meetingMinutesQuery } from "@/sanity/lib/queries";

export default async function Page() {
  const { data: documents } = await sanityFetch({
    query: meetingMinutesQuery,
  });

  return (
    <DocumentCollectionPage title="Dokumenter fra årsmøter" documents={documents}>
      <MeetingMinutes documents={documents ?? []} />
    </DocumentCollectionPage>
  );
}
