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
  Description,
  FieldError,
  Input,
  Label,
  Modal,
  Spinner,
  TextField,
} from "@heroui/react";
import { useContext, useRef, useState } from "react";
import CustomButton from "../CustomButton";
import { useDisclosure } from "@/hooks/useDisclosure";
import EditUser from "./EditUser";
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
  const formRef = useRef<HTMLFormElement>(null);

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
      <div className="grid w-full grid-rows-[auto_1fr] rounded-b-xl lg:rounded-xl bg-content1 shadow-small lg:grid-cols-[280px_1fr] lg:grid-rows-none border border-gray-200 shadow-2xl">
        <div className="bg-gray-100 lg:border-r rounded-l-xl">
          <nav className="grid grid-cols-2 lg:grid-cols-1 lg:px-4 lg:gap-4 lg:py-8">
            {menuElements.map((element, index) => {
              const isRightColumn = index % 2 === 1; // Right column in 2-column grid
              const isLeftColumn = index % 2 === 0; // Left column in 2-column grid
              // Last row: if odd number of buttons, last button; if even, last 2 buttons
              const isLastRow =
                index >=
                menuElements.length - (menuElements.length % 2 === 0 ? 2 : 1);

              return (
                <Button
                  key={`menu-${element.id}`}
                  variant="ghost"
                  onPress={() => {
                    setSelectedUser(null);
                    setSelectedMenu(element.id);
                  }}
                  className={`h-24 lg:py-2 lg:justify-start lg:h-10 flex flex-col lg:flex-row rounded-none text-sm text-brand-black hover:bg-brand-black/10 lg:border-none w-full ${
                    isLeftColumn && !isRightColumn
                      ? "border-r border-black/10"
                      : ""
                  } ${!isLastRow ? "border-b border-black/10" : ""}`}
                >
                  <element.menuIcon className="w-6 h-6" />
                  {element.id === selectedMenu ? (
                    <strong>{element.name}</strong>
                  ) : (
                    <span>{element.name}</span>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>
        <section className="flex flex-col overflow-auto">
          <header
            className="w-full border-b bg-brand-white rounded-tr-xl px-6 py-8 text-left text-base"
            dangerouslySetInnerHTML={{
              __html:
                menuElements.find((el) => el.id === selectedMenu)
                  ?.description || "",
            }}
          />

          {/* SHOW USERS SCREEN */}
          {selectedMenu === SidebarMenu.USERS && (
            <UserTable
              users={users}
              pagination={pagination}
              isSearchResult={isSearchResult}
              className="px-4 pt-4 bg-white"
            />
          )}

          {/* CREATE NEW USER SCREEN - SHOW FORM */}
          {selectedMenu === SidebarMenu.CREATE_USER &&
            screenToDisplay === CreateUserScreenType.FORM && (
              <div className="relative bg-white">
                {/* SHOW LOADING SPINNER WHILE CREATING USER */}
                {isCreatingUser && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/90">
                    <Spinner size="md" />
                    <p className="text-center text-brand-black/50">
                      Oppretter bruker <br />
                      {newUser.email}
                    </p>
                  </div>
                )}
                <form
                  ref={formRef}
                  className="px-4 py-4 text-left pt-4"
                  onSubmit={handleSubmit}
                >
                  <div className="mb-5 flex flex-col gap-5 lg:flex-row">
                    <TextField
                      name="firstName"
                      isRequired
                      isDisabled={isCreatingUser}
                      value={newUser.firstName}
                      onChange={(value) => {
                        setNewUser({ ...newUser, firstName: value });
                      }}
                      className="w-full"
                    >
                      <Label className="text-left">Fornavn</Label>
                      <Input type="text" autoComplete="given-name" />
                    </TextField>

                    <TextField
                      name="lastName"
                      isRequired
                      isDisabled={isCreatingUser}
                      value={newUser.lastName}
                      onChange={(value) => {
                        setNewUser({ ...newUser, lastName: value });
                      }}
                      className="w-full"
                    >
                      <Label className="text-left">Etternavn</Label>
                      <Input type="text" autoComplete="family-name" />
                    </TextField>
                  </div>
                  <div className="mb-5 flex flex-col gap-5 lg:flex-row">
                    <TextField
                      name="email"
                      type="email"
                      isRequired
                      isDisabled={isCreatingUser}
                      isInvalid={isInvalidEmail}
                      value={newUser.email}
                      onChange={(value) => {
                        setNewUser({ ...newUser, email: value });
                        setEmailValue(value); // Only for visual validation feedback in the input field
                      }}
                      className="w-full"
                    >
                      <Label>E-post</Label>
                      <Input autoComplete="email" />
                      {isInvalidEmail ? (
                        <FieldError>
                          Tast inn en gyldig e-postadresse
                        </FieldError>
                      ) : (
                        <Description>
                          E-posten som vil bli brukt til innlogging
                        </Description>
                      )}
                    </TextField>
                    <div className="hidden lg:block lg:w-full"></div>

                    {/* <TextField
                    name="password"
                    type="password"
                    isRequired
                    value={newUser.password}
                    onChange={(value) => {
                      setNewUser({ ...newUser, password: value });
                    }}
                    className="w-full"
                  >
                    <Label>Passord</Label>
                    <Input />
                    <Description>
                      Midlertidig passord som kan endres av brukeren senere.
                      Brukeren kan også velge å logge inn med e-post-lenke uten
                      passord.
                    </Description>
                  </TextField> */}
                  </div>

                  <CheckboxGroup
                    name="roles"
                    defaultValue={["user"]}
                    isDisabled={isCreatingUser}
                    onChange={(value) => {
                      setNewUser({ ...newUser, roles: value });
                    }}
                    className="flex flex-col mb-5"
                  >
                    <Label className="text-left text-sm font-normal">
                      Velg roller
                    </Label>
                    <div className="flex flex-row gap-4 ">
                      <Checkbox
                        value="user"
                        name="role-user"
                        isDisabled
                        className="mt-0 pt-1"
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Content>
                          <Label>Bruker</Label>
                        </Checkbox.Content>
                      </Checkbox>
                      <Checkbox
                        value="editor"
                        name="role-editor"
                        className="mt-0 pt-1"
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Content>
                          <Label>Redaktør</Label>
                        </Checkbox.Content>
                      </Checkbox>
                      <Checkbox
                        value="admin"
                        name="role-admin"
                        className="mt-0 pt-1"
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Content>
                          <Label>Administrator</Label>
                        </Checkbox.Content>
                      </Checkbox>
                    </div>
                    <Description className="mt-4">
                      Alle må ha rollen 'Bruker' for å få tilgang til systemet.
                      Redaktører kan opprette og redigere innhold, mens
                      administratorer har tilgang til alle funksjoner.
                    </Description>
                  </CheckboxGroup>

                  <div className="text-left text-sm font-normal mb-2">
                    Varsle bruker om nye innlegg (anbefalt)
                  </div>
                  <Checkbox
                    id="emailSubscription"
                    value="emailSubscription"
                    name="emailSubscription"
                    className="pt-1"
                    isDisabled={isCreatingUser}
                    isSelected={newUser.emailSubscription ?? true}
                    onChange={(isSelected: boolean) => {
                      setNewUser({ ...newUser, emailSubscription: isSelected });
                    }}
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Content>
                      <Label htmlFor="emailSubscription">
                        Aktiver e-postvarsling
                      </Label>
                    </Checkbox.Content>
                  </Checkbox>

                  <div className="flex justify-center lg:justify-start gap-4 pb-8">
                    <CustomButton
                      variant="primary"
                      isDisabled={isCreatingUser}
                      onPress={() => {
                        if (formRef.current && !isCreatingUser) {
                          formRef.current.requestSubmit();
                        }
                      }}
                      className="mt-8"
                    >
                      {isCreatingUser ? "Jobber..." : "Legg til"}
                    </CustomButton>
                    <CustomButton
                      variant="danger"
                      isDisabled={isCreatingUser}
                      className="mt-8"
                      onPress={() => {
                        setScreenToDisplay(CreateUserScreenType.FORM);
                        setNewUser({
                          email: "",
                          firstName: "",
                          lastName: "",
                          emailSubscription: true,
                        });
                      }}
                    >
                      Avbryt
                    </CustomButton>
                  </div>
                </form>
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
                  <CustomButton
                    variant="primary"
                    className="mt-8"
                    onPress={() => {
                      setScreenToDisplay(CreateUserScreenType.FORM);
                      setNewUser({
                        email: "",
                        firstName: "",
                        lastName: "",
                        emailSubscription: true,
                      });
                    }}
                  >
                    Tilbake
                  </CustomButton>
                </div>
              </section>
            )}
          {/* INVITE USER TO CREATE ACCOUNT */}
          {/* {selectedMenu === SidebarMenu.INVITE_USER && <InviteUser />} */}

          {/* EDIT EXISTING USER */}
          {selectedMenu === 3 && <EditUser className="px-4 pt-4 bg-white" />}

          {/* SHOW USERS WITH ADMIN OR OTHER SUPER USER ROLES */}
          {selectedMenu === 4 && (
            <AssignRolesTable
              users={users}
              pagination={pagination}
              className="px-4 pt-4 bg-white"
            />
          )}
        </section>
      </div>

      {/* CREATE NEW USER MODAL - USER NEEDS TO CONFIRM BEFORE CALLING THE SERVER ACTION */}
      <Modal.Backdrop
        isOpen={modalCreateUser.isOpen}
        onOpenChange={modalCreateUser.onOpenChange}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Er du sikker?</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>
                Du er i ferd med å opprette en ny bruker. Bekreft at du ønsker å
                gjøre dette.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <CustomButton variant="danger" onPress={modalCreateUser.onClose}>
                Avbryt
              </CustomButton>
              <CustomButton
                variant="primary"
                onPress={() => {
                  handleCreateNewUser();
                  modalCreateUser.onClose();
                }}
              >
                Opprett
              </CustomButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {/* MODAL FOR DISPLAYING ERRORS */}
      <Modal.Backdrop
        isOpen={modalErrorMessage.isOpen || generalError !== ""}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setGeneralError("");
          }
          modalErrorMessage.onOpenChange(isOpen);
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-lg">
                Det har oppstått en feil
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="mt-4 flex flex-col gap-3">
              <p>
                {generalError} {`${longMessage ? `(${longMessage})` : ""}`}
              </p>
              <p>
                Hvis du mener noe er galt, ta kontakt med styret eller
                web-administrator.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <CustomButton
                variant="primary"
                onPress={() => {
                  setGeneralError("");
                  modalErrorMessage.onClose();
                }}
              >
                Ok
              </CustomButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
