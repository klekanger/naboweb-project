import AlertUser from "@/app/components/AlertUser";
import MeetingMinutes from "@/app/components/document-library/MeetingMinutes";
import { sanityFetch } from "@/sanity/lib/live";
import { meetingMinutesQuery } from "@/sanity/lib/queries";
import Link from "next/link";

export default async function Page() {
  const { data: documents } = await sanityFetch({
    query: meetingMinutesQuery,
  });

  if (!documents) {
    return (
      <section className="flex flex-col justify-center align-middle">
        <AlertUser
          alertTitle="Ingen dokumenter"
          alertMessage="Det ser ikke ut til at det eksisterer noen dokumenter på denne siden. "
        />
        <p className="pl-4 pt-4">
          <Link href="/information">Gå tilbake »</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-center text-2xl md:text-left md:text-4xl prose lg:prose-xl mb-8">
        Dokumenter fra årsmøter
      </h1>
      <MeetingMinutes documents={documents} />
    </section>
  );
}
