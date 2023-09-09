'use client';

import { useAuth } from '@clerk/clerk-react';
import type { Invitation, User } from '@clerk/nextjs/dist/types/server';
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
import { useEffect, useState } from 'react';

const statusToNorwegian = {
  pending: 'Venter',
  accepted: 'Akseptert',
  revoked: 'Tilbakekalt',
};

export default function UserAdmin() {
  const [invitations, setInvitations] = useState<Invitation[]>();
  const [users, setUsers] = useState<User[]>();
  const [errorMsg, setErrorMsg] = useState<string>('');

  // get the access token
  const { getToken, isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <h1>Du har ikke tilgang</h1>;
  }

  const fetchData = async () => {
    const token = await getToken({ template: 'gartnerihagen' });

    try {
      const res = await fetch('/api/invitations', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setErrorMsg(res.statusText);
        throw new Error(
          `Failed to fetch users (status: ${res.status} ${res.statusText})`
        );
      } else {
        setErrorMsg('');
      }

      const data = await res.json();
      setInvitations(data.invitations);
      setUsers(data.users);
    } catch (error) {
      // Handle the error here
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (errorMsg !== '') {
    return <h1>{errorMsg}</h1>;
  }

  if (!invitations || !users) {
    return (
      <div className="mt-32 flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="mb-8 text-center">Administrer brukere</h1>
      <div className="flex flex-col justify-start gap-4 pl-6 md:flex-row">
        <Button>Inviter ny bruker</Button>
        <Button>Tilbakekall invitasjon</Button>
        <Button>Tildel rolle</Button>
        <Button>Slett bruker</Button>
      </div>
      <h2 className="mb-8 mt-16 pl-6 text-left text-base font-semibold">
        Alle brukere med konto:
      </h2>
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
          {(users &&
            users.map((user) => (
              <TableRow key={user.id} className="text-left">
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.emailAddresses[0].emailAddress}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('nb-NO')}
                </TableCell>
              </TableRow>
            ))) ||
            []}
        </TableBody>
      </Table>
      <h2 className="mb-8 mt-16 pl-6 text-left text-base font-semibold">
        Disse brukerne har fått invitasjon:
      </h2>
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
                <TableCell>{invitation.emailAddress}</TableCell>
                <TableCell>
                  {new Date(invitation.createdAt).toLocaleDateString('nb-NO')}
                </TableCell>
                <TableCell>{statusToNorwegian[invitation.status]}</TableCell>
              </TableRow>
            ))) ||
            []}
        </TableBody>
      </Table>
    </div>
  );
}
