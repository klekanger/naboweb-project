import { useUser } from "@clerk/nextjs";
import { inviteUser } from "@/app/actions/inviteUser";
import { UserAdminContext } from "@/context/userAdminContext";
import { useModalState } from "@/hooks/useModalState";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Description,
  Input,
  Label,
  Modal,
} from "@heroui/react";
import { useContext, useMemo, useState } from "react";

export default function InviteUser() {
  const loggedInUser = useUser();
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
    body: inviteBody,
    setBody: setInviteBody,
    okText: inviteOkText,
    cancelText: inviteCancelText,
  } = useModalState({
    initialTitle: "Er du sikker?",
    initialOkText: "Ok",
    initialCancelText: "Avbryt",
  });

  const {
    modal: modalInviteUserSuccess,
    title: successTitle,
    body: successBody,
    setBody: setSuccessBody,
    okText: successOkText,
  } = useModalState({
    initialTitle: "Brukeren er invitert",
    initialOkText: "Ok",
  });

  const {
    modal: modalErrorMessage,
    title: errorTitle,
    body: errorBody,
    setBody: setErrorBody,
    okText: errorOkText,
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

    if (
      loggedInUser.user?.primaryEmailAddress?.emailAddress?.toLowerCase() ===
      emailToInvite.trim().toLowerCase()
    ) {
      setErrorMessage("Du kan ikke invitere deg selv");
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
        `Du har invitert en bruker med e-postadressen ${newlyCreatedUser.email}.`,
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
      <hr className="mt-4 border-t border-divider" />
      <form onSubmit={handleSubmit} className="py-8" id="form">
        <div className="mb-5 sm:w-2/3">
          <Input
            label="E-post"
            type="email"
            required
            value={emailToInvite}
            onChange={(e) => {
              setErrorMessage("");
              setEmailToInvite(e.target.value);
            }}
            description="E-postadressen til den du vil invitere."
            className={isInvalidEmail ? "border-danger" : ""}
          />
          {isInvalidEmail && (
            <div className="text-danger text-sm mt-1">
              Tast inn en gyldig e-postadresse
            </div>
          )}
        </div>

        <CheckboxGroup
          name="roles"
          defaultValue={["user"]}
          value={roles}
          onChange={setRoles}
          className="flex flex-row gap-4"
        >
          <Label>Velg roller</Label>
          <Description>
            Alle må ha rollen 'Bruker' for å få tilgang til systemet. Redaktører
            kan opprette og redigere innhold, mens administratorer har tilgang
            til alle funksjoner.
          </Description>
          <Checkbox value="user" name="role-user" isDisabled>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex flex-col gap-1 mb-4">{inviteTitle}</div>
          <div className="mb-4">{inviteBody}</div>
          <div className="flex justify-end gap-2">
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
          </div>
        </div>
      </Modal>

      {/* MODAL FOR DISPLAYING SUCCESS MESSAGE */}
      <Modal
        isOpen={modalInviteUserSuccess.isOpen}
        onOpenChange={modalInviteUserSuccess.onOpenChange}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex flex-col gap-1 mb-4">{successTitle}</div>
          <div className="mb-4">{successBody}</div>
          <div className="flex justify-end gap-2">
            <Button color="primary" onPress={modalInviteUserSuccess.onClose}>
              {successOkText}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL FOR DISPLAYING ERRORS */}
      <Modal
        isOpen={modalErrorMessage.isOpen}
        onOpenChange={modalErrorMessage.onOpenChange}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex flex-col gap-1 mb-4">{errorTitle}</div>
          <div className="mb-4">
            <p>{errorBody}</p>
            <p>
              Hvis du mener noe er galt, ta kontakt med styret eller
              web-administrator.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              color="primary"
              onPress={() => {
                setErrorMessage("");
                modalErrorMessage.onClose();
              }}
            >
              {errorOkText}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
