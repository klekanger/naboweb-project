"use client";

import UserTable from "@/components/userAdmin/UserTable";
import { errorsToNorwegian } from "@/lib/norwegianErrorMessages";
import type { UserWithEmails, UserWithRoles } from "@/types/types";
import { NewUser } from "@/types/types";
import { createNewUser } from "@/app/actions/createUser";

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { Crown, User, UserPlus2 } from "lucide-react";
import { useMemo, useState } from "react";
import LoadingSpinner from "../LoadingSpinner";
import RoleDisplay from "./RoleDisplay";

const menuElements = [
  {
    id: 0,
    name: "Vis brukere",
    description:
      "Viser alle brukere som er registrert, sortert etter etternavn og deretter fornavn.<br />Du kan bruke søkefeltet for å finne en bestemt bruker (søker i både e-post og navn).",
    menuIcon: User,
  },
  {
    id: 1,
    name: "Ny bruker",
    description:
      "Opprett en ny bruker.<br />Brukeren vil motta en e-post med informasjon om innlogging.",
    menuIcon: UserPlus2,
  },
  {
    id: 2,
    name: "Tildel roller",
    description:
      "Tildel roller til brukere. Alle har automatisk rollen «bruker». Brukere med «admin»-rolle har tilgang til alle funksjoner. «Redaktør» kan legge til nytt innhold på sidene.",
    menuIcon: Crown,
  },
];

enum CreateUserScreenType {
  FORM = 0,
  SUCCESS = 1,
  ERROR = 2,
}

enum SidebarMenu {
  USERS = 0,
  CREATE_USER = 1,
  ASSIGN_ROLES = 2,
}

