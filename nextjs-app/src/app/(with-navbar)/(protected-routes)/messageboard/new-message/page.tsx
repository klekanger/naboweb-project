"use client";

import CustomButton from "@/components/CustomButton";
import MessageEditor from "@/components/pages/messageBoard/MessageEditor";
import {
  MessageEditorContext,
} from "@/context/messageEditorContext";
import { useModalState } from "@/hooks/useModalState";
import { currentUserRoles } from "@/lib/currentUserRoles";
import {
  getMessageValidationError,
  readMessageApiResponse,
  showMessageErrorModal,
  uploadMessageImage,
} from "@/components/pages/messageBoard/messageSubmitUtils";
import { useUser } from "@clerk/nextjs";
import { Card, Checkbox, Label, Modal, Spinner } from "@heroui/react";
import { PortableTextBlock } from "@portabletext/types";
import { MessagesSquare, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useLayoutEffect, useRef, useState } from "react";

const MAX_CHARACTERS = 1000;
const DEFAULT_REDIRECT_URL = "/messageboard/new-message";

// *********************************************************************
// CREATE NEW MESSAGE
// *********************************************************************
export default function NewMessage() {
  const userData = useUser();
  const { firstName, lastName, id } = userData?.user ?? {};
  const { isAdmin } = currentUserRoles(userData?.user as any);

  // State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [modalOkUrl, setModalOkUrl] = useState(DEFAULT_REDIRECT_URL);
  // Modal state using custom hook
  const {
    modal: modalForMessages,
    title: modalTitle,
    setTitle: setModalTitle,
    body: modalBody,
    setBody: setModalBody,
    okText: modalOkText,
    setOkText: setModalOkText,
    cancelText: modalCancelText,
    setCancelText: setModalCancelText,
    cancelDisabled: modalCancelDisabled,
    setCancelDisabled: setModalCancelDisabled,
    resetModal,
  } = useModalState();

  const router = useRouter();

  // We're fetching everything we need for the message editor from the MessageEditorContext
  const { message, messageImageFile, setMessage, setMessageImageFile, newMessageEditorMountKey } =
    useContext(MessageEditorContext);

  const clerkNameRef = useRef({ firstName, lastName });
  clerkNameRef.current = { firstName, lastName };

  const resetMessageEditorContext = useCallback(() => {
    if (!id) return;
    const { firstName: fn, lastName: ln } = clerkNameRef.current;
    setMessage({
      title: "",
      bodyText: [],
      author: {
        firstName: fn ?? "",
        lastName: ln ?? "",
      },
      userId: id,
      fromAdmin: false,
      messageImage: null,
    });
    setMessageImageFile(null);
  }, [id, setMessage, setMessageImageFile]);

  // Provider wraps the whole messageboard layout, so context survives route changes; reset before paint.
  useLayoutEffect(() => {
    resetMessageEditorContext();
  }, [resetMessageEditorContext]);

  if (!userData || !id) {
    return (
      <div className="mx-auto mt-32 text-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // *********************************************************************
  // Submit the message to Sanity
  // *********************************************************************
  const handleSubmit = async () => {
    const validationError = getMessageValidationError(
      message.title,
      message.bodyText as PortableTextBlock[] | null | undefined,
    );
    if (validationError) {
      if (validationError.includes("tittel")) {
        setModalTitle("Feil: Ugyldig tittel");
      } else {
        setModalTitle("Feil: For kort tekst");
      }
      setModalBody(validationError);
      setModalCancelDisabled(true);
      modalForMessages.onOpen();
      return;
    }

    let imageRef: string | null = null;

    if (messageImageFile !== null) {
      setIsUploadingImage(true);
      try {
        imageRef = await uploadMessageImage(messageImageFile, message.title);
      } catch (error: any) {
        console.error("Image upload failed. Server response:  ", error);

        setModalTitle("Det har oppstått en feil");
        setModalBody(`${error?.message ?? "Bildeopplasting feilet"}`);
        modalForMessages.onOpen();
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    // Create the message in Sanity
    setIsSubmittingMessage(true);
    try {
      const response = await fetch("/api/create-new-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: message.title,
          bodyText: (message.bodyText ?? []) as PortableTextBlock[],
          author: {
            firstName: firstName ?? "",
            lastName: lastName ?? "",
          },
          userId: id,
          image: imageRef ?? null,
          fromAdmin: message.fromAdmin,
        }),
      });

      const data = await readMessageApiResponse(response);

      if (data && typeof data === "object" && "success" in data) {
        resetMessageEditorContext();
        setModalTitle("Innlegget ble opprettet");
        setModalBody("Du blir nå tatt tilbake til oppslagstavlen.");
        setModalOkUrl(`/messageboard`);
        setModalCancelDisabled(true);

        modalForMessages.onOpen();
        // Refresh server-side data to include the newly created message
        router.refresh();
      }

    } catch (error: any) {
      showMessageErrorModal({
        error,
        setModalTitle,
        setModalBody,
        openModal: modalForMessages.onOpen,
      });
      return;
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  return (
    <>
      <Card className="p-2 py-8 mb-16">
        <Card.Header className="flex flex-col mb-0 pb-0">
          <div className="pb-4 pr-4 md:pb-8 flex gap-3 w-full">
            <div className="border-r border-black/20 pr-4">
              <MessagesSquare className="h-full" />
            </div>
            <h1 className="text-xl lg:text-3xl prose lg:prose-lg">
              Opprett nytt innlegg
            </h1>
          </div>
        </Card.Header>
        <Card.Content className="pt-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MessageEditor
            key={newMessageEditorMountKey}
            editorContent={[]}
          />
        </Card.Content>

        <Card.Footer>
          <div>
            <p className="text-xs mt-4 mb-4">
              Du publiserer som:{" "}
              {`${!message.fromAdmin ? `${firstName} ${lastName}` : "Styret"}`}
            </p>
            <div className="flex gap-4 flex-col md:flex-row">
              <CustomButton
                variant="secondary"
                href="/messageboard"
                className="no-underline"
              >
                Avbryt
              </CustomButton>
              <CustomButton
                variant="primary"
                onPress={handleSubmit}
                className="w-32"
                isPending={isSubmittingMessage || isUploadingImage}
                isDisabled={isSubmittingMessage || isUploadingImage}
              >
                {isSubmittingMessage || isUploadingImage ? (
                  "Sender..."
                ) : (
                  <>
                    <UploadIcon className="mr-2" />
                    Send inn
                  </>
                )}
              </CustomButton>
              {isAdmin && (
                <Checkbox
                  id="publish-as-admin"
                  isSelected={message.fromAdmin}
                  onChange={(e) => setMessage({ ...message, fromAdmin: e })}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label htmlFor="publish-as-admin">
                      Publiser på vegne av styret
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>

      {/*
        Modal for errors and messages
      */}
      <Modal.Backdrop
        isOpen={modalForMessages.isOpen}
        onOpenChange={modalForMessages.onOpenChange}
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
              <div className="flex justify-end gap-2 w-full">
                {!modalCancelDisabled && (
                  <CustomButton
                    variant="secondary"
                    onPress={() => {
                      resetModal();
                      modalForMessages.onClose();
                    }}
                  >
                    {modalCancelText}
                  </CustomButton>
                )}
                <CustomButton
                  variant="primary"
                  onPress={() => {
                    resetModal();
                    modalForMessages.onClose();
                    router.push(modalOkUrl);
                  }}
                >
                  {modalOkText}
                </CustomButton>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
