"use client";

import type { NewUser, UserWithEmails } from "@/types/types";
import { createContext, useState } from "react";

export enum SidebarMenu {
  USERS = 0,
  INVITE_USER = 1,
  CREATE_USER = 2,
  EDIT_USER = 3,
  SHOW_SUPER_USERS = 4,
}

export enum CreateUserScreenType {
  FORM = 0,
  SUCCESS = 1,
  EDIT = 2,
}

type UserAdminContextType = {
  selectedMenu: SidebarMenu;
  setSelectedMenu: React.Dispatch<React.SetStateAction<SidebarMenu>>;
  generalError: string;
  setGeneralError: React.Dispatch<React.SetStateAction<string>>;
  isCreatingUser: boolean;
  setIsCreatingUser: React.Dispatch<React.SetStateAction<boolean>>;
  emailValue: string;
  setEmailValue: React.Dispatch<React.SetStateAction<string>>;
  newUser: NewUser;
  setNewUser: React.Dispatch<React.SetStateAction<NewUser>>;
  newlyCreatedUser: Omit<NewUser, "password">;
  setNewlyCreatedUser: React.Dispatch<
    React.SetStateAction<Omit<NewUser, "password">>
  >;
  screenToDisplay: CreateUserScreenType;
  setScreenToDisplay: React.Dispatch<
    React.SetStateAction<CreateUserScreenType>
  >;
  selectedUser: UserWithEmails | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<UserWithEmails | null>>;
  resetUserAdminContext: () => void;
};

const userAdminInitialValue = {
  selectedMenu: SidebarMenu.USERS,
  generalError: "",
  emailValue: "",
  isCreatingUser: false,
  newUser: {
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roles: ["user"],
    emailSubscription: true,
  },
  newlyCreatedUser: {
    email: "",
    firstName: "",
    lastName: "",
    roles: ["user"],
  },
  screenToDisplay: CreateUserScreenType.FORM,
  selectedUser: null,
  setSelectedUser: () => {},
  setSelectedMenu: () => {},
  setGeneralError: () => {},
  setIsCreatingUser: () => {},
  setEmailValue: () => {},
  setNewUser: () => {},
  setNewlyCreatedUser: () => {},
  setScreenToDisplay: () => {},
  resetUserAdminContext: () => {},
};

export const UserAdminContext = createContext<UserAdminContextType>(
  userAdminInitialValue,
);

//
export default function UserAdminProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [generalError, setGeneralError] = useState("");
  const [selectedMenu, setSelectedMenu] = useState(SidebarMenu.USERS);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithEmails | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roles: ["user"],
    emailSubscription: true,
  });

  const [newlyCreatedUser, setNewlyCreatedUser] = useState<
    Omit<NewUser, "password">
  >({
    email: "",
    firstName: "",
    lastName: "",
    roles: ["user"],
  });

  const [screenToDisplay, setScreenToDisplay] = useState(
    CreateUserScreenType.FORM,
  );

  const resetUserAdminContext = () => {
    setGeneralError("");
    setSelectedMenu(SidebarMenu.USERS);
    setIsCreatingUser(false);
    setEmailValue("");
    setSelectedUser(null);
    setNewUser({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      roles: ["user"],
      emailSubscription: true,
    });
    setNewlyCreatedUser({
      email: "",
      firstName: "",
      lastName: "",
      roles: ["user"],
    });
    setScreenToDisplay(CreateUserScreenType.FORM);
  };

  return (
    <UserAdminContext.Provider
      value={{
        generalError,
        setGeneralError,
        selectedMenu,
        setSelectedMenu,
        isCreatingUser,
        setIsCreatingUser,
        emailValue,
        setEmailValue,
        newUser,
        setNewUser,
        newlyCreatedUser,
        setNewlyCreatedUser,
        screenToDisplay,
        setScreenToDisplay,
        selectedUser,
        setSelectedUser,
        resetUserAdminContext,
      }}
    >
      {children}
    </UserAdminContext.Provider>
  );
}
