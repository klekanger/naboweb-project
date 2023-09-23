import AlertUser from '@/components/AlertUser';
import DocumentTable from '@/components/DocumentTable';
import { getDocuments } from '@/lib/api';
import { currentUser } from '@clerk/nextjs';

import Link from 'next/link';

export default async function Page() {
  const user = await currentUser();

  if (!user) return <div>Not authenticated</div>;

  const { total, items } = await getDocuments();

  if (!items) {
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
      <h1>Dokumenter fra årsmøter</h1>
    </section>
  );
}
