import { searchUser } from "@/app/actions/searchUser";
import { updateUser } from "@/app/actions/updateUser";
import { Spinner } from "@heroui/react";
import DeleteUserModal from "@/components/userAdmin/DeleteUserModal";
import { UserAdminContext } from "@/context/userAdminContext";
import { formatDate } from "@/lib/format-date";
import { errorsToNorwegian } from "@/lib/norwegianErrorMessages";
import {
  type SearchUserType,
  ShowUserProps,
  UserWithEmails,
} from "@/types/types";
import {
  Avatar,
  Button,
  Checkbox,
  CheckboxGroup,
  Description,
  Input,
  Label,
  Modal,
  TextField,
  Tooltip,
} from "@heroui/react";
import CustomSearchInput from "../CustomSearchInput";
import { useContext, useState } from "react";
import { useModalState } from "@/hooks/useModalState";
import { useDisclosure } from "@/hooks/useDisclosure";
import CustomButton from "../CustomButton";

const MAX_RESULTS = 10;

const CircleAdmin = () => (
  <Tooltip delay={0}>
    <Tooltip.Trigger>
      <span className="rounded-full bg-danger/30 w-[1em] h-[1em] justify-center items-center p-2.5 inline-flex text-[1em] mr-1 cursor-help">
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
      <span className="rounded-full bg-warning/30 w-[1em] h-[1em] justify-center items-center p-2.5 inline-flex text-[1em] cursor-help">
        R
      </span>
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>Redaktør</p>
    </Tooltip.Content>
  </Tooltip>
);

