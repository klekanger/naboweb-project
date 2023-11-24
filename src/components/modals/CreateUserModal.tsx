"use client";
import { NewUser } from "@/types/types";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

export default function CreateUserModal(
  isOpen: boolean,
  onOpenChange: () => void,
  newUser: NewUser,
  createUser: (user: NewUser) => void,
) {
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Er du sikker
              </ModalHeader>
              <ModalBody>
                <p>Er du sikker på at du vil opprette en ny bruker?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Avbryt
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    createUser(newUser);
                  }}
                >
                  Opprett
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
