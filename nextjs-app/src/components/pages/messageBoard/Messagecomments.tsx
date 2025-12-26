import { compareClerkAndSanityUser } from "@/lib/compareClerkAndSanityUser";
import { formatDate } from "@/lib/format-date";
import { MessageByIdQueryResult } from "@/types/sanity.types";
import { useUser } from "@clerk/nextjs";
import { Button, Card, Form, Input, Modal, Textarea } from "@heroui/react";
import { MessageSquare, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useModalState } from "@/hooks/useModalState";

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
  const userId = userData?.user?.id ?? "";
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
          userId,
        }),
      });

      const data = await response.json();

      if ("success" in data) {
        setModalTitle("Kommentaren ble lagt til");
        setModalBody("");
        setModalOkText("Ok");
        setModalCancelDisabled(true);
        modalForComments.onOpen();

        await revalidateMessageboard();
      }

      if ("error" in data) {
        throw new Error(data.error?.message ?? "Noe gikk galt");
      }
    } catch (error: any) {
      console.error(error);
      setModalTitle("Det oppsto en feil");
      setModalBody(`${error?.message ?? "Ukjent feil"}`);
      modalForComments.onOpen();
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
          userId,
        }),
      });

      const data = await response.json();

      if ("success" in data) {
        setModalTitle("Kommentaren ble oppdatert");
        setModalBody("Siden vil bli oppdatert.");
        setModalCancelDisabled(true);
        modalForComments.onOpen();

        await revalidateMessageboard();
      }

      if ("error" in data) {
        throw new Error(data.error?.message ?? "Noe gikk galt");
      }
    } catch (error: any) {
      console.error(error);
      setModalTitle("Det oppsto en feil");
      setModalBody(`${error?.message ?? "Ukjent feil"}`);
      modalForComments.onOpen();
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
          userId,
        }),
      });

      const data = await response.json();

      if ("success" in data) {
        setModalTitle("Kommentaren ble slettet");
        setModalBody("");
        setModalOkText("Ok");
        setModalCancelDisabled(true);
        setIsConfirmDelete(false);

        await revalidateMessageboard();
      }

      if ("error" in data) {
        throw new Error(data.error?.message ?? "Noe gikk galt");
      }
    } catch (error: any) {
      console.error(error);
      setModalTitle("Det oppsto en feil");
      setModalBody(`${error?.message ?? "Ukjent feil"}`);
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
        <div className="flex-col !items-start p-4">
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
                      className="w-full max-w-xl mt-4"
                      validationBehavior="native"
                    >
                      <Input
                        label="Tittel"
                        name="title"
                        defaultValue={comment.commentTitle ?? ""}
                        required
                      />
                      <Textarea
                        className="w-full"
                        name="bodyText"
                        label="Skriv kommentaren din her"
                        defaultValue={comment.commentText ?? ""}
                        variant="faded"
                        required
                      />
                      <div className="flex gap-2">
                        <Button type="submit" isLoading={isSubmitting}>
                          Lagre
                        </Button>
                        <Button
                          variant="bordered"
                          onPress={() => setEditingCommentKey("")}
                        >
                          Avbryt
                        </Button>
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
                          <Button
                            size="sm"
                            variant="bordered"
                            className="mt-2"
                            onPress={() =>
                              setEditingCommentKey(comment._key ?? "")
                            }
                          >
                            Rediger
                          </Button>

                          <Button
                            size="sm"
                            variant="bordered"
                            className="mt-2 border-brand-danger"
                            onPress={() => handleDelete(comment._key ?? "")}
                          >
                            Slett
                          </Button>
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
                <Button
                  onPress={() => setIsCreatingComment(true)}
                  isDisabled={editingCommentKey !== ""}
                >
                  Ny kommentar
                </Button>
              )}

              {isCreatingComment && (
                <Form
                  onSubmit={handleCreateComment}
                  className="w-full max-w-xl"
                  validationBehavior="native"
                >
                  <h3 className="text-lg font-semibold">
                    Opprett ny kommentar
                  </h3>
                  <Input label="Tittel" name="title" required />
                  <Textarea
                    className="w-full"
                    name="bodyText"
                    label="Skriv kommentaren din her"
                    variant="faded"
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" isLoading={isSubmitting}>
                      Svar
                    </Button>
                    <Button
                      variant="bordered"
                      onPress={() => setIsCreatingComment(false)}
                    >
                      Avbryt
                    </Button>
                  </div>
                </Form>
              )}
            </>
          )}
        </div>
      </Card>

      {isClient && (
        <Modal
          isOpen={modalForComments.isOpen}
          onOpenChange={modalForComments.onOpenChange}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex flex-col gap-1 mb-4 font-semibold text-lg">
              {modalTitle}
            </div>
            <div className="mb-4">{modalBody}</div>
            <div className="flex justify-end gap-2">
              <Button
                color="danger"
                variant="light"
                className={`${modalCancelDisabled ? "hidden" : ""}`}
                isDisabled={modalCancelDisabled}
                onPress={() => {
                  resetModal();
                  modalForComments.onClose();
                }}
              >
                {modalCancelText}
              </Button>
              <Button
                color={isConfirmDelete ? "danger" : "primary"}
                onPress={() => {
                  if (isConfirmDelete) {
                    handleConfirmDelete();
                  } else {
                    resetModal();
                    modalForComments.onClose();
                  }
                }}
                isLoading={isDeletingComment}
              >
                {modalOkText}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
