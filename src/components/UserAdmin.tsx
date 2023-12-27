"use client";

import UserTable from "@/components/UserTable";
// import CreateUserModal from "@/components/modals/CreateUserModal";
import type { UsersWithEmails } from "@/types/types";
import { NewUser } from "@/types/types";
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
import LoadingSpinner from "./LoadingSpinner";
import RoleDisplay from "./RoleDisplay";

const menuElements = [
  {
    id: 0,
    name: "Vis brukere",
    description:
      "Viser alle brukere som er registrert.<br />Du kan bruke søkefeltet for å finne en bestemt bruker (søker i både e-post og navn).",
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

const errorsToNorwegian = [
  {
    code: "form_password_length_too_short",
    message: "Passordet er for kort",
  },
  {
    code: "form_password_pwned",
    message: "Passordet er funnet i en datalekkasje - velg et annet",
  },
  {
    code: "User already exists",
    message: "Brukeren eksisterer allerede",
  },
  {
    code: "User is not admin",
    message: "Du er ikke administrator",
  },
];

export default function UserAdmin({ users }: { users: UsersWithEmails[] }) {
  // const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const modalCreateUser = useDisclosure();
  const modalErrorMessage = useDisclosure();

  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [screenToDisplay, setScreenToDisplay] = useState(
    CreateUserScreenType.FORM,
  );

  const [generalError, setGeneralError] = useState("");

  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roles: [],
  });

  const [newlyCreatedUser, setNewlyCreatedUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    imageUrl: "",
    roles: [],
  });

  const emailFieldContent = newUser.email;

  const isValidEmail = (currentEmailField: string) => {
    return (
      currentEmailField.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i) !== null
    );
  };

  const isInvalidEmail = useMemo(() => {
    if (emailFieldContent === "") return false;
    return !isValidEmail(emailFieldContent);
  }, [emailFieldContent, isValidEmail]);

  const validateForm = (user: NewUser) => {
    return (
      isValidEmail(user?.email) &&
      user?.firstName !== "" &&
      user?.lastName !== ""
    );
  };

  const createUser = async (user: NewUser) => {
    if (validateForm(user) === true) {
      setIsCreatingUser(true);

      try {
        const res = await fetch("/api/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userToCreate: user,
            userRoles: user.roles,
          }),
        });
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (!data.success) {
          throw new Error(data.message);
        }

        const {
          success: { userCreated },
        } = data;

        setNewlyCreatedUser({
          email: userCreated?.emailAddresses[0]?.emailAddress ?? "",
          firstName: userCreated?.firstName ?? "",
          lastName: userCreated?.lastName ?? "",
          imageUrl: userCreated?.imageUrl ?? "",
          roles: userCreated?.publicMetadata?.roles,
        });

        setIsCreatingUser(false);
        setScreenToDisplay(CreateUserScreenType.SUCCESS);

        return data;
      } catch (error) {
        console.error("Something went wrong:", error.message);

        const errorInNorwegian = errorsToNorwegian.find(
          (e) => e.code === error.message,
        );

        console.log(errorInNorwegian);

        setGeneralError(
          errorInNorwegian?.message ??
            `Feil: ${error?.message || "Noe gikk galt"}`,
        );

        modalErrorMessage.onOpen();
      } finally {
        setIsCreatingUser(false);
      }
    } else {
      console.error("Invalid form data");
    }
  };

  const AssignRoleForm = () => (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
        <h1>Tildel rolle</h1>
      </div>
    </main>
  );

  const handleCreateUserSubmit = () => {
    if (validateForm(newUser)) {
      modalCreateUser.onOpen();
    } else {
      console.error("not valid");
    }
  };

  return (
    <>
      <div className="grid h-screen min-h-screen w-full grid-rows-[auto_1fr] overflow-hidden rounded-large bg-content1 shadow-small lg:grid-cols-[280px_1fr] lg:grid-rows-none">
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
            // biome-ignore lint/security/noDangerouslySetInnerHtml: for formatting. Not dangerous – content is from CMS.
            dangerouslySetInnerHTML={{
              __html: menuElements[selectedMenu].description,
            }}
          />
          {selectedMenu === SidebarMenu.USERS && (
            <UserTable users={users} className="lg:px-2" />
          )}

          {selectedMenu === SidebarMenu.CREATE_USER && isCreatingUser && (
            <div className="mt-24 flex flex-col items-center justify-center gap-4">
              <LoadingSpinner />
              <p>
                Oppretter bruker <br />
                {newUser.email}
              </p>
            </div>
          )}

          {selectedMenu === SidebarMenu.CREATE_USER &&
            isCreatingUser === false &&
            screenToDisplay === CreateUserScreenType.FORM && (
              <section className="p-4 text-left lg:px-2">
                <div className="mb-5 flex flex-col gap-5  lg:flex-row">
                  <Input
                    type="email"
                    label="E-post"
                    description="E-posten som vil bli brukt til innlogging"
                    isRequired
                    value={newUser.email}
                    onChange={(e) => {
                      setNewUser({ ...newUser, email: e.target.value });
                    }}
                    isInvalid={isInvalidEmail}
                    color={isInvalidEmail ? "danger" : "default"}
                    errorMessage={
                      isInvalidEmail && "Tast inn en gyldig e-postadresse"
                    }
                  />
                  <Input
                    type="text"
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
                    label="Etternavn"
                    isRequired
                    value={newUser.lastName}
                    onChange={(e) => {
                      setNewUser({ ...newUser, lastName: e.target.value });
                    }}
                  />

                  <Input
                    type="password"
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
                  orientation="horizontal"
                  color="secondary"
                  defaultValue={["user"]}
                  onValueChange={(value) => {
                    setNewUser({ ...newUser, roles: value });
                  }}
                >
                  <Checkbox value="user" isDisabled>
                    Bruker
                  </Checkbox>
                  <Checkbox value="editor">Redaktør</Checkbox>
                  <Checkbox value="admin">Administrator</Checkbox>
                </CheckboxGroup>

                <div className="flex justify-center lg:justify-start">
                  <Button
                    color="default"
                    className="mt-8"
                    name="submit-form"
                    onClick={handleCreateUserSubmit}
                  >
                    Opprett bruker
                  </Button>
                </div>
              </section>
            )}

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
            <Button
              color="danger"
              variant="light"
              onClick={modalCreateUser.onClose}
            >
              Avbryt
            </Button>
            <Button
              color="primary"
              onClick={() => {
                createUser(newUser);
                modalCreateUser.onClose();
              }}
            >
              Opprett
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
