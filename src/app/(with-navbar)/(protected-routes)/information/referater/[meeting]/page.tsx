import MeetingMinutesDetails from "@/components/document-library/MeetingMinutesDetails";
import { generateStaticIdPages } from "@/sanity/loader/generateStaticSlugs";
import { loadMeetingMinutesById } from "@/sanity/loader/loadQuery";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ meeting: string }>;
};

//
// Generate all possible routes
//
export async function generateStaticParams() {
  const meetings = await generateStaticIdPages("fileMeetingMinutes");

  return meetings.map((meeting) => ({ meeting: meeting._id }));
}

//
// Generate the meeting minutes details page
//
export default async function PageMeetingMinutesDetailsRoute(props: Props) {
  const params = await props.params;
  const initial = await loadMeetingMinutesById(params?.meeting);

  if (!initial.data) {
    notFound();
  }

  return <MeetingMinutesDetails data={initial.data} />;
}
