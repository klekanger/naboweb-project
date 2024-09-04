import AlertUser from "@/components/AlertUser";
import MeetingMinutes from "@/components/document-library/MeetingMinutes";
import { loadMeetingMinutes } from "@/sanity/loader/loadQuery";
import Link from "next/link";

export default async function Page() {
  const documents = await loadMeetingMinutes();

  if (!documents.data) {
    return (
      <section className="container flex flex-col justify-center align-middle">
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
      <MeetingMinutes documents={documents.data} />
    </section>
  );
}
