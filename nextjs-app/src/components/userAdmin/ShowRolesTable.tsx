"use client";

import { SidebarMenu, UserAdminContext } from "@/context/userAdminContext";
import { UserTableProps, UserWithEmails } from "@/types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { Crown, Edit } from "lucide-react";
import { useContext } from "react";

export default function ShowRolesTable({ users, ...rest }: UserTableProps) {
  const { setSelectedMenu, setSelectedUser } = useContext(UserAdminContext);

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
      <p className="text-sm text-gray-500 italic p-4">
        Klikk brukeren du vil redigere, for eksempel hvis du vil fjerne eller
        legge til en rolle.{" "}
      </p>
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
        onRowAction={(id) => {
          const userToEdit = users.find((user) => user.id === id);
          setSelectedUser(userToEdit as UserWithEmails);
          setSelectedMenu(SidebarMenu.EDIT_USER);
        }}
      >
        <TableHeader>
          <TableColumn
            className="bg-brand-primary/20 text-sm font-bold md:text-base"
            width="50%"
          >
            Navn
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            E-post
          </TableColumn>
        </TableHeader>
        <TableBody>
          {adminUsers.map((user) => (
            <TableRow key={user?.id} className="text-left group">
              <TableCell className="group-hover:bg-brand-black/10 cursor-pointer">
                <Tooltip
                  content="Klikk for å redigere"
                  delay={2000}
                  placement="right-end"
                >
                  <span>{`${user?.firstName} ${user?.lastName}`}</span>
                </Tooltip>
              </TableCell>
              <TableCell className="group-hover:bg-brand-black/10 cursor-pointer">
                {user?.email}
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
        onRowAction={(id) => {
          const userToEdit = users.find((user) => user.id === id);
          setSelectedUser(userToEdit as UserWithEmails);
          setSelectedMenu(SidebarMenu.EDIT_USER);
        }}
        aria-label="Tabell med oversikt over redaktører"
      >
        <TableHeader>
          <TableColumn
            className="bg-brand-primary/20 text-sm font-bold md:text-base"
            width="50%"
          >
            Navn
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            E-post
          </TableColumn>
        </TableHeader>
        <TableBody>
          {editorUsers.map((user) => (
            <TableRow key={user?.id} className="text-left group">
              <TableCell className="group-hover:bg-brand-black/10 cursor-pointer">
                <Tooltip
                  content="Klikk for å redigere"
                  delay={2000}
                  placement="right-end"
                >
                  <span>{`${user?.firstName} ${user?.lastName}`}</span>
                </Tooltip>
              </TableCell>

              <TableCell className="group-hover:bg-brand-black/10 cursor-pointer">
                {user?.email}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
