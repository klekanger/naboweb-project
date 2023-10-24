'use client';

import UserTable from '@/components/UserTable';
import type { UserWithRoles, UsersWithEmails } from '@/types/types';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/react';
import { Crown, User, UserPlus2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const CreateUser = () => (
  <section className="flex w-full flex-col gap-4">
    <form className="mb-6 px-1 md:px-4">
      <div className="my-4 flex gap-4">
        <Input id="username" type="text" label="Fornavn">
          Fornavn
        </Input>
        <Input id="username" type="text" label="Etternavn">
          Etternavn
        </Input>
      </div>

      <div className="mb-4">
        <Input className="mt-1" id="email" type="email" label="E-post">
          E-post
        </Input>
      </div>

      <div className="my-8 flex w-full">
        <Button type="submit" className="self-start">
          Opprett bruker
        </Button>
      </div>
    </form>
  </section>
);

const AssignRoles = () => (
  <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
    <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800"></div>
  </main>
);

const menuElements = [
  {
    id: 0,
    name: 'Vis brukere',
    description: `Viser alle brukere som er registrert.<br />Du kan bruke søkefeltet for å finne en bestemt bruker (søker i både e-post og navn).`,
    menuIcon: User,
  },
  {
    id: 1,
    name: 'Ny bruker',
    description: `Opprett en ny bruker.<br />Brukeren vil motta en e-post med informasjon om innlogging.`,
    menuIcon: UserPlus2,
  },
  {
    id: 2,
    name: 'Tildel roller',
    description: `Tildel roller til brukere. Alle har automatisk rollen «bruker». Brukere med «admin»-rolle har tilgang til alle funksjoner. «Redaktør» kan legge til nytt innhold på sidene.`,
    menuIcon: Crown,
  },
];

export default function UserAdmin({ users }: { users: UsersWithEmails[] }) {
  const [selectedMenu, setSelectedMenu] = useState(0);

  return (
    <div className="grid h-screen min-h-screen w-full grid-rows-[auto_1fr] overflow-hidden rounded-large bg-content1 shadow-small lg:grid-cols-[280px_1fr] lg:grid-rows-none">
      <div className="bg-default-100 dark:bg-zinc-800/40 lg:border-r">
        <nav className="flex flex-row lg:flex-col lg:gap-8 lg:px-4 lg:pt-8">
          {menuElements.map((element) => (
            <Button
              key={element.id}
              variant="light"
              onPress={() => setSelectedMenu(element.id)}
              className={`h-24 flex-1 flex-col rounded-none text-sm text-brand-black hover:text-brand-black/80 dark:text-brand-white dark:hover:text-brand-white/80 lg:flex-row lg:border-none ${
                element.id !== 0 && 'border-l border-black/10'
              }`}
            >
              <element.menuIcon />

              {element.id === selectedMenu ? (
                <strong>{element.name}</strong>
              ) : (
                <span>{element.name}</span>
              )}
            </Button>
          ))}
        </nav>
      </div>
      <section className="flex flex-col overflow-auto">
        <p
          className="w-full border-b bg-brand-white px-6 py-8 text-left text-base dark:bg-brand-black"
          dangerouslySetInnerHTML={{
            __html: menuElements[selectedMenu].description,
          }}
        />

        {selectedMenu === 0 && <UserTable users={users} className="lg:px-2" />}
        {selectedMenu === 1 && <CreateUser />}
        {selectedMenu === 2 && <AssignRoles />}
      </section>
    </div>
  );
}