export default function UserAdmin({ users }: { users: UserWithEmails[] }) {
  const modalCreateUser = useDisclosure();
  const modalErrorMessage = useDisclosure();
  const [generalError, setGeneralError] = useState("");
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [emailValue, setEmailValue] = useState("");

  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roles: ["user"],
  });

  const [newlyCreatedUser, setNewlyCreatedUser] = useState<
    Omit<NewUser, "password">
  >({
    email: "",
    firstName: "",
    lastName: "",
    roles: [],
  });

  const [screenToDisplay, setScreenToDisplay] = useState(
    CreateUserScreenType.FORM,
  );

  const validateEmail = (value: string) =>
    value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const isInvalidEmail = useMemo(() => {
    if (emailValue === "") return false;
    return validateEmail(emailValue) ? false : true;
  }, [emailValue, validateEmail]);

  const validateForm = (user: NewUser) => {
    return (
      validateEmail(user?.email) &&
      user?.firstName !== "" &&
      user?.lastName !== ""
    );
  };

  const AssignRoleForm = () => (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
        <h1>Tildel rolle</h1>
      </div>
    </main>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm(newUser)) {
      modalCreateUser.onOpen();
    } else {
      console.error("not valid");
    }
  };

  // Call the createNewUser server action
  const handleCreateNewUser = async () => {
    setIsCreatingUser(true);
    const response = await createNewUser(newUser);
    setIsCreatingUser(false);

    if ("error" in response) {
      const errorInNorwegian = errorsToNorwegian.find(
        (e) => e.code === response.error.message,
      );
      console.error("error ", response.error);
      setGeneralError(
        errorInNorwegian?.message ??
          `Feil: ${response.error?.message || "Noe gikk galt"}`,
      );
      modalErrorMessage.onOpen();
    } else if ("success" in response) {
      setNewlyCreatedUser({
        email: response.success?.email,
        firstName: response.success?.firstName,
        lastName: response.success?.lastName,
        roles: response.success?.roles,
      });
      setScreenToDisplay(CreateUserScreenType.SUCCESS);
    } else {
      setGeneralError("Noe gikk galt");
    }
  };

  return (
    <>
      <div className="grid w-full grid-rows-[auto_1fr] overflow-hidden rounded-large bg-content1 shadow-small lg:grid-cols-[280px_1fr] lg:grid-rows-none">
        <div className="bg-default-100 dark:bg-zinc-800/40 lg:border-r">
          <nav className="flex flex-row lg:flex-col lg:gap-8 lg:px-4 lg:pt-8">
            {menuElements.map((element) => (
              <Button
                key={`menu-${element.id}`}
                variant="light"
                onClick={(e) => setSelectedMenu(element.id)}
                className={`h-24 flex-1 flex-col rounded-none text-sm text-brand-black hover:text-brand-black/80 dark:text-brand-white dark:hover:text-brand-white/80 lg:flex-row lg:border-none ${
                  element.id !== 0 && "border-l border-black/10"
                }`}
              >
                <element.menuIcon />

                {element.id === selectedMenu ? (
                  <strong>{element.name}</strong>
                ) : (
                  <span>{element.name}</span>
                )}
              </Button>
            ))}
          </nav>
        </div>
        <section className="flex flex-col overflow-auto">
          <p
            className="w-full border-b bg-brand-white px-6 py-8 text-left text-base dark:bg-brand-black"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: for formatting. Not dangerous – content is defined by us.
            dangerouslySetInnerHTML={{
              __html: menuElements[selectedMenu].description,
            }}
          />

          {/* SHOW USERS SCREEN */}
          {selectedMenu === SidebarMenu.USERS && (
            <UserTable users={users} className="lg:px-2" />
          )}

          {/* CREATE NEW USER SCREEN - SHOW FORM */}
          {selectedMenu === SidebarMenu.CREATE_USER &&
            isCreatingUser === false &&
            screenToDisplay === CreateUserScreenType.FORM && (
              <form
                className="px-4 lg:px-6 py-4 text-left"
                onSubmit={handleSubmit}
              >
                <div className="mb-5 flex flex-col gap-5 lg:flex-row">
                  <Input
                    type="email"
                    name="email"
                    label="E-post"
                    description="E-posten som vil bli brukt til innlogging"
                    isRequired
                    value={newUser.email}
                    isInvalid={isInvalidEmail}
                    color={isInvalidEmail ? "danger" : "default"}
                    errorMessage={
                      isInvalidEmail && "Tast inn en gyldig e-postadresse"
                    }
                    onChange={(e) => {
                      setNewUser({ ...newUser, email: e.target.value });
                    }}
                    onValueChange={setEmailValue} // Only for visual validation feedback in the input field
                  />

                  <Input
                    type="text"
                    name="firstName"
                    label="Fornavn"
                    isRequired
                    value={newUser.firstName}
                    onChange={(e) => {
                      setNewUser({ ...newUser, firstName: e.target.value });
                    }}
                  />
                </div>

                <div className="mb-5 flex flex-col gap-5  lg:flex-row">
                  <Input
                    type="text"
                    name="lastName"
                    label="Etternavn"
                    isRequired
                    value={newUser.lastName}
                    onChange={(e) => {
                      setNewUser({ ...newUser, lastName: e.target.value });
                    }}
                  />

                  <Input
                    type="password"
                    name="password"
                    label="Passord"
                    description="Midlertidig passord som kan endres av brukeren senere. Brukeren kan også velge å logge inn med e-post-lenke uten passord."
                    isRequired
                    value={newUser.password}
                    onChange={(e) => {
                      setNewUser({ ...newUser, password: e.target.value });
                    }}
                  />
                </div>

                <CheckboxGroup
                  label="Velg roller"
                  name="roles"
                  orientation="horizontal"
                  color="secondary"
                  defaultValue={["user"]}
                  onValueChange={(value) => {
                    setNewUser({ ...newUser, roles: value });
                  }}
                >
                  <Checkbox value="user" name="role-user" isDisabled>
                    Bruker
                  </Checkbox>
                  <Checkbox value="editor" name="role-editor">
                    Redaktør
                  </Checkbox>
                  <Checkbox value="admin" name="role-admin">
                    Administrator
                  </Checkbox>
                </CheckboxGroup>

                <div className="flex justify-center lg:justify-start">
                  <Button
                    type="submit"
                    color="default"
                    aria-disabled={isCreatingUser}
                    isDisabled={isCreatingUser}
                    className="mt-8"
                  >
                    {isCreatingUser ? "Sender..." : "Send"}
                  </Button>
                </div>
              </form>
            )}

          {/* SHOW LOADING SPINNER WHILE CREATING USER */}
          {selectedMenu === SidebarMenu.CREATE_USER && isCreatingUser && (
            <div className="mt-24 flex flex-col items-center justify-center gap-4">
              <LoadingSpinner />
              <p>
                Oppretter bruker <br />
                {newUser.email}
              </p>
            </div>
          )}

          {/* NEW USER HAS BEEN CREATED - SHOW SUCCESS SCREEN */}
          {selectedMenu === SidebarMenu.CREATE_USER &&
            screenToDisplay === CreateUserScreenType.SUCCESS && (
              <section className="ml-4 text-left lg:pl-2 lg:pr-32">
                <h2 className="mt-4">Brukeren har blitt opprettet</h2>
                <div>
                  <strong>E-post:</strong> {newlyCreatedUser.email}
                </div>
                <div>
                  <strong>Fornavn:</strong> {newlyCreatedUser.firstName}
                  <br />
                  <strong>Etternavn:</strong> {newlyCreatedUser.lastName}
                </div>
                <div className="flex flex-row gap-4 pt-4 py-8">
                  <strong>Roller: </strong>
                  <RoleDisplay roles={newlyCreatedUser.roles} />
                </div>
                <p>
                  Du kan senere endre brukernes roller ved å velge «Tildel
                  roller».
                </p>
                <p>
                  Under «Vis brukere» kan du se alle brukere som er registrert,
                  endre e-post og navn på brukere, eller slette brukere.
                </p>

                <div className="flex justify-center lg:justify-start">
                  <Button
                    color="primary"
                    className="mt-8"
                    name="submit-form"
                    onClick={() => {
                      setScreenToDisplay(CreateUserScreenType.FORM);
                      setNewUser({
                        email: "",
                        firstName: "",
                        lastName: "",
                        password: "",
                      });
                    }}
                  >
                    Tilbake
                  </Button>
                </div>
              </section>
            )}

          {selectedMenu === SidebarMenu.ASSIGN_ROLES && <AssignRoleForm />}
        </section>
      </div>

      {/* CREATE NEW USER MODAL - USER NEEDS TO CONFIRM BEFORE CALLING THE SERVER ACTION */}
      <Modal
        isOpen={modalCreateUser.isOpen}
        onOpenChange={modalCreateUser.onOpenChange}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Er du sikker
          </ModalHeader>
          <ModalBody>
            <p>Er du sikker på at du vil opprette en ny bruker?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="warning" onClick={modalCreateUser.onClose}>
              Avbryt
            </Button>
            <Button
              color="primary"
              onClick={() => {
                handleCreateNewUser();
                modalCreateUser.onClose();
              }}
            >
              Opprett
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL FOR DISPLAYING ERRORS */}
      <Modal
        isOpen={modalErrorMessage.isOpen}
        onOpenChange={modalErrorMessage.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Det har oppstått en feil
              </ModalHeader>
              <ModalBody>
                <p>{generalError}</p>
                <p>
                  Hvis du mener noe er galt, ta kontakt med styret eller
                  web-administrator.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onClick={() => {
                    setGeneralError("");
                    modalErrorMessage.onClose();
                  }}
                >
                  Ok
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
