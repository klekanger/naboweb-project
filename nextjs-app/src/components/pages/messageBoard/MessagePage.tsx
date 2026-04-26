"use client";

import MessageEditor from "@/components/pages/messageBoard/MessageEditor";
import {
  getMessagePortableTextCharacterCount,
  MessageEditorContext,
} from "@/context/messageEditorContext";
import { useModalState } from "@/hooks/useModalState";
import { compareClerkAndSanityUser } from "@/lib/compareClerkAndSanityUser";
import { currentUserRoles } from "@/lib/currentUserRoles";
import { CustomPortableText } from "@/lib/CustomPortableText";
import { formatDate } from "@/lib/format-date";
import { urlForImage } from "@/sanity/lib/utils";
import { MessagePageProps } from "@/types/types";
import { useUser } from "@clerk/nextjs";
import { Card, Modal } from "@heroui/react";
import CustomButton from "@/components/CustomButton";
import ShareButtons from "@/components/ShareButtons";
import {
  ArrowLeftIcon,
  CircleUser,
  MessagesSquare,
  Shield,
  UploadIcon,
  X,
} from "lucide-react";
import { PortableTextBlock } from "next-sanity";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { useContext, useMemo, useState } from "react";
import type { Image as SanityImage } from "sanity";
import MessageComments from "./MessageComments";

const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 600;
const DEFAULT_REDIRECT_URL = "/messageboard/";

