"use client";

import { formatDate } from "@/lib/format-date";
import type {
  ReturnTypeForUserError,
  ReturnTypeForUserSuccess,
  UsersWithEmails,
} from "@/types/types";
import { Input } from "@nextui-org/input";
import {
  Avatar,
  AvatarGroup,
  AvatarIcon,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";

import { MoreVertical, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import RoleDisplay from "./RoleDisplay";

const ROWS_PER_PAGE = 10;

type UserTableProps = {
  users: UsersWithEmails[];
  className?: string;
};

export default function UserTable({ users, ...rest }: UserTableProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [page, setPage] = useState(1);
  const [userDataToSHow, setUserDataToSHow] = useState({});
  const [filterValue, setFilterValue] = useState("");
  const hasSearchFilter = Boolean(filterValue);

  async function showUserWithId(id: string) {
    const userDataFromId = await fetchUserWithId(id);

    if ("error" in userDataFromId) {
      console.error("Something went wrong:", userDataFromId.error);
      toast.error(`Noe gikk galt: ${userDataFromId.error}`);
      return;
    }

    setUserDataToSHow(userDataFromId);
    onOpen();
  }

  if (!users) {
    return null;
  }

  const pages = Math.ceil(users.length / ROWS_PER_PAGE);

  const filteredUsers = useMemo(() => {
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(filterValue.toLowerCase()),
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
      setFilterValue("");
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
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
          className="w-full sm:max-w-[44%]"
        />
        <div className="pl-2 pt-4 text-left">
          <span className="font-semibold">Antall brukere:</span>{" "}
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
    <div className={rest?.className ?? ""}>
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
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Navn
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            E-post
          </TableColumn>
          <TableColumn className="hidden bg-brand-primary/20 text-sm font-bold sm:table-cell md:text-base">
            Opprettet
          </TableColumn>
          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Oppgaver
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent={"Ingen brukere"}>
          {usersToRender.map((user) => (
            <TableRow key={user.id} className="text-left">
              <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {new Date(user.createdAt).toLocaleDateString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <MoreVertical className="text-default-300" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    closeOnSelect={true}
                    aria-label="Meny for brukeroperasjoner"
                  >
                    <DropdownItem
                      key="show_user"
                      onPress={() => {
                        showUserWithId(user.id);
                      }}
                    >
                      Vis
                    </DropdownItem>
                    <DropdownItem key="edit_user">Rediger</DropdownItem>
                    <DropdownItem key="delete_user">Slett</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          )) || []}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-row gap-4">
                <Avatar src={userDataToSHow?.image} />
                <div className="text-xl self-center">{`${userDataToSHow?.firstName} ${userDataToSHow?.lastName}`}</div>
              </ModalHeader>
              <ModalBody>
                <section>
                  <div className="flex flex-row gap-4">
                    <div className="w-1/3">
                      <strong>E-post:</strong>
                    </div>
                    <div> {userDataToSHow?.email}</div>
                  </div>
                  <div className="flex flex-row gap-4">
                    <div className="w-1/3">
                      <strong>Opprettet:</strong>
                    </div>
                    <div>{formatDate(userDataToSHow?.createdAt)}</div>
                  </div>
                  <div className="flex flex-row gap-4">
                    <div className="w-1/3">
                      <strong>Sist innlogget:</strong>
                    </div>
                    <div>
                      {formatDate(userDataToSHow?.lastSignInAt) || "Aldri"}
                    </div>
                  </div>
                  <div className="flex flex-row gap-4 mt-8">
                    <div className="w-1/3">
                      <strong>Roller:</strong>
                    </div>
                    <div>
                      <RoleDisplay roles={userDataToSHow?.roles} />
                    </div>
                  </div>
                </section>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                  }}
                >
                  Tilbake
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Toaster position="bottom-center" />
    </div>
  );
}

async function fetchUserWithId(
  id: string,
): Promise<ReturnTypeForUserSuccess | ReturnTypeForUserError | {}> {
  let userData = {};

  try {
    const res = await fetch("/api/get-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userToFetch: id,
      }),
    });

    const data: ReturnTypeForUserSuccess | ReturnTypeForUserError =
      (await res.json()) || {
        error: "Kunne ikke hente brukerdata.",
      };

    if ("error" in data) {
      return data;
    } else {
      if ("success" in data) {
        const { user } = data;

        userData = {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.emailAddresses[0]?.emailAddress,
          createdAt: user?.createdAt,
          image: user.imageUrl,
          lastSignInAt: user.lastSignInAt,
          roles: user.publicMetadata?.roles,
        };

        return userData;
      }
    }

    return {};
  } catch (error) {
    console.error("Something went wrong:", error);
    return {
      error: "Kunne ikke hente brukerdata.",
    };
  }
}
