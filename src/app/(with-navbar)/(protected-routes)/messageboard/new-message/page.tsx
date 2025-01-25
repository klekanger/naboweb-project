"use client";

import MessageEditor from "@/components/pages/messageBoard/MessageEditor";
import { MessageEditorContext } from "@/context/messageEditorContext";
import { currentUserRoles } from "@/lib/currentUserRoles";
import { useUser } from "@clerk/nextjs";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { PortableTextBlock } from "@portabletext/types";
import { htmlToBlocks } from "@sanity/block-tools";
import { Schema } from "@sanity/schema";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  MessagesSquare,
  UnderlineIcon,
  UploadIcon,
} from "lucide-react";
import Link from "next/link";
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

  // Set up everything we need for the modal
  const modalForMessages = useDisclosure();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalOkText, setModalOkText] = useState("Ok");
  const [modalCancelText, setModalCancelText] = useState("Avbryt");
  const [modalCancelDisabled, setModalCancelDisabled] = useState(false);
  const [modalOkUrl, setModalOkUrl] = useState(DEFAULT_REDIRECT_URL);

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

        try {
          await fetch("/api/revalidate-messageboard", {
            method: "POST",
          });
        } catch (error: any) {
          throw new Error(`Revalidation failed. Server response: ${error}`);
        }

        modalForMessages.onOpen();
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

  const resetModal = () => {
    setModalTitle("");
    setModalBody("");
    setModalOkText("Ok");
    setModalCancelText("Avbryt");
    setModalOkUrl(DEFAULT_REDIRECT_URL);
    setModalCancelDisabled(false);
  };

  const percentage = editor
    ? Math.round(
        (100 / MAX_CHARACTERS) * editor.storage.characterCount.characters(),
      )
    : 0;

  return (
    <>
      <Card className="p-2 py-8 mb-16">
        <CardHeader className="flex flex-col mb-0 pb-0">
          <div className="pb-4 pr-4 md:pb-8 flex gap-3 w-full">
            <div className="border-r-1 border-black/20 pr-4">
              <MessagesSquare className="h-full" />
            </div>
            <h1 className="text-xl lg:text-3xl prose lg:prose-lg">
              Opprett nytt innlegg
            </h1>
          </div>
        </CardHeader>
        <CardBody className="pt-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MessageEditor />
        </CardBody>

        <CardFooter>
          <div>
            <p className="text-xs mt-4 mb-4">
              Du publiserer som:{" "}
              {`${!message.fromAdmin ? `${firstName} ${lastName}` : "Styret"}`}
            </p>
            <div className="flex gap-4 flex-col md:flex-row">
              <Button
                color="danger"
                as={Link}
                href="/messageboard"
                className="no-underline"
              >
                Avbryt
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isSubmittingMessage || isUploadingImage}
                startContent={
                  !isUploadingImage && !isSubmittingMessage && <UploadIcon />
                }
                className="w-32"
              >
                Send inn
              </Button>
              {isAdmin && (
                <Checkbox
                  isSelected={message.fromAdmin}
                  onValueChange={(e) =>
                    setMessage({ ...message, fromAdmin: e })
                  }
                >
                  Publiser på vegne av styret
                </Checkbox>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>

      {/*
        Modal for errors and messages
      */}
      <Modal
        isOpen={modalForMessages.isOpen}
        onOpenChange={modalForMessages.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {modalTitle}
              </ModalHeader>
              <ModalBody>{modalBody}</ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  className={`${modalCancelDisabled ? "hidden" : ""}`}
                  isDisabled={modalCancelDisabled}
                  onPress={() => {
                    resetModal();
                    modalForMessages.onClose();
                  }}
                >
                  {modalCancelText}
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    resetModal();
                    modalForMessages.onClose();
                    router.push(modalOkUrl);
                  }}
                >
                  {modalOkText}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

// Text editor toolbar
const MenuBar = ({
  editor,
  percentage,
}: {
  editor: Editor | null;
  percentage: number;
}) => {
  if (!editor) {
    return null;
  }

  return (
    <div role="toolbar">
      <div className="button-group flex gap-2 py-2 bg-default-100 px-2 rounded-t-lg">
        <Button
          size="sm"
          isIconOnly
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-brand-primary" : ""}
          aria-label="Bold"
          title="Bold"
        >
          <Bold className="w-[1rem] h-[1rem]" strokeWidth={3} />
        </Button>
        <Button
          size="sm"
          isIconOnly
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-brand-primary" : ""}
          aria-label="Italic"
          title="Italic"
        >
          <Italic className="w-[1rem] h-[1rem]" />
        </Button>
        <Button
          size="sm"
          isIconOnly
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-brand-primary" : ""}
          aria-label="Underline"
          title="Underline"
        >
          <UnderlineIcon className="w-[1rem] h-[1rem]" />
        </Button>

        <Button
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "bg-brand-primary" : ""
          }
        >
          Mellomtittel
        </Button>
        <div
          className={`items-center flex text-xs text-brand-black/60 gap-2 ml-4 ${editor && editor.storage.characterCount.characters() === MAX_CHARACTERS ? "character-count--warning" : ""}`}
        >
          <svg height="20" width="20" viewBox="0 0 20 20">
            <circle r="10" cx="10" cy="10" fill="#C8DD80" />
            <circle
              r="5"
              cx="10"
              cy="10"
              fill="transparent"
              stroke="#005600"
              strokeWidth="10"
              strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
              transform="rotate(-90) translate(-20)"
            />
            <circle r="6" cx="10" cy="10" fill="white" />
          </svg>
          {editor && editor.storage.characterCount.characters()} /{" "}
          {MAX_CHARACTERS} tegn
        </div>
      </div>
    </div>
  );
};
