"use client";

import { getUser } from "@/app/actions/getUser";
import Pagination from "@/components/common/Pagination";
import DeleteUserModal from "@/components/userAdmin/DeleteUserModal";
import ShowUserModal from "@/components/userAdmin/ShowUserModal";
import { useUser } from "@clerk/nextjs";
import { SidebarMenu, UserAdminContext } from "@/context/userAdminContext";
import {
  UserWithEmails,
  type ShowUserProps,
  type UserTableProps,
} from "@/types/types";
import { Checkbox, Dropdown, Label, Spinner, Tooltip } from "@heroui/react";
import { useDisclosure } from "@/hooks/useDisclosure";
import CustomButton from "../CustomButton";
import CustomSearchInput from "../CustomSearchInput";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { updateSubscriptionStatus } from "@/app/actions/updateSubscriptionStatus";

const CircleAdmin = () => (
  <Tooltip delay={0}>
    <Tooltip.Trigger>
      <span className="rounded-full bg-danger/30 w-[1em] h-[1em] justify-center items-center p-2.5 inline-flex text-[1em] mx-1 cursor-help">
        A
      </span>
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>Administrator</p>
    </Tooltip.Content>
  </Tooltip>
);

const CircleEditor = () => (
  <Tooltip delay={0}>
    <Tooltip.Trigger>
      <span className="rounded-full bg-warning/30 w-[1em] h-[1em] justify-center items-center p-2.5 inline-flex text-[1em] mx-1 cursor-help">
        R
      </span>
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>Redaktør</p>
    </Tooltip.Content>
  </Tooltip>
);

