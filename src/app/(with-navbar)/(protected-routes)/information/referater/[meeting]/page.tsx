import MeetingMinutesDetails from "@/components/document-library/MeetingMinutesDetails";
import { sanityFetch } from "@/sanity/lib/live";
import {
  meetingMinutesByIdQuery,
  meetingMinutesIds,
} from "@/sanity/lib/queries";
import { loadMeetingMinutesById } from "@/sanity/loader/loadQuery";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ meeting: string }>;
};

//
// Generate all possible routes
//
export async function generateStaticParams() {
  const { data: meetings } = await sanityFetch({
    query: meetingMinutesIds,
    perspective: "published",
    stega: false,
  });

  return meetings.map((meeting) => ({ meeting: meeting._id }));
}

//
// Generate the meeting minutes details page
//
export default async function PageMeetingMinutesDetailsRoute(props: Props) {
  const params = await props.params;
  const { data } = await sanityFetch({
    query: meetingMinutesByIdQuery,
    params: { meeting: params?.meeting },
  });

  if (!data) {
    notFound();
  }

  return <MeetingMinutesDetails data={data} />;
}
