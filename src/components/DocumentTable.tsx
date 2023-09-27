'use client';

import { formatDate } from '@/lib/format-date';
import type { DocumentTableProps } from '@/types/types';
import {
  Button,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { ArrowBigLeft } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function DocumentTable({
  documents,
  rowsPerPage = 10,
  startPage = 1,
}: DocumentTableProps) {
  const [page, setPage] = useState(startPage);
  const { items } = documents || {};

  if (!documents || !documents.items) {
    return (
      <>
        <p>Ingen dokumenter</p>
        <Button as={Link} href="/informasjon/1" startContent={<ArrowBigLeft />}>
          Gå tilbake
        </Button>
      </>
    );
  }

  const pages = Math.ceil(documents.total / rowsPerPage);

  const itemsToRender = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return items.slice(start, end);
  }, [page, items]);

  return (
    <>
      <Table
        className="mb-16"
        isStriped
        bottomContent={
          pages > 1 && (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          )
        }
      >
        <TableHeader>
          <TableColumn
            className="bg-brand-primary/20 text-sm font-bold md:text-lg"
            width={'60%'}
          >
            Filnavn
          </TableColumn>
          <TableColumn
            className="bg-brand-primary/20 text-sm font-bold md:text-lg"
            width={'20%'}
          >
            Opprettet
          </TableColumn>
          <TableColumn
            className="bg-brand-primary/20 text-sm font-bold md:text-lg"
            width={'20%'}
          >
            Oppdatert
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent={'Ingen elementer å vise'}>
          {(itemsToRender
            ? itemsToRender.map((item) => (
                <TableRow key={item.sys.id} className="text-left">
                  <TableCell>
                    <Link
                      href={item.url}
                      className="hover:text-brand-secondary/80 hover:dark:text-brand-white/80"
                    >
                      {item.title}
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
// TODO: Add infinate pagination: https://nextui.org/docs/components/table#infinite-pagination
