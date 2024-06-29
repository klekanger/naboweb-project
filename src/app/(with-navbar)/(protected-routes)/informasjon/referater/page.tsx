import AlertUser from "@/components/AlertUser";
import DocumentMeetingMinutes from "@/components/document-library/MeetingMinutes";
import DocumentTable from "@/components/document-library/DocumentTable";
import NotLoggedIn from "@/components/NotLoggedIn";
import { loadMeetingMinutes } from "@/sanity/loader/loadQuery";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Page() {
  const user = await currentUser();

  if (!user) return <NotLoggedIn />;

  const documents = await loadMeetingMinutes();

  if (!documents.data) {
    return (
      <section className="container flex flex-col justify-center align-middle">
        <AlertUser
          alertTitle="Ingen dokumenter"
          alertMessage="Det ser ikke ut til at det eksisterer noen dokumenter på denne siden. "
        />
        <p className="pl-4 pt-4">
          <Link href="/informasjon">Gå tilbake »</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-center text-2xl md:text-left md:text-4xl prose lg:prose-xl mb-8">
        Dokumenter fra årsmøter
      </h1>
      <DocumentMeetingMinutes documents={documents.data} />
    </section>
  );
}

// TODO We are fetching meeting queries grouped into year
// we have to build a custom component to display the data
