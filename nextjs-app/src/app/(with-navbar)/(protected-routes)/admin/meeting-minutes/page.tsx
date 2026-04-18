import BackButton from "@/components/BackButton";
import MeetingMinutesManager from "@/components/admin/MeetingMinutesManager";
import { client } from "@/sanity/lib/client";
import { allMeetingMinutesAdminQuery } from "@/sanity/lib/queries";

export default async function AdminMeetingMinutesPage() {
  const minutes = await client.fetch(allMeetingMinutesAdminQuery);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold mb-2">Møtereferater</h1>
      <p className="text-foreground/60 mb-8">
        Last opp og administrer referater fra møter og årsmøter.
      </p>

      <MeetingMinutesManager initialMinutes={minutes ?? []} />

      <div className="mt-10">
        <BackButton buttonLink="/admin" />
      </div>
    </div>
  );
}
