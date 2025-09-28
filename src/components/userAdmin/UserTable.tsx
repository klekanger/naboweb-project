"use client";

import { getUser } from "@/app/actions/getUser";
import DeleteUserModal from "@/components/userAdmin/DeleteUserModal";
import ShowUserModal from "@/components/userAdmin/ShowUserModal";
import { useUser } from "@clerk/nextjs";
import { SidebarMenu, UserAdminContext } from "@/context/userAdminContext";
import {
  UserWithEmails,
  type ShowUserProps,
  type UserTableProps,
} from "@/types/types";
import { Input } from "@heroui/input";
import {
  Button,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { MoreVertical, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAuthorsByIds } from "@/sanity/lib/getAuthorsByIds";
import type { Authors } from "@/types/sanity.types";

const CircleAdmin = () => (
  <Tooltip content="Administrator">
    <span className="rounded-full bg-danger/30 w-[1em] h-[1em] justify-center items-center p-2.5 inline-flex text-[1em] mr-1">
      A
    </span>
  </Tooltip>
);

const CircleEditor = () => (
  <Tooltip content="Redaktør">
    <span className="rounded-full bg-warning/30 w-[1em] h-[1em] justify-center items-center p-2.5 inline-flex text-[1em]">
      R
    </span>
  </Tooltip>
);

export default function UserTable({
  users,
  pagination,
  isSearchResult = false,
  ...rest
}: UserTableProps & { isSearchResult?: boolean }) {
  const router = useRouter();
  const { setSelectedMenu, setSelectedUser } = useContext(UserAdminContext);

  const modalViewUser = useDisclosure();
  const modalDeleteUser = useDisclosure();
  const modalErrorMessage = useDisclosure();
  const { user: myUser } = useUser();

  const [userDataToShowOrDelete, setUserDataToShowOrDelete] =
    useState<ShowUserProps>({
      firstName: "",
      lastName: "",
      email: "",
      createdAt: null,
      imageUrl: "",
      lastSignInAt: null,
      roles: [],
    });
  const [globalSearchValue, setGlobalSearchValue] = useState("");
  const [isPaginating, setIsPaginating] = useState(false);

  useEffect(() => {
    setIsPaginating(false);
  }, [pagination?.currentPage, users]);

  const showUserWithIdModal = async (id: string) => {
    const userDataFromId = await getUser(id);

    if ("error" in userDataFromId) {
      console.error("Something went wrong:", userDataFromId.error);
      return;
    }

    if ("success" in userDataFromId) {
      const { success } = userDataFromId;
      setUserDataToShowOrDelete(success?.user);
      modalViewUser.onOpen();
    }

    modalErrorMessage.onOpen();
  };

  const [usersInClerkAndSanity, setUsersInClerkAndSanity] = useState<Authors[]>(
    [],
  );
  useEffect(() => {
    async function fetchClerkUsersInSanity() {
      if (!users || users.length === 0) return;
      const ids = users.map((u) => u.id);
      try {
        const authors: Authors[] = await getAuthorsByIds(ids);
        setUsersInClerkAndSanity(authors);
      } catch (error) {
        console.error("Error fetching authors from Sanity:", error);
      }
    }
    fetchClerkUsersInSanity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!users) {
    return null;
  }

  const sortedUsers = useMemo(() => {
    let sortedUsers = [...users];

    // Sort users by last name, then first name
    sortedUsers.sort((a, b) => {
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

    return sortedUsers;
  }, [users]);

  const onGlobalSearchChange = useCallback((value?: string) => {
    if (value) {
      setGlobalSearchValue(value);
    } else {
      setGlobalSearchValue("");
    }
  }, []);

  const onGlobalSearchClear = useCallback(() => {
    setGlobalSearchValue("");
    // Navigate back to the main page without search
    const url = new URL(window.location.href);
    url.searchParams.delete("search");
    url.searchParams.set("page", "1");
    router.push(url.toString());
  }, [router]);

  const handleGlobalSearch = useCallback(() => {
    if (globalSearchValue.trim()) {
      const url = new URL(window.location.href);
      url.searchParams.set("search", globalSearchValue.trim());
      url.searchParams.delete("page");
      router.push(url.toString());
    }
  }, [globalSearchValue, router]);

  const handleGlobalSearchKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleGlobalSearch();
      }
    },
    [handleGlobalSearch],
  );

  const handleEditUser = (user: UserWithEmails) => () => {
    setSelectedUser(user);
    setSelectedMenu(SidebarMenu.EDIT_USER);
  };

  const handlePageChange = (newPage: number) => {
    setIsPaginating(true);
    const url = new URL(window.location.href);
    url.searchParams.set("page", newPage.toString());
    router.push(url.toString());
  };

  //
  // Update email subscription in Sanity
  //
  function handleUpdateEmailSubscription(
    user: UserWithEmails,
    isSubscribed: boolean,
  ): React.ChangeEventHandler<HTMLInputElement> | undefined {
    return async () => {
      // Optimistically update UI
      setUsersInClerkAndSanity((prev) =>
        prev.map((a) =>
          a._id === user.id ? { ...a, emailSubscription: !isSubscribed } : a,
        ),
      );

      try {
        const result = await fetch("/api/user/email-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            subscribe: !isSubscribed,
          }),
        });
        const data = await result.json();
        if (!result.ok) {
          // Rollback if error
          setUsersInClerkAndSanity((prev) =>
            prev.map((a) =>
              a._id === user.id ? { ...a, emailSubscription: isSubscribed } : a,
            ),
          );
          console.error("Kunne ikke oppdatere e-post-abonnement", data);
        }
      } catch (error) {
        // Rollback UI if error
        setUsersInClerkAndSanity((prev) =>
          prev.map((a) =>
            a._id === user.id ? { ...a, emailSubscription: isSubscribed } : a,
          ),
        );
        console.error("Kunne ikke oppdatere e-post-abonnement", error);
      }
    };
  }

  const topContent = useMemo(() => {
    return (
      <div className="space-y-4">
        {/* Global Search */}
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Søk etter bruker"
            type="search"
            startContent={<SearchIcon />}
            value={globalSearchValue}
            onClear={onGlobalSearchClear}
            onValueChange={onGlobalSearchChange}
            onKeyDown={handleGlobalSearchKeyPress}
            className="flex-1"
          />
          <Button
            color="primary"
            onPress={handleGlobalSearch}
            isDisabled={!globalSearchValue.trim()}
          >
            Søk
          </Button>
        </div>

        <div className="pl-2 text-left">
          {isSearchResult && (
            <span>
              <span className="font-semibold">Søkeresultater:</span>{" "}
              {sortedUsers.length} brukere funnet
            </span>
          )}
        </div>
      </div>
    );
  }, [
    globalSearchValue,
    onGlobalSearchChange,
    handleGlobalSearch,
    handleGlobalSearchKeyPress,
    onGlobalSearchClear,
    sortedUsers.length,
    isSearchResult,
  ]);

  return (
    <div className={rest?.className ?? ""}>
      <Table
        className="mb-16"
        shadow="none"
        isCompact
        aria-label={
          isSearchResult
            ? `Tabell med globale søkeresultater`
            : "Tabell med oversikt over brukere"
        }
        topContent={topContent}
        bottomContent={
          !isSearchResult &&
          pagination &&
          pagination.totalPages > 1 && (
            <div className="flex justify-center my-8">
              <Pagination
                total={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                showControls
                color="primary"
                size="lg"
                radius="md"
                isDisabled={isPaginating}
                classNames={{
                  base: "gap-2",
                  item: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
                  cursor: "bg-blue-600 text-white border-blue-600",
                }}
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
          <TableColumn className="hidden bg-brand-primary/20 text-sm font-bold sm:table-cell md:text-base">
            Roller
          </TableColumn>

          <TableColumn className="hidden bg-brand-primary/20 text-sm font-bold sm:table-cell md:text-base">
            Varsling
          </TableColumn>

          <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
            Oppgaver
          </TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            isSearchResult
              ? "Ingen brukere funnet i søket. Prøv andre søkeord."
              : "Ingen brukere"
          }
          isLoading={isPaginating}
          loadingContent={<Spinner />}
        >
          {sortedUsers.map((user) => {
            let roles;
            if (Array.isArray(user.roles)) {
              roles = user.roles
                .map((role) =>
                  role === "admin" ? (
                    <CircleAdmin key={`${user.id}-admin`} />
                  ) : role === "editor" ? (
                    <CircleEditor key={`${user.id}-editor`} />
                  ) : null,
                )
                .sort();
            }

            const isCurrentUser = myUser?.id === user.id;

            // Find the author object in Sanity for this user
            const author = usersInClerkAndSanity.find((a) => a._id === user.id);
            const isSubscribed = author?.emailSubscription === true;

            return (
              <TableRow key={user.id} className="text-left">
                <TableCell>
                  {`${user.firstName} ${user.lastName}`}
                  {isCurrentUser && (
                    <span className="text-brand-dark-danger"> (Deg)</span>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">{roles}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Checkbox
                    isSelected={isSubscribed}
                    onChange={handleUpdateEmailSubscription(user, isSubscribed)}
                    aria-label={
                      isSubscribed
                        ? "Avslutt e-postvarsling"
                        : "Abonner på e-postvarsling"
                    }
                  />
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
                      disabledKeys={isCurrentUser ? ["delete_user"] : []}
                    >
                      <DropdownItem
                        key="show_user"
                        onPress={() => {
                          setUserDataToShowOrDelete({
                            firstName: "",
                            lastName: "",
                            email: "",
                            createdAt: null,
                            imageUrl: "",
                            lastSignInAt: null,
                            roles: [],
                          });
                          modalViewUser.onOpen();
                          showUserWithIdModal(user.id);
                        }}
                      >
                        Vis
                      </DropdownItem>
                      <DropdownItem
                        key="edit_user"
                        onPress={handleEditUser(user)}
                      >
                        Rediger
                      </DropdownItem>
                      <DropdownItem
                        key="delete_user"
                        onPress={() => {
                          modalDeleteUser.onOpen();
                          setUserDataToShowOrDelete({
                            ...userDataToShowOrDelete,
                            id: user?.id,
                            firstName: user?.firstName ?? "",
                            lastName: user?.lastName ?? "",
                            email: user?.email ?? "",
                            imageUrl: user?.imageUrl,
                          });
                        }}
                      >
                        Slett
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            );
          }) || []}
        </TableBody>
      </Table>

      <ShowUserModal
        userDataToShow={userDataToShowOrDelete}
        onClose={modalViewUser.onClose}
        isOpen={modalViewUser.isOpen}
        onOpenChange={modalViewUser.onOpenChange}
      />

      <DeleteUserModal
        userDataToDelete={userDataToShowOrDelete}
        onClose={modalDeleteUser.onClose}
        isOpen={modalDeleteUser.isOpen}
        onOpenChange={modalDeleteUser.onOpenChange}
      />
    </div>
  );
}