export default function UserTable({
  users,
  pagination,
  isSearchResult = false,
  ...rest
}: UserTableProps & { isSearchResult?: boolean }) {
  // Local state for users to allow optimistic UI updates
  const [localUsers, setLocalUsers] = useState(users);
  // Keep localUsers in sync with users prop
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);
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

  if (!localUsers) {
    return null;
  }

  const sortedUsers = useMemo(() => {
    let sortedUsers = [...localUsers];
    // Sort users by last name, then first name
    sortedUsers.sort((a, b) => {
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
    return sortedUsers;
  }, [localUsers]);

  const onGlobalSearchChange = useCallback(
    (value?: string) => {
      const newValue = value || "";
      setGlobalSearchValue(newValue);

      // If the input is cleared, reset the search results
      if (!newValue.trim() && isSearchResult) {
        const url = new URL(window.location.href);
        url.searchParams.delete("search");
        url.searchParams.set("page", "1");
        router.push(url.toString());
      }
    },
    [isSearchResult, router],
  );

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

  const handleUpdateEmailSubscription = async (
    userId: string,
    isSubscribed: boolean,
  ) => {
    // Optimistically update local state
    setLocalUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, emailSubscription: isSubscribed }
          : user,
      ),
    );
    try {
      const response = await updateSubscriptionStatus({
        userId,
        isSubscribed,
      });
      if (response.error) {
        // Rollback on error
        setLocalUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, emailSubscription: !isSubscribed }
              : user,
          ),
        );
        console.error("Failed to update subscription:", response.error);
      }
    } catch (error) {
      // Rollback on error
      setLocalUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, emailSubscription: !isSubscribed }
            : user,
        ),
      );
      console.error("An unexpected error occurred:", error);
    }
  };

  const topContent = useMemo(() => {
    return (
      <div className="space-y-4">
        {/* Global Search */}
        <div className="flex gap-2 max-w-md py-2">
          <CustomSearchInput
            value={globalSearchValue}
            onChange={(value) => onGlobalSearchChange(value || "")}
            placeholder="Søk etter bruker"
            onKeyDown={handleGlobalSearchKeyPress}
          />
          <CustomButton
            variant="primary"
            onPress={() => {
              if (globalSearchValue.trim()) {
                handleGlobalSearch();
              }
            }}
            className={
              !globalSearchValue.trim() ? "opacity-50 cursor-not-allowed" : ""
            }
          >
            Søk
          </CustomButton>
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
      <div className="mb-16">
        {topContent}
        <div className="relative overflow-x-auto">
          <table
            className={`w-full min-w-[640px] border-collapse text-sm ${
              isPaginating ? "opacity-60" : ""
            }`}
            aria-label={
              isSearchResult
                ? `Tabell med globale søkeresultater`
                : "Tabell med oversikt over brukere"
            }
          >
            <thead>
              <tr className="[&>th]:first:rounded-l-lg [&>th]:last:rounded-r-lg text-gray-500">
                <th className="bg-brand-primary/20 text-sm font-bold md:text-base px-3 py-2 text-left">
                  Navn
                </th>
                <th className="bg-brand-primary/20 text-sm font-bold md:text-base px-3 py-2 text-left">
                  E-post
                </th>
                <th className="hidden bg-brand-primary/20 text-sm font-bold sm:table-cell md:text-base px-3 py-2 text-left">
                  Opprettet
                </th>
                <th className="hidden bg-brand-primary/20 text-sm font-bold sm:table-cell md:text-base px-3 py-2 text-left">
                  Roller
                </th>
                <th className="hidden bg-brand-primary/20 text-sm font-bold sm:table-cell md:text-base px-3 py-2 text-left">
                  Varsling
                </th>
                <th className="bg-brand-primary/20 text-sm font-bold md:text-base px-3 py-2 text-left">
                  Oppgaver
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers && sortedUsers.length > 0 ? (
                sortedUsers.map((user, index) => {
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

                  return (
                    <tr
                      key={user.id}
                      className={`text-left ${index === 0 ? "[&>td]:pt-4" : ""}`}
                    >
                      <td className="px-3 py-1">
                        {`${user.firstName} ${user.lastName}`}
                        {isCurrentUser && (
                          <span className="text-brand-dark-danger"> (Deg)</span>
                        )}
                      </td>
                      <td className="px-3 py-1">{user.email}</td>
                      <td className="hidden sm:table-cell px-3 py-1">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "nb-NO",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="hidden sm:table-cell px-3 py-1">
                        <span className="flex">{roles}</span>
                      </td>
                      <td className="hidden sm:table-cell px-3 py-1">
                        <Checkbox
                          isSelected={user?.emailSubscription ?? false}
                          onChange={(isSelected) =>
                            handleUpdateEmailSubscription(user.id, isSelected)
                          }
                        >
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox>
                      </td>
                      <td className="px-3 py-1">
                        <Dropdown>
                          <Dropdown.Trigger>
                            <div
                              className="inline-flex items-center justify-center min-w-0 w-auto h-auto p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                              aria-label="Meny for brukeroperasjoner"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </div>
                          </Dropdown.Trigger>
                          <Dropdown.Popover>
                            <Dropdown.Menu
                              aria-label="Meny for brukeroperasjoner"
                              disabledKeys={
                                isCurrentUser ? ["delete_user"] : []
                              }
                              onAction={(key) => {
                                if (key === "show_user") {
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
                                } else if (key === "edit_user") {
                                  handleEditUser(user)();
                                } else if (key === "delete_user") {
                                  modalDeleteUser.onOpen();
                                  setUserDataToShowOrDelete({
                                    ...userDataToShowOrDelete,
                                    id: user?.id,
                                    firstName: user?.firstName ?? "",
                                    lastName: user?.lastName ?? "",
                                    email: user?.email ?? "",
                                    imageUrl: user?.imageUrl,
                                  });
                                }
                              }}
                            >
                              <Dropdown.Item id="show_user" textValue="Vis">
                                <Label>Vis</Label>
                              </Dropdown.Item>
                              <Dropdown.Item id="edit_user" textValue="Rediger">
                                <Label>Rediger</Label>
                              </Dropdown.Item>
                              <Dropdown.Item
                                id="delete_user"
                                textValue="Slett"
                                variant="danger"
                              >
                                <Label>Slett</Label>
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    {isSearchResult
                      ? "Ingen brukere funnet i søket. Prøv andre søkeord."
                      : "Ingen brukere"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {isPaginating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <Spinner size="md" />
            </div>
          )}
        </div>
        {!isSearchResult && pagination && pagination.totalPages > 1 && (
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
        )}
      </div>

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
