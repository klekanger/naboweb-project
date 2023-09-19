'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';

export default function DocumentTable({ documents = [] }) {
  return (
    <>
      <Table
        aria-label="Tabell med brukere som har fått e-post-invitasjoner"
        className="mb-16"
      >
        <TableHeader>
          <TableColumn width={'40%'}>Navn</TableColumn>
          <TableColumn width={'40%'}>E-post</TableColumn>
          <TableColumn width={'20%'}>Opprettet</TableColumn>
        </TableHeader>
        <TableBody emptyContent={'Ingen brukere'}>
          {(documents &&
            documents.map((document) => (
              <TableRow key={document?.id} className="text-left">
                <TableCell>xxxx</TableCell>
                <TableCell>yyyy</TableCell>
                <TableCell>zzzz</TableCell>
              </TableRow>
            ))) ||
            []}
        </TableBody>
      </Table>
    </>
  );
}
