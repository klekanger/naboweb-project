"use client";

import DeleteUserModal from "@/components/userAdmin/DeleteUserModal";
import ShowUserModal from "@/components/userAdmin/ShowUserModal";
import { fetchUserWithId } from "@/lib/fetchUserWithId";
import { type ShowUserProps, type UserTableProps } from "@/types/types";
import { Input } from "@nextui-org/input";
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
} from "@nextui-org/react";
import { MoreVertical, SearchIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const ROWS_PER_PAGE = 15;

export default function UserTable({ users, ...rest }: UserTableProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const modalViewUser = useDisclosure();
  const modalEditUser = useDisclosure();
  const modalDeleteUser = useDisclosure();
  const modalErrorMessage = useDisclosure();

  const [page, setPage] = useState(1);
  const [userDataToShow, setUserDataToShowOrDelete] = useState<ShowUserProps>({
    firstName: "",
    lastName: "",
    email: "",
    createdAt: "",
    image: "",
    lastSignInAt: "",
    roles: [],
  });
  const [filterValue, setFilterValue] = useState("");
  const hasSearchFilter = Boolean(filterValue);

  const showUserWithIdModal = async (id: string) => {
    const userDataFromId = await fetchUserWithId(id);

    if ("error" in userDataFromId) {
      console.error("Something went wrong:", userDataFromId.error);

      return;
    }

    setUserDataToShowOrDelete(userDataFromId);
    modalViewUser.onOpen();
    onOpen();
  };

  if (!users) {
    return null;
  }

  const pages = Math.ceil(users.length / ROWS_PER_PAGE);

  const filteredUsers = useMemo(() => {
    let filteredUsers = [...users];

    // Sort users by last name, then first name
    filteredUsers.sort((a, b) => {
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    // Search for users if search field is not empty
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    return filteredUsers;
  }, [users, filterValue, hasSearchFilter]);

  const usersToRender = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;

    return filteredUsers.slice(start, end);
  }, [page, filteredUsers]);

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
  }, [filterValue, onSearchChange, filteredUsers.length]);

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
                      onClick={() => {
                        setUserDataToShowOrDelete({
                          firstName: "",
                          lastName: "",
                          email: "",
                          createdAt: "",
                          image: "",
                          lastSignInAt: "",
                          roles: [],
                        });
                        modalViewUser.onOpen();
                        showUserWithIdModal(user.id);
                      }}
                    >
                      Vis
                    </DropdownItem>
                    <DropdownItem key="edit_user">Rediger</DropdownItem>
                    <DropdownItem
                      key="delete_user"
                      onClick={() => {
                        modalDeleteUser.onOpen();
                        setUserDataToShowOrDelete({
                          ...userDataToShow,
                          id: user?.id,
                          firstName: user?.firstName ?? "",
                          lastName: user?.lastName ?? "",
                          email: user?.email ?? "",
                        });
                        onOpen();
                      }}
                    >
                      Slett
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          )) || []}
        </TableBody>
      </Table>

      <ShowUserModal
        userDataToShow={userDataToShow}
        onClose={modalViewUser.onClose}
        isOpen={modalViewUser.isOpen}
        onOpenChange={modalViewUser.onOpenChange}
      />

      <DeleteUserModal
        userDataToDelete={userDataToShow}
        onClose={modalDeleteUser.onClose}
        isOpen={modalDeleteUser.isOpen}
        onOpenChange={modalDeleteUser.onOpenChange}
      />
    </div>
  );
}
