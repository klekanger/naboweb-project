import { searchUser } from "@/app/actions/searchUser";
import { updateUser } from "@/app/actions/updateUser";
import LoadingSpinner from "@/components/LoadingSpinner";
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
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { SearchIcon } from "lucide-react";
import { useContext, useState } from "react";

const MAX_RESULTS = 10;

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

export default function EditUser() {
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

  const modalDeleteUser = useDisclosure();
  const modalUserUpdated = useDisclosure();

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
        <div className="px-4 lg:px-6 py-4 text-left">
          <div className="flex flex-row items-center gap-4 pb-8">
            <Avatar size="lg" src={selectedUser?.imageUrl} />
            <div>
              <h2 className="m-0 p-0 text-xl">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </h2>
              <div className="text-xs">
                Bruker opprettet: {formatDate(selectedUser?.createdAt)}
              </div>
            </div>
          </div>
          <Divider />
          <Spacer y={8} />
          <form onSubmit={handleUpdateUser}>
            <div className="mb-5 flex flex-col gap-5 lg:flex-row">
              <Input
                type="email"
                name="email"
                isDisabled
                label="E-post"
                defaultValue={selectedUser.email ?? ""}
                classNames={{
                  description: "text-black",
                }}
                description="E-postadressen kan ikke endres. Hvis du vil endre e-postadressen, må du slette brukeren og opprette en ny."
              />

              <Input
                type="text"
                name="firstName"
                label="Fornavn"
                isRequired
                value={selectedUser.firstName ?? ""}
                onChange={(e) => {
                  setSelectedUser({
                    ...selectedUser,
                    firstName: e.target.value,
                  });
                }}
              />
            </div>

            <div className="mb-5 flex flex-col gap-5  lg:flex-row">
              <Input
                type="text"
                name="lastName"
                label="Etternavn"
                isRequired
                value={selectedUser.lastName ?? ""}
                onChange={(e) => {
                  setSelectedUser({
                    ...selectedUser,
                    lastName: e.target.value,
                  });
                }}
              />
            </div>

            <CheckboxGroup
              label="Velg roller"
              name="roles"
              orientation="horizontal"
              color="secondary"
              defaultValue={["user"]}
              value={
                Array.isArray(selectedUser.roles) ? selectedUser.roles : []
              }
              onValueChange={(value) => {
                setSelectedUser({ ...selectedUser, roles: value });
              }}
              description="Alle må ha rollen 'Bruker' for å få tilgang til systemet. Redaktører kan opprette og redigere innhold, mens administratorer har tilgang til alle funksjoner."
            >
              <Checkbox value="user" name="role-user">
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
        <>
          <div className="px-4 lg:px-6 py-4 text-left">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(searchTerm);
              }}
              className="flex flex-row gap-4 pb-8"
            >
              <Input
                placeholder="Søk etter bruker..."
                startContent={<SearchIcon />}
                onValueChange={setSearchTerm}
                value={searchTerm}
                className="w-full sm:max-w-[44%]"
              />
              <Button
                className="h-auto"
                type="submit"
                color="default"
                onPress={() => handleSubmit(searchTerm)}
              >
                Søk
              </Button>
            </form>
            {(foundUsers.length > 0 && (
              <p>
                <strong>
                  Viser inntil {MAX_RESULTS} første treff &ndash; klikk brukeren
                  du vil redigere:
                </strong>
              </p>
            )) || (
              <p>
                Begynn å skrive i søkefeltet for å finne brukeren du vil endre.
              </p>
            )}
          </div>

          <Table
            className="mb-16 "
            shadow="none"
            isCompact
            aria-label="Tabell med oversikt over brukere"
            onRowAction={(id) => {
              const userToEdit = foundUsers.find((user) => user.id === id);
              setSelectedUser(userToEdit as UserWithEmails);
            }}
          >
            <TableHeader>
              <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
                Navn
              </TableColumn>
              <TableColumn className="bg-brand-primary/20 text-sm font-bold md:text-base">
                E-post
              </TableColumn>

              <TableColumn className="hidden bg-brand-primary/20 text-sm font-bold sm:table-cell md:text-base">
                Roller
              </TableColumn>
            </TableHeader>

            <TableBody emptyContent={loading && <LoadingSpinner />}>
              {foundUsers.map((user) => {
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
                  <TableRow key={user.id} className="text-left group">
                    <TableCell className="group-hover:bg-brand-black/10 cursor-pointer">{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell className="group-hover:bg-brand-black/10 cursor-pointer">
                      {user.email}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell group-hover:bg-brand-black/10 cursor-pointer">
                      {roles}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
      <DeleteUserModal
        userDataToDelete={selectedUser as ShowUserProps}
        onClose={modalDeleteUser.onClose}
        isOpen={modalDeleteUser.isOpen}
        onOpenChange={modalDeleteUser.onOpenChange}
      />
      <Modal
        isOpen={modalUserUpdated.isOpen}
        onOpenChange={modalUserUpdated.onOpenChange}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Brukeren er oppdatert</ModalHeader>
              <ModalBody>
                <span>
                  Du har oppdatert brukeren{" "}
                  <span className="text-brand-secondary">
                    {selectedUser?.firstName} {selectedUser?.lastName}.
                  </span>
                </span>
              </ModalBody>
              <ModalFooter>
                <Button color="success" onPress={onClose}>
                  Lukk
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
