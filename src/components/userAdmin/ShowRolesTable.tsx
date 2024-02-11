"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
  Tooltip,
} from "@nextui-org/react";
import { MoreVertical } from "lucide-react";
import { UserTableProps } from "@/types/types";
import { Crown, Edit } from "lucide-react";

export default function ShowRolesTable({ users, ...rest }: UserTableProps) {
  if (!users) {
    return null;
  }

  const adminUsers = users?.filter((user) => {
    if (Array.isArray(user.roles)) {
      return user.roles.includes("admin");
    }
  });

  const editorUsers = users?.filter((user) => {
    if (Array.isArray(user.roles)) {
      return user.roles.includes("editor");
    }
  });

  return (
    <div className={rest?.className ?? ""}>
      <Table
        shadow="none"
        isCompact
        topContent={
          <p className="text-left text-lg">
            <strong>
              <Crown className="inline mr-2" /> Administratorer
            </strong>
          </p>
        }
        aria-label="Tabell med oversikt over adminbrukere"
      >
        <TableHeader>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Navn
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            E-post
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Oppgaver
          </TableColumn>
        </TableHeader>
        <TableBody>
          {adminUsers.map((user) => (
            <TableRow key={user?.id} className="text-left">
              <TableCell>
                {user?.firstName} {user?.lastName}
              </TableCell>
              <TableCell>{user?.email}</TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <MoreVertical />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    closeOnSelect={true}
                    aria-label="Meny for brukeroperasjoner"
                  >
                    <DropdownItem key="edit_roles">Endre roller</DropdownItem>
                    <DropdownItem key="remove_admin">
                      Fjern som admin
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Table
        className="mb-16"
        shadow="none"
        isCompact
        topContent={
          <p className="text-left text-lg">
            <strong>
              <Edit className="inline mr-2" />
              Redaktører
            </strong>
          </p>
        }
        aria-label="Tabell med oversikt over redaktører"
      >
        <TableHeader>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Navn
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            E-post
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Oppgaver
          </TableColumn>
        </TableHeader>
        <TableBody>
          {editorUsers.map((user) => (
            <TableRow key={user?.id} className="text-left">
              <TableCell>
                {user?.firstName} {user?.lastName}
              </TableCell>
              <TableCell>{user?.email}</TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <MoreVertical />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    closeOnSelect={true}
                    aria-label="Meny for brukeroperasjoner"
                  >
                    <DropdownItem key="edit_roles">Endre roller</DropdownItem>
                    <DropdownItem key="remove_admin">
                      Fjern som redaktør
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