export default function EditUser({ ...rest }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundUsers, setFoundUsers] = useState<SearchUserType[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    selectedUser,
    setSelectedUser,
    isCreatingUser,
    setIsCreatingUser,
    setGeneralError,
  } = useContext(UserAdminContext);

  // Modal state using custom hook
  const {
    modal: modalUserUpdated,
    title: modalTitle,
    body: modalBody,
    setBody: setModalBody,
  } = useModalState({
    initialTitle: "Brukeren er oppdatert",
  });

  const modalDeleteUser = useDisclosure();

  // This function is called when the user submits the search form.
  const handleSubmit = async (searchTerm: string) => {
    setFoundUsers([]);
    setLoading(true);
    const res = await searchUser({
      searchTerm,
      maxResults: MAX_RESULTS,
    });

    if ("success" in res) {
      setFoundUsers(res.success.users || []);
      setLoading(false);
    } else {
      setFoundUsers([]);
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUser && validateForm(selectedUser)) {
      setIsCreatingUser(true);
      const response = await updateUser(selectedUser as any);
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
      } else if ("success" in response) {
        setModalBody(
          `Du har oppdatert brukeren ${selectedUser?.firstName} ${selectedUser?.lastName}.`,
        );
        modalUserUpdated.onOpen();
      } else {
        setGeneralError("Noe gikk galt");
      }
    } else {
      console.error("Form validation failed. Form data: ", selectedUser);
      setGeneralError("Validering av skjemaet feilet.");
    }
  };

  const validateForm = (user: UserWithEmails) => {
    return user?.firstName !== "" && user?.lastName !== "";
  };

  return (
    <>
      {/* If we click "edit user" from the user table, then we have a 
          selected user and should show a form for changing user info.
          If not, we show a search form to find the user we want to edit.
          */}
      {selectedUser && (
        <div className={`${rest?.className ?? ""} pb-8`}>
          <div className="flex flex-row items-center gap-4 pb-8">
            <Avatar size="lg">
              {selectedUser?.imageUrl && (
                <Avatar.Image
                  src={selectedUser.imageUrl}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                />
              )}
              <Avatar.Fallback>
                {selectedUser?.firstName?.[0]}
                {selectedUser?.lastName?.[0]}
              </Avatar.Fallback>
            </Avatar>

            <div>
              <h2 className="m-0 p-0 text-xl">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </h2>
              <div className="text-xs">
                Bruker opprettet:{" "}
                {selectedUser?.createdAt && formatDate(selectedUser.createdAt)}
              </div>
            </div>
          </div>
          <hr className="border-t border-divider" />
          <div className="h-8" />
          <form onSubmit={handleUpdateUser}>
            <div className="mb-5 flex flex-col gap-5 lg:flex-row">
              <TextField
                name="email"
                type="email"
                isDisabled
                defaultValue={selectedUser.email ?? ""}
                className="w-full"
              >
                <Label>E-post</Label>
                <Input />
                <Description>
                  E-postadressen kan ikke endres. Hvis du vil endre
                  e-postadressen, må du slette brukeren og opprette en ny.
                </Description>
              </TextField>

              <TextField
                name="firstName"
                isRequired
                value={selectedUser.firstName ?? ""}
                onChange={(value) => {
                  setSelectedUser({
                    ...selectedUser,
                    firstName: value,
                  });
                }}
                className="w-full"
              >
                <Label>Fornavn</Label>
                <Input type="text" />
              </TextField>
            </div>

            <div className="mb-5 flex flex-col gap-5  lg:flex-row">
              <TextField
                name="lastName"
                isRequired
                value={selectedUser.lastName ?? ""}
                onChange={(value) => {
                  setSelectedUser({
                    ...selectedUser,
                    lastName: value,
                  });
                }}
                className="w-full"
              >
                <Label>Etternavn</Label>
                <Input type="text" />
              </TextField>
            </div>

            <CheckboxGroup
              name="roles"
              defaultValue={["user"]}
              value={
                Array.isArray(selectedUser.roles) ? selectedUser.roles : []
              }
              onChange={(value) => {
                setSelectedUser({ ...selectedUser, roles: value });
              }}
              className="flex flex-col gap-4"
            >
              <Label>Velg roller</Label>
              <div className="flex flex-row gap-4">
                <Checkbox value="user" name="role-user">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label>Bruker</Label>
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox value="editor" name="role-editor">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label>Redaktør</Label>
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox value="admin" name="role-admin">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label>Administrator</Label>
                  </Checkbox.Content>
                </Checkbox>
              </div>
              <Description>
                Alle må ha rollen 'Bruker' for å få tilgang til systemet.
                Redaktører kan opprette og redigere innhold, mens
                administratorer har tilgang til alle funksjoner.
              </Description>
            </CheckboxGroup>

            <div className="flex justify-center lg:justify-start">
              <Button
                type="submit"
                aria-disabled={isCreatingUser}
                isDisabled={isCreatingUser}
                className="mt-8"
              >
                {isCreatingUser ? "Oppdaterer..." : "Oppdater"}
              </Button>

              <Button
                type="button"
                color="warning"
                onPress={() => {
                  setSelectedUser(null);
                }}
                className="mt-8 ml-4"
              >
                Avbryt
              </Button>
              <Button
                type="button"
                color="danger"
                onPress={() => {
                  modalDeleteUser.onOpen();
                }}
                className="mt-8 ml-4"
              >
                Slett bruker
              </Button>
            </div>
          </form>
        </div>
      )}

      {!selectedUser && (
        <div className={rest?.className ?? ""}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(searchTerm);
            }}
            className="pb-8"
          >
            <div className="flex flex-col gap-2 max-w-md">
              <div className="flex gap-2 py-2">
                <CustomSearchInput
                  value={searchTerm}
                  onChange={(value) => setSearchTerm(value || "")}
                  placeholder="Søk etter bruker"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit(searchTerm);
                    }
                  }}
                />
                <CustomButton
                  variant="primary"
                  onPress={() => {
                    if (searchTerm.trim()) {
                      handleSubmit(searchTerm);
                    }
                  }}
                  className={
                    !searchTerm.trim() ? "opacity-50 cursor-not-allowed" : ""
                  }
                >
                  Søk
                </CustomButton>
              </div>
              {(foundUsers.length > 0 && (
                <p className="text-left">
                  <strong>
                    Viser inntil {MAX_RESULTS} første treff &ndash; klikk
                    brukeren du vil redigere:
                  </strong>
                </p>
              )) || (
                <p className="text-left">
                  Begynn å skrive i søkefeltet for å finne brukeren du vil
                  endre.
                </p>
              )}
            </div>
          </form>

          <div className="mb-16 overflow-x-auto">
            <table
              className="w-full min-w-[640px] border-collapse text-sm"
              aria-label="Tabell med oversikt over brukere"
            >
              <thead>
                <tr className="[&>th]:first:rounded-l-lg [&>th]:last:rounded-r-lg text-gray-500">
                  <th className="bg-brand-primary/20 text-sm font-bold md:text-base p-3 text-left">
                    Navn
                  </th>
                  <th className="bg-brand-primary/20 text-sm font-bold md:text-base p-3 text-left">
                    E-post
                  </th>
                  <th className="hidden bg-brand-primary/20 text-sm font-bold sm:table-cell md:text-base p-3 text-left">
                    Roller
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center">
                      <div className="flex justify-center items-center w-full">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Spinner size="md" className="w-full h-full" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : foundUsers && foundUsers.length > 0 ? (
                  foundUsers.map((user, index) => {
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

                    return (
                      <tr
                        key={user.id}
                        className={`text-left ${index === 0 ? "[&>td]:pt-4" : ""}`}
                        onClick={() => {
                          const userToEdit = foundUsers.find(
                            (u) => u.id === user.id,
                          );
                          setSelectedUser(userToEdit as UserWithEmails);
                        }}
                      >
                        <td className="group-hover:bg-brand-black/10 cursor-pointer p-3">{`${user.firstName} ${user.lastName}`}</td>
                        <td className="group-hover:bg-brand-black/10 cursor-pointer p-3">
                          {user.email}
                        </td>
                        <td className="hidden sm:table-cell group-hover:bg-brand-black/10 cursor-pointer p-3">
                          <span className="flex flex-row ">{roles}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">
                      Ingen brukere funnet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <DeleteUserModal
        userDataToDelete={selectedUser as ShowUserProps}
        onClose={modalDeleteUser.onClose}
        isOpen={modalDeleteUser.isOpen}
        onOpenChange={modalDeleteUser.onOpenChange}
      />
      <Modal.Backdrop
        isOpen={modalUserUpdated.isOpen}
        onOpenChange={modalUserUpdated.onOpenChange}
        variant="blur"
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{modalTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>{modalBody}</Modal.Body>
            <Modal.Footer>
              <CustomButton
                variant="primary"
                onPress={modalUserUpdated.onClose}
              >
                Lukk
              </CustomButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
