import { inviteUser } from "@/app/actions/inviteUser";
import { UserAdminContext } from "@/context/userAdminContext";
import {
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
  useDisclosure,
} from "@nextui-org/react";
import { useContext, useMemo, useState } from "react";
import RoleDisplay from "./RoleDisplay";

export default function InviteUser() {
  const [emailToInvite, setEmailToInvite] = useState<string>("");
  const [roles, setRoles] = useState<string[]>(["user"]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isInvitingUser, setIsInvitingUser] = useState<boolean>(false);
  const { newlyCreatedUser, setNewlyCreatedUser } =
    useContext(UserAdminContext);

  const modalInviteUser = useDisclosure();
  const modalInviteUserSuccess = useDisclosure();
  const modalErrorMessage = useDisclosure();

  const isInvalidEmail = useMemo(() => {
    const validateEmail = (value: string) =>
      value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

    if (emailToInvite === "") return false;
    return validateEmail(emailToInvite) ? false : true;
  }, [emailToInvite]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailToInvite === "") {
      setErrorMessage("E-postadressen må fylles ut");
      return;
    }

    setErrorMessage("");
    modalInviteUser.onOpen();
  };

  const handleInviteUser = async () => {
    setErrorMessage("");

    setIsInvitingUser(true);
    const response = await inviteUser({
      email: emailToInvite,
      roles: roles,
    });
    setIsInvitingUser(false);

    if ("error" in response) {
      console.error("error ", response.error);
      setErrorMessage(response.error?.longMessage ?? "Noe gikk galt");
      modalErrorMessage.onOpen();
    } else if ("success" in response) {
      setNewlyCreatedUser({
        email: response.success?.email,
        firstName: "",
        lastName: "",
        roles: response.success?.roles,
      });
      modalInviteUserSuccess.onOpen();
      setEmailToInvite("");
    } else {
      setErrorMessage("Noe gikk galt");
      modalErrorMessage.onOpen();
    }
  };

  return (
    <div className="px-4 lg:px-6 py-4 text-left mb-16">
      <h3 className="mt-0">Opprett invitasjon</h3>
      <p>
        I stedet for å opprette en bruker med brukernavn og passord, kan du{" "}
        <em>invitere</em> brukeren til å opprette kontoen sin selv.
      </p>
      <p>
        Dette er den <em>anbefalte</em> måten å gjøre det på, da brukeren selv
        kan velge passord, navn og foretrukket innloggingsmetode.
      </p>
      <Divider />
      <form onSubmit={handleSubmit} className="py-8" id="form">
        <Input
          label="E-post"
          type="email"
          required
          value={emailToInvite}
          isInvalid={isInvalidEmail}
          errorMessage={isInvalidEmail && "Tast inn en gyldig e-postadresse"}
          onValueChange={(value) => {
            setErrorMessage("");
            setEmailToInvite(value);
          }}
          className="mb-5 sm:w-2/3"
          description="E-postadressen til den du vil invitere."
        />

        <CheckboxGroup
          label="Velg roller"
          name="roles"
          orientation="horizontal"
          color="secondary"
          defaultValue={["user"]}
          value={roles}
          onValueChange={setRoles}
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

        <div className="h-32">
          <Button type="submit" className="mt-8">
            {isInvitingUser ? "Inviterer..." : "Inviter bruker"}
          </Button>
          {errorMessage && (
            <p className="text-brand-danger text-sm mt-2">{errorMessage}</p>
          )}
        </div>
      </form>

      {/* MODAL FOR CONFIRMING USER INVITE */}
      <Modal
        isOpen={modalInviteUser.isOpen}
        onOpenChange={modalInviteUser.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Er du sikker?
              </ModalHeader>
              <ModalBody>
                <p>
                  Du er i ferd med å invitere brukeren med e-postadressen{" "}
                  <span className="text-brand-secondary">{emailToInvite}</span>.
                  Bekreft at du vil gjøre dette.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  onPress={() => {
                    handleInviteUser();
                    modalInviteUser.onClose();
                  }}
                >
                  Ok
                </Button>
                <Button color="danger" onPress={modalInviteUser.onClose}>
                  Avbryt
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODAL FOR DISPLAYING SUCCESS MESSAGE */}
      <Modal
        isOpen={modalInviteUserSuccess.isOpen}
        onOpenChange={modalInviteUserSuccess.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Brukeren er opprettet
              </ModalHeader>
              <ModalBody>
                <p>
                  Du har opprettet en bruker med e-postadressen{" "}
                  <span className="text-brand-secondary">
                    {newlyCreatedUser.email}
                  </span>
                  .
                </p>
                <div className="flex flex-row gap-4 pt-4 py-8">
                  <strong>Roller: </strong>
                  <RoleDisplay roles={newlyCreatedUser.roles} />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onPress={() => {
                    modalInviteUserSuccess.onClose();
                  }}
                >
                  Ok
                </Button>
              </ModalFooter>
            </>
          )}
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
                <p>{errorMessage}</p>
                <p>
                  Hvis du mener noe er galt, ta kontakt med styret eller
                  web-administrator.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onPress={() => {
                    setErrorMessage("");
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
    </div>
  );
}
