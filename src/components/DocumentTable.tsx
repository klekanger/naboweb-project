'use client';

import { formatDate } from '@/lib/format-date';
import type { ContentfulFile } from '@/types/types';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { ArrowBigLeft } from 'lucide-react';
import Link from 'next/link';

export default function DocumentTable({
  documents,
}: {
  documents: ContentfulFile[];
}) {
  console.log('documents', documents);
  return (
    <>
      <Table
        aria-label="Tabell med brukere som har fått e-post-invitasjoner"
        className="mb-16"
        isStriped
      >
        <TableHeader>
          <TableColumn width={'60%'}>Filnavn</TableColumn>
          <TableColumn width={'20%'}>Opprettet</TableColumn>
          <TableColumn width={'20%'}>Oppdatert</TableColumn>
        </TableHeader>
        <TableBody emptyContent={'Ingen brukere'}>
          {(documents
            ? documents.map((item) => (
                <TableRow key={item.sys.id} className="text-left">
                  <TableCell>
                    <Link
                      href={item.url}
                      className="hover:text-brand-black/80 hover:dark:text-brand-white/80"
                    >
                      {item.fileName}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(item.sys.firstPublishedAt)}</TableCell>
                  <TableCell>{formatDate(item.sys.publishedAt)}</TableCell>
                </TableRow>
              ))
            : null) ?? []}
        </TableBody>
      </Table>
      <Button as={Link} href="/informasjon/1" startContent={<ArrowBigLeft />}>
        Gå tilbake
      </Button>
    </>
  );
}

// TODO: Add sorting of table
// TODO: Add pagination
