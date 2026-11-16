import MeetingMinutesDetails from "@/components/document-library/MeetingMinutesDetails";
import { sanityFetch } from "@/sanity/lib/live";
import { meetingMinutesByIdQuery } from "@/sanity/lib/queries";
import NotLoggedIn from "@/components/NotLoggedIn";
import { getUserWithRole, RESIDENT_ROLES } from "@/lib/requireRole";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ meeting: string }>;
};

//
// Generate the meeting minutes details page
//
export default async function PageMeetingMinutesDetailsRoute(props: Props) {
  // Check the role here, not only in the layout, and before fetching data.
  if (!(await getUserWithRole(RESIDENT_ROLES))) return <NotLoggedIn />;

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
