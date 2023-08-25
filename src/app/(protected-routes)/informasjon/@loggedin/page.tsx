'use client';

import InfoBox from '@/components/info-box';
import ServiceBox from '@/components/servicebox';

import { useUser } from '@auth0/nextjs-auth0/client';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  const { user, isLoading } = useUser();

  return (
    <>
      <div className="mb-16 rounded-md border border-dashed border-brand-black border-opacity-60 p-4 pt-8 dark:border-brand-white">
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
              <RefreshCw className="animate-spin text-brand-default" />
            </span>
          )}
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            className="animate h-16 pl-1 font-semibold duration-100 hover:text-brand-black/70"
            href="/min-side"
          >
            Gå til Min side »
          </Link>
        </div>
        <ServiceBox />
      </div>
      <InfoBox
        title="Informasjon fra styret"
        message="På denne siden finner du nyttig informasjon fra styret. Ta kontakt hvis
        det er noe du savner, eller har tilbakemeldinger."
      />
    </>
  );
}
