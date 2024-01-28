"use client";

import { ShowUserProps } from "@/types/types";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import { useState } from "react";

const errorsToNorwegian = [
  {
    error: "Unauthorized",
    message:
      "Du har ikke de nødvendige rettigheter til å utføre denne operasjonen",
  },
  {
    error: "User is not admin",
    message: "Du må være administrator for å gjøre dette",
  },
];

export default function DeleteUserModal({
  userDataToDelete,
  onClose,
  isOpen,
  onOpenChange,
}: {
  userDataToDelete: ShowUserProps | undefined;
  onClose: () => void;
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  const [errorToShow, setErrorToShow] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!userDataToDelete) {
    onClose();
    return null;
  }

  const deleteUserWithId = async (id?: string) => {
    if (!id) {
      console.error("No id provided");
      return Response.json({ error: "No id provided" });
    }

    setIsDeleting(true);

    try {
      const res = await fetch("/api/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userToDelete: id,
        }),
      });

      const data = await res.json();

      console.log(data);

      if (data.error) {
        const errorInNorwegian = errorsToNorwegian.find(
          (error) => error.error === data.error,
        );

        console.error(data.error);
        setErrorToShow(errorInNorwegian?.message ?? "Ukjent feil");
        return;
      }

      setSuccessMessage(
        `Bruker ${userDataToDelete.firstName} ${userDataToDelete.lastName} ble slettet`,
      );
    } catch (error) {
      console.error("Error deleting user: ", error);

      setErrorToShow("Ukjent feil");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-row gap-4">
              <div className="text-xl self-center text-brand-danger">
                Slett bruker
              </div>
            </ModalHeader>
            <ModalBody>
              <section>
                {errorToShow && (
                  <div
                    className="bg-brand-danger text-white p-4 rounded-md"
                    role="alert"
                  >
                    {errorToShow}
                  </div>
                )}

                {successMessage && (
                  <div
                    className="bg-brand-danger text-white p-4 rounded-md"
                    role="alert"
                  >
                    {successMessage}
                  </div>
                )}

                {isDeleting && <Spinner className="absolute ml-8" size="lg" />}

                {!errorToShow && !successMessage && !isDeleting && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <div>
                        <strong>Bruker: </strong>
                        {`${userDataToDelete?.firstName} ${userDataToDelete?.lastName}`}
                      </div>
                      <div>
                        <strong>E-post: </strong> {userDataToDelete?.email}
                      </div>
                    </div>

                    <p>
                      Er du helt sikker på at du vil slette brukeren{" "}
                      <em>
                        {`${userDataToDelete?.firstName} ${userDataToDelete?.lastName}`}
                        ?
                      </em>{" "}
                      Denne operasjonen kan ikke angres!
                    </p>
                  </div>
                )}
              </section>
            </ModalBody>
            <ModalFooter>
              {!errorToShow && !successMessage && (
                <Button
                  color="danger"
                  onClick={() => {
                    deleteUserWithId(userDataToDelete?.id);
                  }}
                >
                  Slett
                </Button>
              )}

              <Button
                color="primary"
                onClick={() => {
                  setErrorToShow("");
                  setSuccessMessage("");
                  onClose();
                }}
              >
                Tilbake
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
