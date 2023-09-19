import AlertUser from '@/components/AlertUser';
import DocumentTable from '@/components/DocumentTable';
import { getPageWithId } from '@/lib/api';
import { currentUser } from '@clerk/nextjs';

import Link from 'next/link';

export default async function Page() {
  const user = await currentUser();

  if (!user) return <div>Not authenticated</div>;

  const data = await getPageWithId('7PSsSBGU8MnlNvPIem8ij');

  let documents;
  if (!documents) {
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
      <h1>Dokumenter</h1>
      <DocumentTable documents={documents} />
    </section>
  );
}
