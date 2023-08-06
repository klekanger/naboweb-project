'use client';

import ServiceBox from '@/components/servicebox';

import { useUser } from '@auth0/nextjs-auth0/client';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  const { user, isLoading } = useUser();

  return (
    <>
      <div className="rounded-md border border-dashed border-brand-black border-opacity-60 p-4 pt-8">
        <p className="h-10 pl-1 font-light">
          {user ? (
            <>
              <span>
                <b>Du er innlogget som: </b>
              </span>
              {user?.name || ''}
            </>
          ) : (
            <span>
              <RefreshCw className="animate-spin text-brand-primaryLight" />
            </span>
          )}
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link className={`h-16 font-semibold`} href="/min-side">
            Gå til Min side
          </Link>
        </div>
        <ServiceBox />
      </div>
      <div className="bg-primaryLight break-words rounded-md px-4 pb-12 pt-8 text-gray-900">
        <h1 className="mb-6 text-5xl font-bold text-slate-950">
          Informasjon fra styret
        </h1>
        <p className="text-lg text-gray-700">
          På denne siden finner du nyttig informasjon fra styret. Ta kontakt
          hvis det er noe du savner, eller har tilbakemeldinger.
        </p>
      </div>
    </>
  );
}
