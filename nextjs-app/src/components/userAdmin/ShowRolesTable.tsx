"use client";

import { SidebarMenu, UserAdminContext } from "@/context/userAdminContext";
import { UserTableProps, UserWithEmails } from "@/types/types";
import { Tooltip } from "@heroui/react";
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
      <div className="mb-8 overflow-x-auto">
        <p className="text-left text-lg mb-2">
          <strong>
            <Crown className="inline mr-2" /> Administratorer
          </strong>
        </p>
        <table
          className="w-full min-w-[640px] border-collapse text-sm"
          aria-label="Tabell med oversikt over adminbrukere"
        >
          <thead>
            <tr>
              <th className="bg-brand-primary/20 text-sm font-bold md:text-base p-3 text-left w-[50%]">
                Navn
              </th>
              <th className="bg-brand-primary/20 text-sm font-bold md:text-base p-3 text-left">
                E-post
              </th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((user, index) => (
              <tr
                key={user?.id}
                className={`text-left group ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : ""}`}
                onClick={() => {
                  const userToEdit = users.find((u) => u.id === user.id);
                  setSelectedUser(userToEdit as UserWithEmails);
                  setSelectedMenu(SidebarMenu.EDIT_USER);
                }}
              >
                <td className="group-hover:bg-brand-black/10 cursor-pointer p-3">
                  <Tooltip
                    content="Klikk for å redigere"
                    delay={2000}
                    placement="right-end"
                  >
                    <span>{`${user?.firstName} ${user?.lastName}`}</span>
                  </Tooltip>
                </td>
                <td className="group-hover:bg-brand-black/10 cursor-pointer p-3">
                  {user?.email}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-16 overflow-x-auto">
        <p className="text-left text-lg mb-2">
          <strong>
            <Edit className="inline mr-2" />
            Redaktører
          </strong>
        </p>
        <table
          className="w-full min-w-[640px] border-collapse text-sm"
          aria-label="Tabell med oversikt over redaktører"
        >
          <thead>
            <tr>
              <th className="bg-brand-primary/20 text-sm font-bold md:text-base p-3 text-left w-[50%]">
                Navn
              </th>
              <th className="bg-brand-primary/20 text-sm font-bold md:text-base p-3 text-left">
                E-post
              </th>
            </tr>
          </thead>
          <tbody>
            {editorUsers.map((user, index) => (
              <tr
                key={user?.id}
                className={`text-left group ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : ""}`}
                onClick={() => {
                  const userToEdit = users.find((u) => u.id === user.id);
                  setSelectedUser(userToEdit as UserWithEmails);
                  setSelectedMenu(SidebarMenu.EDIT_USER);
                }}
              >
                <td className="group-hover:bg-brand-black/10 cursor-pointer p-3">
                  <Tooltip
                    content="Klikk for å redigere"
                    delay={2000}
                    placement="right-end"
                  >
                    <span>{`${user?.firstName} ${user?.lastName}`}</span>
                  </Tooltip>
                </td>
                <td className="group-hover:bg-brand-black/10 cursor-pointer p-3">
                  {user?.email}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
