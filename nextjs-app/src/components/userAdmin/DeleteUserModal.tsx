"use client";

import { deleteUser } from "@/app/actions/deleteUser";
import { errorsToNorwegian } from "@/lib/norwegianErrorMessages";
import { ShowUserProps } from "@/types/types";
import { Modal, Spinner } from "@heroui/react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "../CustomButton";

export default function DeleteUserModal({
  userDataToDelete,
  onClose,
  isOpen,
  onOpenChange,
}: {
  userDataToDelete: ShowUserProps | undefined;
  onClose: () => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [errorToShow, setErrorToShow] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const router = useRouter();

  // Close modal if userDataToDelete becomes undefined
  useEffect(() => {
    if (!userDataToDelete && isOpen) {
      onClose();
    }
  }, [userDataToDelete, isOpen, onClose]);

  if (!userDataToDelete) {
    return null;
  }

  const deleteUserWithId = async (id?: string) => {
    if (!id) {
      console.error("No id provided");
      return Response.json({ error: "No id provided" });
    }

    setIsDeleting(true);

    try {
      const response = await deleteUser(id);

      if ("error" in response) {
        const errorInNorwegian = errorsToNorwegian.find(
          (e) => e.code === response.error.message,
        );

        console.error("error ", response.error);
        setErrorToShow(errorInNorwegian?.message ?? "Ukjent feil");
        return;
      } else if ("success" in response) {
        setSuccessMessage(
          `Bruker ${userDataToDelete.firstName} ${userDataToDelete.lastName} ble slettet`,
        );
        // Refresh server-side data to remove the deleted user from the list
        router.refresh();
      } else {
        setErrorToShow("Ukjent feil");
      }
    } catch (error) {
      console.error("Error deleting user: ", error);

      setErrorToShow("Ukjent feil");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="text-brand-danger">
              Slett bruker
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <section>
              {errorToShow && (
                <div
                  className="bg-brand-danger text-white p-4 rounded-xl mb-4"
                  role="alert"
                >
                  {errorToShow}
                </div>
              )}

              {successMessage && (
                <div
                  className="bg-brand-danger text-white p-4 rounded-xl mb-4"
                  role="alert"
                >
                  {successMessage}
                </div>
              )}

              {isDeleting && (
                <Spinner className="absolute ml-8 w-4 h-4" size="md" />
              )}

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
          </Modal.Body>
          <Modal.Footer>
            {!errorToShow && !successMessage && (
              <CustomButton
                variant="danger"
                onPress={() => {
                  deleteUserWithId(userDataToDelete?.id);
                }}
              >
                Slett
              </CustomButton>
            )}

            <CustomButton
              variant="primary"
              onPress={() => {
                setErrorToShow("");
                setSuccessMessage("");
                onClose();
              }}
            >
              Tilbake
            </CustomButton>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
