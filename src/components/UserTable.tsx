'use client';

import type { UserWithRoles, UsersWithEmails } from '@/types/types';
import { Input } from '@nextui-org/input';
import { Pagination } from '@nextui-org/react';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/table';

import { Crown, SearchIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

const ROWS_PER_PAGE = 20;

type UserTableProps = {
  users: UsersWithEmails[];
  className?: string;
};

export default function UserTable({ users, ...rest }: UserTableProps) {
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState('');
  const hasSearchFilter = Boolean(filterValue);

  if (!users) {
    return null;
  }

  const pages = Math.ceil(users.length / ROWS_PER_PAGE);

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

  const usersToRender = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;

    return filteredUsers.slice(start, end);
  }, [page, filteredUsers, ROWS_PER_PAGE]);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div>
        <Input
          placeholder="Søk etter bruker..."
          type="search"
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={() => setFilterValue('')}
          onValueChange={onSearchChange}
          className="w-full sm:max-w-[44%]"
        />
        <div className="pl-2 pt-4 text-left">
          <span className="font-semibold">Antall brukere:</span>{' '}
          {filteredUsers.length.toString()}
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    filteredUsers.length,
    hasSearchFilter,
    ROWS_PER_PAGE,
  ]);

  return (
    <div className={rest?.className ?? ''}>
      <Table
        className="mb-16"
        shadow="none"
        aria-label="Tabell med oversikt over brukere"
        topContent={topContent}
        bottomContent={
          pages > 1 && (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                isDisabled={hasSearchFilter}
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
            width={'40%'}
            className="bg-brand-primary/20 text-sm font-bold md:text-base"
          >
            Navn
          </TableColumn>
          <TableColumn
            width={'40%'}
            className="bg-brand-primary/20 text-sm font-bold md:text-base"
          >
            E-post
          </TableColumn>
          <TableColumn
            width={'20%'}
            className="hidden bg-brand-primary/20 text-sm font-bold sm:table-cell md:text-base"
          >
            Opprettet
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent={'Ingen brukere'}>
          {usersToRender.map((user) => (
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
