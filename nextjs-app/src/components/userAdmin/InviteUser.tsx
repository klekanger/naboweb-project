// fallow-ignore-file unused-file
import { useUser } from "@clerk/nextjs";
import { inviteUser } from "@/app/actions/inviteUser";
import { UserAdminContext } from "@/context/userAdminContext";
import { useModalState } from "@/hooks/useModalState";
import {
  Checkbox,
  CheckboxGroup,
  Description,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
} from "@heroui/react";
import CustomButton from "../CustomButton";
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
    <div className="px-4 py-4 text-left mb-8 pt-4 bg-white">
      <h3 className="mt-0 text-lg font-semibold">Opprett invitasjon</h3>
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
          <TextField
            name="email"
            type="email"
            isRequired
            isInvalid={isInvalidEmail}
            value={emailToInvite}
            onChange={(value) => {
              setErrorMessage("");
              setEmailToInvite(value);
            }}
          >
            <Label>E-post</Label>
            <Input />
            {isInvalidEmail ? (
              <FieldError>Tast inn en gyldig e-postadresse</FieldError>
            ) : (
              <Description>E-postadressen til den du vil invitere.</Description>
            )}
          </TextField>
        </div>

        <CheckboxGroup
          name="roles"
          defaultValue={["user"]}
          value={roles}
          onChange={setRoles}
          className="flex flex-col"
        >
          <Label>Velg roller</Label>
          <div className="flex flex-row gap-4">
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
          </div>
          <Description className="mt-4">
            Alle må ha rollen &apos;Bruker&apos; for å få tilgang til systemet. Redaktører
            kan opprette og redigere innhold, mens administratorer har tilgang
            til alle funksjoner.
          </Description>
        </CheckboxGroup>

        <div className="h-32">
          <CustomButton
            variant="primary"
            onPress={() => {
              const form = document.getElementById("form") as HTMLFormElement;
              if (form) {
                form.requestSubmit();
              }
            }}
            className="mt-8"
          >
            {isInvitingUser ? "Inviterer..." : "Inviter bruker"}
          </CustomButton>
          {errorMessage && (
            <p className="text-brand-danger text-sm mt-2">{errorMessage}</p>
          )}
        </div>
      </form>

      {/* MODAL FOR CONFIRMING USER INVITE */}
      <Modal.Backdrop
        isOpen={modalInviteUser.isOpen}
        onOpenChange={modalInviteUser.onOpenChange}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{inviteTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>{inviteBody}</Modal.Body>
            <Modal.Footer className="flex flex-wrap justify-end gap-2">
              <CustomButton variant="secondary" onPress={modalInviteUser.onClose}>
                {inviteCancelText}
              </CustomButton>
              <CustomButton
                variant="primary"
                onPress={() => {
                  handleInviteUser();
                  modalInviteUser.onClose();
                }}
              >
                {inviteOkText}
              </CustomButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {/* MODAL FOR DISPLAYING SUCCESS MESSAGE */}
      <Modal.Backdrop
        isOpen={modalInviteUserSuccess.isOpen}
        onOpenChange={modalInviteUserSuccess.onOpenChange}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{successTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>{successBody}</Modal.Body>
            <Modal.Footer>
              <CustomButton
                variant="primary"
                onPress={modalInviteUserSuccess.onClose}
              >
                {successOkText}
              </CustomButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {/* MODAL FOR DISPLAYING ERRORS */}
      <Modal.Backdrop
        isOpen={modalErrorMessage.isOpen}
        onOpenChange={modalErrorMessage.onOpenChange}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-lg">{errorTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="mt-4 flex flex-col gap-3">
              <p>{errorBody}</p>
              <p>
                Hvis du mener noe er galt, ta kontakt med styret eller
                web-administrator.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <CustomButton
                variant="primary"
                onPress={() => {
                  setErrorMessage("");
                  modalErrorMessage.onClose();
                }}
              >
                {errorOkText}
              </CustomButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