export default function MessagePage(props: MessagePageProps) {
  const { data } = props;

  const userData = useUser();
  const { firstName, lastName, id } = userData?.user ?? {};
  const { isAdmin } = currentUserRoles(userData?.user as any);

  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [showAbortEditConfirm, setShowAbortEditConfirm] = useState(false);
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

  const { message, messageImageFile, setMessage, setMessageImageFile } =
    useContext(MessageEditorContext);

  const userIsMessageAuthor = compareClerkAndSanityUser({
    clerkUser: userData?.user?.id ?? "",
    sanityUser: data?.author?._id ?? "",
  });

  const {
    _id,
    messageImage,
    tags,
    title,
    bodyText,
    _createdAt,
    _updatedAt,
    author,
    fromAdmin,
    comments = [],
  } = data ?? {};

  if (!data) {
    notFound();
  }

  if (!userData) {
    console.error("No user data found");
    return null;
  }

  const commentCount = comments?.length ?? 0;

  const initialEditSnapshot = useMemo(
    () =>
      JSON.stringify({
        title: title ?? "",
        bodyText: bodyText ?? [],
        fromAdmin: fromAdmin ?? false,
        imageFile: null,
      }),
    [title, bodyText, fromAdmin],
  );

  const currentEditSnapshot = useMemo(
    () =>
      JSON.stringify({
        title: message.title ?? "",
        bodyText: message.bodyText ?? [],
        fromAdmin: message.fromAdmin ?? false,
        imageFile: messageImageFile ? messageImageFile.name : null,
      }),
    [message.title, message.bodyText, message.fromAdmin, messageImageFile],
  );

  const isEditDirty = currentEditSnapshot !== initialEditSnapshot;

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

    const messageCharacterCount = getMessagePortableTextCharacterCount(
      message.bodyText,
    );
    if (messageCharacterCount < 10) {
      setModalTitle("Feil: For kort tekst");
      setModalBody(
        "Det er alltid fint å fatte seg i korthet, men innlegget ditt må være litt lenger (mer enn 10 tegn).",
      );
      setModalCancelDisabled(true);
      modalForMessages.onOpen();
      return;
    }

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
      const response = await fetch("/api/update-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: _id,
          title: message.title,
          bodyText: (message.bodyText ?? []) as PortableTextBlock[],
          author: {
            firstName: author?.firstName ?? "", // If the message has an author, use that. Otherwise, use the current user's first name.
            lastName: author?.lastName ?? "", // If the message has an author, use that. Otherwise, use the current user's last name.
          },
          userId: author?._id ?? null,
          isAdmin: isAdmin,
          image: imageRef ?? null,
          fromAdmin: message.fromAdmin,
        }),
      });

      const data = await response.json();

      if ("success" in data) {
        setModalTitle("Innlegget ble oppdatert");
        setModalBody("Du blir nå tatt tilbake til oppslagstavlen.");
        setModalOkUrl(`/messageboard`);
        setModalCancelDisabled(true);

        try {
          await fetch("/api/revalidate-messageboard", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: _id,
            }),
          });
        } catch (error: any) {
          throw new Error(`Revalidation failed. Server response: ${error}`);
        }

        // Refresh server-side data before navigating back to messageboard
        router.refresh();
        modalForMessages.onOpen();
      }

      if ("error" in data) {
        throw new Error(data.error?.message ?? "Noe gikk galt");
      }
    } catch (error: any) {
      console.error(error);
      setModalTitle("Det oppsto en feil");
      setModalBody(`${error?.message ?? "Ukjent feil"}`);
      setModalOkUrl("");
      modalForMessages.onOpen();
      return;
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  // *********************************************************************
  // Delete the message from Sanity
  // *********************************************************************

  const handleDeleteMessage = () => {
    setModalTitle("Bekreft sletting");
    setModalBody(
      "Er du sikker på at du vil slette dette innlegget? Dette kan ikke angres.",
    );
    setModalOkText("Slett");
    setModalCancelText("Avbryt");
    setModalCancelDisabled(false);
    setModalOkUrl("");
    modalForMessages.onOpen();
  };

  const deleteMessageAfterConfirmation = async () => {
    setIsDeletingMessage(true);
    try {
      const response = await fetch("/api/delete-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: _id,
          userId: author?._id ?? null,
        }),
      });

      const data = await response.json();

      if ("success" in data) {
        // Navigate immediately to avoid 404 (message no longer exists)
        // Close any open modals first
        modalForMessages.onClose();
        router.refresh();
        router.push("/messageboard");
      }

      if ("error" in data) {
        throw new Error(data.error?.message ?? "Noe gikk galt");
      }
    } catch (error: any) {
      console.error("Error deleting message:", error);
      setModalTitle("Feil ved sletting");
      setModalBody(error?.message ?? "Kunne ikke slette innlegget");
      setModalOkText("OK");
      setModalCancelDisabled(true);
      modalForMessages.onOpen();
    } finally {
      setIsDeletingMessage(false);
    }
  };

  const startEditing = () => {
    setMessage({
      ...message,
      title: title ?? "",
      bodyText: (bodyText ?? []) as any,
      fromAdmin: fromAdmin ?? false,
    });
    setMessageImageFile(null);
    setIsEditingMessage(true);
  };

  const requestAbortEditing = () => {
    if (!isEditDirty) {
      setIsEditingMessage(false);
      return;
    }
    setShowAbortEditConfirm(true);
  };

  const confirmAbortEditing = () => {
    setMessage({
      ...message,
      title: title ?? "",
      bodyText: (bodyText ?? []) as any,
      fromAdmin: fromAdmin ?? false,
    });
    setMessageImageFile(null);
    setIsEditingMessage(false);
    setShowAbortEditConfirm(false);
  };

  return (
    <>
      <Card className="p-2 py-8 mb-8">
        <div className="flex flex-col items-start p-4">
          {isEditingMessage ? (
            <div className="pb-4 pr-4 md:pb-8 flex gap-3 w-full justify-between items-start">
              <div className="border-r border-black/20 pr-4">
                <MessagesSquare className="h-full" />
              </div>
              <div className="flex items-start justify-between w-full">
                <h1 className="text-xl lg:text-3xl prose lg:prose-lg">
                  Rediger innlegg
                </h1>
                <button
                  type="button"
                  aria-label="Avbryt redigering"
                  onClick={requestAbortEditing}
                  className="rounded-md border border-brand-black/20 p-2 hover:bg-default/60 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="font-thin text-base pb-2 flex text-brand-black/60">
              {fromAdmin ? (
                <Shield className="h-auto pr-2" />
              ) : (
                <CircleUser className="h-auto pr-2" />
              )}
              {fromAdmin
                ? "Styret"
                : `${author?.firstName ?? ""} ${author?.lastName ?? ""} | ${formatDate(_createdAt ?? "")} ${
                    _updatedAt !== _createdAt
                      ? `(oppdatert ${formatDate(_updatedAt ?? null)})`
                      : ""
                  }`}
            </div>
          )}
        </div>

        <div className="pt-0 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          {!isEditingMessage ? (
            <>
              <div className="prose lg:prose-xl pb-8">
                <h1 className="text-xl lg:text-3xl prose lg:prose-lg">
                  {title}
                </h1>
                <CustomPortableText
                  value={bodyText}
                  paragraphClasses="prose lg:prose-xl"
                />
              </div>
              {messageImage && (
                <Image
                  src={
                    urlForImage(messageImage as SanityImage)
                      ?.width(IMAGE_WIDTH)
                      .height(IMAGE_HEIGHT)
                      .fit("max")
                      .dpr(2)
                      .url() ?? ""
                  }
                  alt={messageImage?.alt ?? ""}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  width={IMAGE_WIDTH}
                  height={IMAGE_HEIGHT}
                  style={{
                    objectFit: "cover",
                  }}
                  priority
                  className="rounded-xl mb-0 pb-0"
                />
              )}
            </>
          ) : (
            <MessageEditor
              editorContent={bodyText ?? ([] as any)}
              messageImage={messageImage as SanityImage}
              title={title ?? ""}
              maxCharacters={1000}
            />
          )}
        </div>
        <div className="p-4">
          <div className="flex gap-4 flex-col md:flex-row w-full">
            {isEditingMessage ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs mt-4 ">
                  Du publiserer som:{" "}
                  {`${!message.fromAdmin ? `${author?.firstName ?? firstName} ${author?.lastName ?? lastName}` : "Styret"}`}
                </p>

                <div className="flex gap-4">
                  <CustomButton
                    variant="secondary"
                    onPress={requestAbortEditing}
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
                    Send inn
                  </CustomButton>
                </div>
              </div>
            ) : (
              <>
                <CustomButton
                  variant="primary"
                  onPress={() => {
                    router.refresh();
                    router.push("/messageboard");
                  }}
                  className="no-underline"
                >
                  <ArrowLeftIcon className="mr-2" />
                  Tilbake
                </CustomButton>

                {userIsMessageAuthor || isAdmin ? (
                  <>
                    <CustomButton
                      variant="primary"
                      onPress={startEditing}
                    >
                      Rediger {!userIsMessageAuthor ? "(admin)" : ""}
                    </CustomButton>
                    <CustomButton
                      variant="danger"
                      onPress={handleDeleteMessage}
                    >
                      Slett {!userIsMessageAuthor ? "(admin)" : ""}
                    </CustomButton>
                  </>
                ) : null}
              </>
            )}
          </div>
          <ShareButtons
            title={title ?? ""}
            shareText="Del dette innlegget"
            className="pt-4 pb-0"
          />
        </div>
      </Card>

      <MessageComments
        comments={comments}
        commentCount={commentCount}
        messageId={_id ?? ""}
      />

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
                  variant={
                    modalTitle === "Bekreft sletting" ? "danger" : "primary"
                  }
                  isPending={
                    modalTitle === "Bekreft sletting" && isDeletingMessage
                  }
                  onPress={() => {
                    if (modalTitle === "Bekreft sletting") {
                      void deleteMessageAfterConfirmation();
                    } else {
                      resetModal();
                      modalForMessages.onClose();
                      // Refresh before navigating to ensure messageboard is up to date
                      router.refresh();
                      router.push(modalOkUrl);
                    }
                  }}
                >
                  {modalOkText}
                </CustomButton>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop
        isOpen={showAbortEditConfirm}
        onOpenChange={(open) => {
          if (!open) setShowAbortEditConfirm(false);
        }}
        variant="blur"
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Er du sikker?</Modal.Heading>
            </Modal.Header>
            <Modal.Footer className="flex flex-wrap justify-end gap-2">
              <CustomButton
                variant="secondary"
                onPress={() => setShowAbortEditConfirm(false)}
              >
                Avbryt
              </CustomButton>
              <CustomButton onPress={confirmAbortEditing}>Bekreft</CustomButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
