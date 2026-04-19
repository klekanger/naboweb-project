"use client";

import CustomButton from "@/components/CustomButton";
import MessageEditor from "@/components/pages/messageBoard/MessageEditor";
import { MessageEditorContext } from "@/context/messageEditorContext";
import { useModalState } from "@/hooks/useModalState";
import { currentUserRoles } from "@/lib/currentUserRoles";
import { useUser } from "@clerk/nextjs";
import { Card, Checkbox, Label, Modal, Spinner } from "@heroui/react";
import { htmlToBlocks } from "@portabletext/block-tools";
import { PortableTextBlock } from "@portabletext/types";
import { Schema } from "@sanity/schema";
import { MessagesSquare, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

const MAX_CHARACTERS = 1000;
const DEFAULT_REDIRECT_URL = "/messageboard/new-message";

const defaultSchema = Schema.compile({
  name: "myMessage",
  types: [
    {
      type: "object",
      name: "message",
      fields: [
        {
          title: "Body",
          name: "bodyText",
          type: "array",
          of: [{ type: "block" }],
        },
      ],
    },
  ],
});

const blockContentType = defaultSchema
  .get("message")
  .fields.find((field: { name: string }) => field.name === "bodyText").type;

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
  const { editor, message, messageImageFile, setMessage, setMessageImageFile } =
    useContext(MessageEditorContext);

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
    if (message.title === "") {
      setModalTitle("Feil: Ugyldig tittel");
      setModalBody("Meldingen din trenger en tittel.");
      setModalCancelDisabled(true);

      modalForMessages.onOpen();
      return;
    }

    if (!editor) return;

    if (editor.storage.characterCount.characters() < 10) {
      setModalTitle("Feil: For kort tekst");
      setModalBody(
        "Det er alltid fint å fatte seg i korthet, men innlegget ditt må være litt lenger (mer enn 10 tegn).",
      );
      setModalCancelDisabled(true);

      modalForMessages.onOpen();
      return;
    }

    const bodyText = editor.getHTML();

    const textBlocks = htmlToBlocks(bodyText, blockContentType);
    let imageRef: string | null = null;

    // 1: If there is a message image, upload it to Sanity
    if (messageImageFile !== null) {
      const fileData = new FormData();

      fileData.set("messageImage", messageImageFile as File);
      fileData.set("title", message.title);

      setIsUploadingImage(true);

      try {
        const fileUploadResponse = await fetch("/api/upload-image-to-sanity", {
          method: "POST",
          body: fileData,
        });

        const fileUploadData = await fileUploadResponse.json();

        if ("success" in fileUploadData) {
          imageRef = fileUploadData.success?.imageId;
        }

        if ("error" in fileUploadData) {
          throw new Error(fileUploadData.error?.message ?? "Noe gikk galt");
        }
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
          bodyText: textBlocks as PortableTextBlock[],
          author: {
            firstName: firstName ?? "",
            lastName: lastName ?? "",
          },
          userId: id,
          image: imageRef ?? null,
          fromAdmin: message.fromAdmin,
        }),
      });

      const data = await response.json();

      if ("success" in data) {
        setModalTitle("Innlegget ble opprettet");
        setModalBody("Du blir nå tatt tilbake til oppslagstavlen.");
        setModalOkUrl(`/messageboard`);
        setModalCancelDisabled(true);

        modalForMessages.onOpen();
        // Refresh server-side data to include the newly created message
        router.refresh();
      }

      if ("error" in data) {
        throw new Error(data.error?.message ?? "Noe gikk galt");
      }
    } catch (error: any) {
      console.error(error);
      setModalTitle("Det oppsto en feil");
      setModalBody(`${error?.message ?? "Ukjent feil"}`);
      modalForMessages.onOpen();
      return;
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleImageSelect = (selectedImages: File[] | null) => {
    setMessageImageFile(selectedImages?.[0] ?? null);
  };

  const percentage = editor
    ? Math.round(
        (100 / MAX_CHARACTERS) * editor.storage.characterCount.characters(),
      )
    : 0;

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
          <MessageEditor />
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
