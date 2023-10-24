'use client';

import type { UserWithRoles, UsersWithEmails } from '@/types/types';
import { Input } from '@nextui-org/input';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/table';

import { SearchIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

type UserTableProps = {
  users: UsersWithEmails[];
  className?: string;
};

export default function UserTable({ users, ...rest }: UserTableProps) {
  const [filterValue, setFilterValue] = useState('');
  const hasSearchFilter = Boolean(filterValue);
  console.log('[UserTable] users', users);
  if (!users) {
    return null;
  }

  const filteredUsers = useMemo(() => {
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          (user.email &&
            user.email.toLowerCase().includes(filterValue.toLowerCase())) ||
          (user.firstName &&
            user.firstName.toLowerCase().includes(filterValue.toLowerCase())) ||
          (user.lastName &&
            user.lastName.toLowerCase().includes(filterValue.toLowerCase()))
      );
    }
    return filteredUsers;
  }, [users, filterValue]);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue('');
    }
  }, []);

  return (
    <div className={rest?.className ?? ''}>
      <Table
        className="mb-16"
        shadow="none"
        aria-label="Tabell med oversikt over brukere"
        topContent={
          <Input
            placeholder="Søk etter bruker..."
            type="search"
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => setFilterValue('')}
            onValueChange={onSearchChange}
            className="w-full pb-4 sm:max-w-[44%]"
          />
        }
        classNames={{
          thead: '',
        }}
      >
        <TableHeader>
          <TableColumn width={'40%'}>Navn</TableColumn>
          <TableColumn width={'40%'}>E-post</TableColumn>
          <TableColumn width={'20%'} className="hidden sm:table-cell">
            Opprettet
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent={'Ingen brukere'}>
          {filteredUsers.map((user) => (
            <TableRow key={user.id} className="text-left">
              <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {new Date(user.createdAt).toLocaleDateString('nb-NO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </TableCell>
            </TableRow>
          )) || []}
        </TableBody>
      </Table>
    </div>
  );
}
