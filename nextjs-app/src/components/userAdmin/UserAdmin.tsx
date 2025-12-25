"use client";

import { createNewUser } from "@/app/actions/createUser";
import {
  CreateUserScreenType,
  SidebarMenu,
  UserAdminContext,
} from "@/context/userAdminContext";
import { errorsToNorwegian } from "@/lib/norwegianErrorMessages";
import type { UserAdminProps } from "@/types/types";
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
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { useContext, useState } from "react";
import EditUser from "./EditUser";
import InviteUser from "./InviteUser";
import RoleDisplay from "./RoleDisplay";
import AssignRolesTable from "./ShowRolesTable";
import { isEmailInvalid, menuElements, validateForm } from "./UserAdmin.logic";
import UserTable from "./UserTable";

export default function UserAdmin({
  users,
  pagination,
  isSearchResult = false,
}: UserAdminProps & { isSearchResult?: boolean }) {
  const {
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
    setSelectedUser,
  } = useContext(UserAdminContext);

  const modalCreateUser = useDisclosure();
  const modalErrorMessage = useDisclosure();
  const [longMessage, setLongMessage] = useState("");

  const isInvalidEmail = isEmailInvalid(emailValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm(newUser)) {
      modalCreateUser.onOpen();
    } else {
      console.error("not valid");
    }
  };

  const handleCreateNewUser = async () => {
    setIsCreatingUser(true);
    const response = await createNewUser(newUser);

    setIsCreatingUser(false);

    if ("error" in response) {
      const errorInNorwegian = errorsToNorwegian.find(
        (e) => e.code === response.error.message,
      );
      console.error("error ", response.error);

      if (response.error.code === "form_password_not_strong_enough") {
        setLongMessage("velg et sikrere passord");
      } else {
        setLongMessage(response.error?.longMessage || "");
      }

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
      <div className="grid w-full grid-rows-[auto_1fr] rounded-large bg-content1 shadow-small lg:grid-cols-[280px_1fr] lg:grid-rows-none">
        <div className="bg-default-100 dark:bg-zinc-800/40 lg:border-r rounded-l-large">
          <nav className="grid grid-cols-2 lg:grid-cols-1 lg:px-4 lg:gap-4 lg:py-8">
            {menuElements.map((element) => (
              <Button
                key={`menu-${element.id}`}
                variant="light"
                onPress={(e) => {
                  setSelectedUser(null);
                  setSelectedMenu(element.id);
                }}
                className={`h-24 lg:py-2 lg:justify-start lg:h-auto flex flex-col lg:flex-row rounded-none text-sm text-brand-black hover:text-brand-black/80 dark:text-brand-white dark:hover:text-brand-white/80 lg:border-none ${
                  element.id !== 0 &&
                  "border-l border-black/10 dark:border-white/10"
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
          <header
            className="w-full border-b bg-brand-white rounded-tr-large px-6 py-8 text-left text-base dark:bg-brand-black"
            dangerouslySetInnerHTML={{
              __html: menuElements[selectedMenu].description,
            }}
          />

          {/* SHOW USERS SCREEN */}
          {selectedMenu === SidebarMenu.USERS && (
            <UserTable
              users={users}
              pagination={pagination}
              isSearchResult={isSearchResult}
              className="lg:px-2"
            />
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
                    type="text"
                    name="firstName"
                    label="Fornavn"
                    isRequired
                    value={newUser.firstName}
                    onChange={(e) => {
                      setNewUser({ ...newUser, firstName: e.target.value });
                    }}
                  />
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
                </div>
                <div className="mb-5 flex flex-col gap-5  lg:flex-row">
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
                  description="Alle må ha rollen 'Bruker' for å få tilgang til systemet. Redaktører kan opprette og redigere innhold, mens administratorer har tilgang til alle funksjoner."
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

                <div className="flex justify-center lg:justify-start gap-4 pb-8">
                  <Button
                    type="submit"
                    color="default"
                    aria-disabled={isCreatingUser}
                    isDisabled={isCreatingUser}
                    className="mt-8"
                  >
                    {isCreatingUser ? "Jobber..." : "Legg til"}
                  </Button>
                  <Button
                    color="danger"
                    className="mt-8"
                    onPress={() => {
                      setScreenToDisplay(CreateUserScreenType.FORM);
                      setNewUser({
                        email: "",
                        firstName: "",
                        lastName: "",
                        password: "",
                      });
                    }}
                  >
                    Avbryt
                  </Button>
                </div>
              </form>
            )}

          {/* SHOW LOADING SPINNER WHILE CREATING USER */}
          {selectedMenu === SidebarMenu.CREATE_USER && isCreatingUser && (
            <div className="mt-24 flex flex-col items-center justify-center gap-4">
              <Spinner />
              <p>
                Oppretter bruker <br />
                {newUser.email}
              </p>
            </div>
          )}

          {/* NEW USER HAS BEEN CREATED - SHOW SUCCESS SCREEN */}
          {selectedMenu === SidebarMenu.CREATE_USER &&
            screenToDisplay === CreateUserScreenType.SUCCESS && (
              <section className="ml-4 text-left lg:pl-2 lg:pr-32 pb-16">
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
                  Du kan senere endre brukernes roller ved å velge «Endre
                  bruker».
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
                    onPress={() => {
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

          {/* INVITE USER TO CREATE ACCOUNT */}
          {selectedMenu === 1 && <InviteUser />}

          {/* EDIT EXISTING USER */}
          {selectedMenu === 3 && <EditUser />}

          {/* SHOW USERS WITH ADMIN OR OTHER SUPER USER ROLES */}
          {selectedMenu === 4 && (
            <AssignRolesTable
              users={users}
              pagination={pagination}
              className="lg:px-2"
            />
          )}
        </section>
      </div>

      {/* CREATE NEW USER MODAL - USER NEEDS TO CONFIRM BEFORE CALLING THE SERVER ACTION */}
      <Modal
        isOpen={modalCreateUser.isOpen}
        onOpenChange={modalCreateUser.onOpenChange}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Er du sikker?
          </ModalHeader>
          <ModalBody>
            <p>
              Du er i ferd med å opprette en ny bruker. Bekreft at du ønsker å
              gjøre dette.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onPress={modalCreateUser.onClose}>
              Avbryt
            </Button>
            <Button
              onPress={() => {
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
        isOpen={modalErrorMessage.isOpen || generalError !== ""}
        onOpenChange={modalErrorMessage.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Det har oppstått en feil
              </ModalHeader>
              <ModalBody>
                <p>
                  {generalError} {`${longMessage ? `(${longMessage})` : ""}`}
                </p>
                <p>
                  Hvis du mener noe er galt, ta kontakt med styret eller
                  web-administrator.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onPress={() => {
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
