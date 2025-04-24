import { inviteUser } from "@/app/actions/inviteUser";
import { UserAdminContext } from "@/app/context/userAdminContext";
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
} from "@heroui/react";
import { useContext, useMemo, useState } from "react";
import RoleDisplay from "./RoleDisplay";
import { useModalState } from "@/app/hooks/useModalState";

export default function InviteUser() {
  const [emailToInvite, setEmailToInvite] = useState<string>("");
  const [roles, setRoles] = useState<string[]>(["user"]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isInvitingUser, setIsInvitingUser] = useState<boolean>(false);
  const { newlyCreatedUser, setNewlyCreatedUser } =
    useContext(UserAdminContext);

  // Modal state using custom hooks
  const {
    modal: modalInviteUser,
    title: inviteTitle,
    setTitle: setInviteTitle,
    body: inviteBody,
    setBody: setInviteBody,
    okText: inviteOkText,
    setOkText: setInviteOkText,
    cancelText: inviteCancelText,
    setCancelText: setInviteCancelText,
  } = useModalState({
    initialTitle: "Er du sikker?",
    initialOkText: "Ok",
    initialCancelText: "Avbryt",
  });

  const {
    modal: modalInviteUserSuccess,
    title: successTitle,
    setTitle: setSuccessTitle,
    body: successBody,
    setBody: setSuccessBody,
    okText: successOkText,
    setOkText: setSuccessOkText,
  } = useModalState({
    initialTitle: "Brukeren er opprettet",
    initialOkText: "Ok",
  });

  const {
    modal: modalErrorMessage,
    title: errorTitle,
    setTitle: setErrorTitle,
    body: errorBody,
    setBody: setErrorBody,
    okText: errorOkText,
    setOkText: setErrorOkText,
  } = useModalState({
    initialTitle: "Det har oppstått en feil",
    initialOkText: "Ok",
  });

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
    setInviteBody(
      `Du er i ferd med å invitere brukeren med e-postadressen ${emailToInvite}. Bekreft at du vil gjøre dette.`,
    );
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
      setErrorBody(response.error?.longMessage ?? "Noe gikk galt");
      modalErrorMessage.onOpen();
    } else if ("success" in response) {
      setNewlyCreatedUser({
        email: response.success?.email,
        firstName: "",
        lastName: "",
        roles: response.success?.roles,
      });
      setSuccessBody(
        `Du har opprettet en bruker med e-postadressen ${newlyCreatedUser.email}.`,
      );
      modalInviteUserSuccess.onOpen();
      setEmailToInvite("");
    } else {
      setErrorBody("Noe gikk galt");
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
      <Divider className="mt-4" />
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
                {inviteTitle}
              </ModalHeader>
              <ModalBody>{inviteBody}</ModalBody>
              <ModalFooter>
                <Button
                  onPress={() => {
                    handleInviteUser();
                    modalInviteUser.onClose();
                  }}
                >
                  {inviteOkText}
                </Button>
                <Button color="danger" onPress={modalInviteUser.onClose}>
                  {inviteCancelText}
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
                {successTitle}
              </ModalHeader>
              <ModalBody>{successBody}</ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onPress={modalInviteUserSuccess.onClose}
                >
                  {successOkText}
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
                {errorTitle}
              </ModalHeader>
              <ModalBody>
                <p>{errorBody}</p>
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
                  {errorOkText}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
