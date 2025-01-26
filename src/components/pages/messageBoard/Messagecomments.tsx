import { compareClerkAndSanityUser } from "@/lib/compareClerkAndSanityUser";
import { formatDate } from "@/lib/format-date";
import { MESSAGE_BY_ID_QUERYResult } from "@/types/sanity.types";
import { useUser } from "@clerk/nextjs";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { MessageSquare, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MessageComments({
  comments,
  commentCount,
  messageId,
}: {
  comments: NonNullable<MESSAGE_BY_ID_QUERYResult>["comments"];
  commentCount: number;
  messageId: string;
}) {
  const userData = useUser();
  const userId = userData?.user?.id ?? "";
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [editingCommentKey, setEditingCommentKey] = useState<string>("");
  const [deletingCommentKey, setDeletingCommentKey] = useState<string>("");
  const router = useRouter();

  // Modal state
  const modalForComments = useDisclosure();
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalOkText, setModalOkText] = useState("Ok");
  const [modalCancelText, setModalCancelText] = useState("Avbryt");
  const [modalCancelDisabled, setModalCancelDisabled] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  const resetModal = () => {
    setModalTitle("");
    setModalBody("");
    setModalOkText("Ok");
    setModalCancelText("Avbryt");
    setModalCancelDisabled(false);
    setIsConfirmDelete(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const response = await fetch("/api/create-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: messageId,
          title: formData.get("title") as string,
          bodyText: formData.get("bodyText") as string,
          userId: userId,
        }),
      });

      const data = await response.json();

      if ("success" in data) {
        setModalTitle("Kommentaren ble lagt til");
        setModalBody("");
        setModalOkText("Ok");
        setModalCancelDisabled(true);
        modalForComments.onOpen();

        // Revalidate the page to show the new comment
        try {
          await fetch("/api/revalidate-messageboard", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: messageId,
            }),
          });
          router.refresh();
        } catch (error: any) {
          throw new Error(`Revalidation failed. Server response: ${error}`);
        }
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
      setIsCreatingComment(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingCommentKey === "") {
      console.error("No comment key found");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const response = await fetch("/api/edit-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          commentKey: editingCommentKey,
          title: formData.get("title") as string,
          bodyText: formData.get("bodyText") as string,
          userId,
        }),
      });

      const data = await response.json();

      if ("success" in data) {
        setModalTitle("Kommentaren ble oppdatert");
        setModalBody("Siden vil bli oppdatert.");
        setModalCancelDisabled(true);
        modalForComments.onOpen();

        // Revalidate the page to show the updated comment
        try {
          await fetch("/api/revalidate-messageboard", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: messageId,
            }),
          });
          router.refresh();
        } catch (error: any) {
          throw new Error(`Revalidation failed. Server response: ${error}`);
        }
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

    try {
      const response = await fetch("/api/delete-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

        // Revalidate the page to show the updated comments
        try {
          await fetch("/api/revalidate-messageboard", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: messageId,
            }),
          });
          router.refresh();
        } catch (error: any) {
          throw new Error(`Revalidation failed. Server response: ${error}`);
        }
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
    }
  };

  return (
    <>
      <Card className="lg:p-4">
        <CardHeader className="flex-col !items-start ">
          <h2 className="text-lg font-semibold flex">
            <MessageSquare className="h-auto mr-2" />
            Kommentarer ({commentCount})
          </h2>
        </CardHeader>

        <CardBody>
          <div className="prose lg:prose-xl pb-8">
            {comments &&
              comments.length > 0 &&
              comments.map((comment) => {
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

                    {isEditing ? (
                      <Form
                        onSubmit={handleEditSubmit}
                        className="w-full max-w-xl mt-4"
                        validationBehavior="native"
                      >
                        <Input
                          label="Tittel"
                          name="title"
                          defaultValue={comment.commentTitle ?? ""}
                          isRequired
                          errorMessage="Du må skrive inn en tittel"
                        />
                        <Textarea
                          className="w-full"
                          name="bodyText"
                          label="Skriv kommentaren din her"
                          defaultValue={comment.commentText ?? ""}
                          variant="faded"
                          isRequired
                          errorMessage="Du må skrive inn en kommentar"
                        />
                        <div className="flex gap-2">
                          <Button type="submit">Lagre</Button>
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
                        <div className="flex justify-end gap-2">
                          {userIsMessageAuthor && (
                            <>
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
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        </CardBody>
        <CardFooter className="flex flex-col items-start gap-4">
          {!isCreatingComment && (
            <Button onPress={() => setIsCreatingComment(true)}>
              Ny kommentar
            </Button>
          )}

          {isCreatingComment && (
            <Form
              onSubmit={handleSubmit}
              className="w-full max-w-xl"
              validationBehavior="native"
            >
              <h3 className="text-lg font-semibold">Opprett ny kommentar</h3>
              <Input
                label="Tittel"
                name="title"
                isRequired
                errorMessage="Du må skrive inn en tittel"
              />
              <Textarea
                className="w-full"
                name="bodyText"
                label="Skriv kommentaren din her"
                variant="faded"
                isRequired
                errorMessage="Du må skrive inn en kommentar"
              />
              <div className="flex gap-2">
                <Button type="submit">Svar</Button>
                <Button
                  variant="bordered"
                  onPress={() => setIsCreatingComment(false)}
                >
                  Avbryt
                </Button>
              </div>
            </Form>
          )}
        </CardFooter>
      </Card>

      {/*
        Modal for errors and messages
      */}
      <Modal
        isOpen={modalForComments.isOpen}
        onOpenChange={modalForComments.onOpenChange}
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
