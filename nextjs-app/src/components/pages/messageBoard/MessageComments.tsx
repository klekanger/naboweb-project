import { compareClerkAndSanityUser } from "@/lib/compareClerkAndSanityUser";
import { formatDate } from "@/lib/format-date";
import { MessageByIdQueryResult } from "@/types/sanity.types";
import { useUser } from "@clerk/nextjs";
import { Card, Form, Input, Label, TextArea } from "@heroui/react";
import CustomButton from "@/components/CustomButton";
import { MessageSquare, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useModalState } from "@/hooks/useModalState";
import {
  readMessageApiResponse,
  showMessageErrorModal,
} from "./messageSubmitUtils";
import { MessageActionModal } from "./MessageActionModal";

interface CommentFormData {
  title: string;
  bodyText: string;
}

export default function MessageComments({
  comments,
  commentCount,
  messageId,
}: {
  comments: NonNullable<MessageByIdQueryResult>["comments"];
  commentCount: number;
  messageId: string;
}) {
  const userData = useUser();
  const router = useRouter();

  // State
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [editingCommentKey, setEditingCommentKey] = useState<string>("");
  const [deletingCommentKey, setDeletingCommentKey] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  // Modal state using custom hook
  const {
    modal: modalForComments,
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
    isConfirmDelete,
    setIsConfirmDelete,
    resetModal,
  } = useModalState();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // API Handlers
  const handleCreateComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const commentData: CommentFormData = {
      title: formData.get("title") as string,
      bodyText: formData.get("bodyText") as string,
    };

    try {
      const response = await fetch("/api/create-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: messageId,
          ...commentData,
        }),
      });

      const data = await readMessageApiResponse(response);

      if (data && typeof data === "object" && "success" in data) {
        setModalTitle("Kommentaren ble lagt til");
        setModalBody("");
        setModalOkText("Ok");
        setModalCancelDisabled(true);
        modalForComments.onOpen();

        await revalidateMessageboard();
      }
    } catch (error: any) {
      showMessageErrorModal({
        error,
        setModalTitle,
        setModalBody,
        openModal: modalForComments.onOpen,
      });
    } finally {
      setIsSubmitting(false);
      setIsCreatingComment(false);
    }
  };

  const handleEditComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!editingCommentKey) {
      console.error("No comment key found");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const commentData: CommentFormData = {
      title: formData.get("title") as string,
      bodyText: formData.get("bodyText") as string,
    };

    try {
      const response = await fetch("/api/edit-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          commentKey: editingCommentKey,
          ...commentData,
        }),
      });

      const data = await readMessageApiResponse(response);

      if (data && typeof data === "object" && "success" in data) {
        setModalTitle("Kommentaren ble oppdatert");
        setModalBody("Siden vil bli oppdatert.");
        setModalCancelDisabled(true);
        modalForComments.onOpen();

        await revalidateMessageboard();
      }
    } catch (error: any) {
      showMessageErrorModal({
        error,
        setModalTitle,
        setModalBody,
        openModal: modalForComments.onOpen,
      });
    } finally {
      setIsSubmitting(false);
      setEditingCommentKey("");
    }
  };

  const handleDelete = async (commentKey: string) => {
    setDeletingCommentKey(commentKey);
    setModalTitle("Slett kommentar");
    setModalBody("Er du sikker på at du vil slette denne kommentaren?");
    setModalOkText("Slett");
    setModalCancelText("Avbryt");
    setModalCancelDisabled(false);
    setIsConfirmDelete(true);
    modalForComments.onOpen();
  };

  const handleConfirmDelete = async () => {
    if (!deletingCommentKey) return;

    setIsDeletingComment(true);

    try {
      const response = await fetch("/api/delete-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          commentKey: deletingCommentKey,
        }),
      });

      const data = await readMessageApiResponse(response);

      if (data && typeof data === "object" && "success" in data) {
        setModalTitle("Kommentaren ble slettet");
        setModalBody("");
        setModalOkText("Ok");
        setModalCancelDisabled(true);
        setIsConfirmDelete(false);

        await revalidateMessageboard();
      }
    } catch (error: any) {
      showMessageErrorModal({
        error,
        setModalTitle,
        setModalBody,
        openModal: () => {},
      });
      setIsConfirmDelete(false);
    } finally {
      setDeletingCommentKey("");
      setIsDeletingComment(false);
    }
  };

  // Helper function to revalidate the messageboard
  const revalidateMessageboard = async () => {
    try {
      await fetch("/api/revalidate-messageboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: messageId }),
      });
      router.refresh();
    } catch (error: any) {
      throw new Error(`Revalidation failed. Server response: ${error}`);
    }
  };

  return (
    <>
      <Card className="lg:p-4">
        <div className="flex-col items-start! p-4">
          <h2 className="text-lg font-semibold flex">
            <MessageSquare className="h-auto mr-2" />
            Kommentarer ({commentCount})
          </h2>
        </div>

        <div className="p-4">
          <div className="prose lg:prose-xl pb-8">
            {comments?.map((comment) => {
              const userIsMessageAuthor = compareClerkAndSanityUser({
                clerkUser: userData?.user?.id ?? "",
                sanityUser: comment?.commentAuthor?._id ?? "",
              });

              const isEditing = editingCommentKey === comment._key;

              return (
                <div
                  key={comment._key}
                  className="border-b border-brand-black/10 mt-4 pb-8"
                >
                  <div className="flex justify-start max-w-3xl mx-auto text-sm not-prose text-brand-black/50 pt-2">
                    {comment?.commentAuthor && (
                      <>
                        <User className="inline-block mr-2" size={16} />
                        <span className="inline-block">
                          {`${comment?.commentAuthor?.firstName} ${comment?.commentAuthor?.lastName}`}
                        </span>
                        <span className="px-2 text-base"> · </span>
                      </>
                    )}
                    {comment?.published && (
                      <time
                        dateTime={String(comment?.published)}
                        className="inline-block"
                      >
                        {formatDate(comment?.published)}
                      </time>
                    )}
                  </div>

                  {isClient && isEditing ? (
                    <Form
                      onSubmit={handleEditComment}
                      className="w-full max-w-xl mt-4 flex flex-col gap-4"
                      validationBehavior="native"
                    >
                      <div className="flex flex-col gap-2 ">
                        <Label htmlFor="title-edit" isRequired>
                          Tittel
                        </Label>
                        <Input
                          id="title-edit"
                          name="title"
                          defaultValue={comment.commentTitle ?? ""}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="bodyText-edit" isRequired>
                          Skriv kommentaren din her
                        </Label>
                        <TextArea
                          id="bodyText-edit"
                          className="w-full"
                          name="bodyText"
                          defaultValue={comment.commentText ?? ""}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <CustomButton
                          type="submit"
                          isPending={isSubmitting}
                          isDisabled={isSubmitting}
                        >
                          Lagre
                        </CustomButton>
                        <CustomButton
                          variant="secondary"
                          onPress={() => setEditingCommentKey("")}
                        >
                          Avbryt
                        </CustomButton>
                      </div>
                    </Form>
                  ) : (
                    <>
                      <h3 className="font-semibold not-prose text-xl md:text-2xl mb-4">
                        {comment.commentTitle}
                      </h3>
                      <p className="prose">{comment.commentText}</p>
                      {isClient && userIsMessageAuthor && (
                        <div className="flex justify-end gap-2">
                          <CustomButton
                            size="sm"
                            variant="primary"
                            className="mt-2"
                            onPress={() =>
                              setEditingCommentKey(comment._key ?? "")
                            }
                          >
                            Rediger
                          </CustomButton>

                          <CustomButton
                            size="sm"
                            variant="danger"
                            className="mt-2"
                            onPress={() => handleDelete(comment._key ?? "")}
                          >
                            Slett
                          </CustomButton>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 p-4">
          {isClient && (
            <>
              {!isCreatingComment && (
                <CustomButton
                  onPress={() => setIsCreatingComment(true)}
                  isDisabled={editingCommentKey !== ""}
                >
                  Ny kommentar
                </CustomButton>
              )}

              {isCreatingComment && (
                <Form
                  onSubmit={handleCreateComment}
                  className="w-full max-w-xl mb-5"
                  validationBehavior="native"
                >
                  <h3 className="text-lg font-semibold mb-5">
                    Opprett ny kommentar
                  </h3>
                  <div className="flex flex-col gap-2 mb-5">
                    <Label htmlFor="title-create">Tittel</Label>
                    <Input id="title-create" name="title" required />
                  </div>
                  <div className="flex flex-col gap-2 mb-5">
                    <Label htmlFor="bodyText-create">
                      Skriv kommentaren din her
                    </Label>
                    <TextArea
                      id="bodyText-create"
                      className="w-full"
                      name="bodyText"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <CustomButton
                      type="submit"
                      isPending={isSubmitting}
                      isDisabled={isSubmitting}
                    >
                      Svar
                    </CustomButton>
                    <CustomButton
                      variant="secondary"
                      onPress={() => setIsCreatingComment(false)}
                    >
                      Avbryt
                    </CustomButton>
                  </div>
                </Form>
              )}
            </>
          )}
        </div>
      </Card>

      {isClient && (
        <MessageActionModal
          isOpen={modalForComments.isOpen}
          onOpenChange={modalForComments.onOpenChange}
          title={modalTitle}
          body={modalBody}
          okText={modalOkText}
          cancelText={modalCancelText}
          isCancelDisabled={modalCancelDisabled}
          okVariant={isConfirmDelete ? "danger" : "primary"}
          isPending={isDeletingComment}
          isDisabled={isDeletingComment}
          onCancel={() => {
            resetModal();
            modalForComments.onClose();
          }}
          onConfirm={() => {
            if (isConfirmDelete) {
              void handleConfirmDelete();
              return;
            }

            resetModal();
            modalForComments.onClose();
          }}
        />
      )}
    </>
  );
}
