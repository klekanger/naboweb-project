import MeetingMinutesDetails from "@/components/document-library/MeetingMinutesDetails";
import {
  generateStaticIdPages,
  generateStaticSlugs,
} from "@/sanity/loader/generateStaticSlugs";
import {
  loadMeetingMinutes,
  loadMeetingMinutesById,
} from "@/sanity/loader/loadQuery";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

type Props = {
  params: { meeting: string };
};

//
// Generate all possible routes
//
export function generateStaticParams() {
  return generateStaticIdPages("fileMeetingMinutes");
}

//
// Generate the meeting minutes details page
//
export default async function PageMeetingMinutesDetailsRoute({
  params,
}: Props) {
  const initial = await loadMeetingMinutesById(params?.meeting);

  /* if (draftMode().isEnabled) {
    return <h1>draftmode - fiks dette!</h1>;
  }
 */
  if (!initial.data) {
    notFound();
  }

  return <MeetingMinutesDetails data={initial.data} />;
}
