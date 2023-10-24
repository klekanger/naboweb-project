'use client';

import {
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';

export default function UserInvitationsTable({ invitations }) {
  const statusToNorwegian = {
    pending: 'Venter',
    accepted: 'Akseptert',
    revoked: 'Tilbakekalt',
  };

  return (
    <Table
      aria-label="Tabell med brukere som har fått e-post-invitasjoner"
      className="mb-16"
      layout="auto"
    >
      <TableHeader>
        <TableColumn width={'40%'}>E-post</TableColumn>
        <TableColumn width={'40%'}>Sendt</TableColumn>
        <TableColumn width={'20%'}>Status</TableColumn>
      </TableHeader>
      <TableBody emptyContent={'Ingen brukere'}>
        {(invitations &&
          invitations.map((invitation) => (
            <TableRow key={invitation.id} className="text-left">
              <TableCell>{invitation.email}</TableCell>
              <TableCell>
                {new Date(invitation.createdAt).toLocaleDateString('nb-NO')}
              </TableCell>
              <TableCell>{statusToNorwegian[invitation.status]}</TableCell>
            </TableRow>
          ))) ||
          []}
      </TableBody>
    </Table>
  );
}
