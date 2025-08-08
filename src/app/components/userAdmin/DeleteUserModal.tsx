"use client";

import { deleteUser } from "@/app/actions/deleteUser";
import { SidebarMenu, UserAdminContext } from "@/app/context/userAdminContext";
import { errorsToNorwegian } from "@/lib/norwegianErrorMessages";
import { ShowUserProps } from "@/types/types";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@heroui/react";

import { useContext, useState } from "react";

export default function DeleteUserModal({
  userDataToDelete,
  onClose,
  isOpen,
  onOpenChange,
  onDeleted,
}: {
  userDataToDelete: ShowUserProps | undefined;
  onClose: () => void;
  isOpen: boolean;
  onOpenChange: () => void;
  onDeleted?: () => void;
}) {
  const [errorToShow, setErrorToShow] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { setSelectedMenu, setSelectedUser } = useContext(UserAdminContext);

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
        // After successful deletion, navigate back to the users list and clear any selected user
        setSelectedUser(null);
        setSelectedMenu(SidebarMenu.USERS);
        // Notify parent components when they need to take additional actions
        if (onDeleted) onDeleted();
        onClose();
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
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
                    className="bg-brand-danger text-white p-4 rounded-xl"
                    role="alert"
                  >
                    {errorToShow}
                  </div>
                )}

                {successMessage && (
                  <div
                    className="bg-brand-danger text-white p-4 rounded-xl"
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
                  onPress={() => {
                    deleteUserWithId(userDataToDelete?.id);
                  }}
                >
                  Slett
                </Button>
              )}

              <Button
                color="primary"
                onPress={() => {
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
