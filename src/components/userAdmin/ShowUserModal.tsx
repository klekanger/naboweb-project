"use client";

import RoleDisplay from "@/components/userAdmin/RoleDisplay";
import { formatDate } from "@/lib/format-date";
import { ShowUserProps } from "@/types/types";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";

export default function ShowUserModal({
  userDataToShow,
  onClose,
  isOpen,
  onOpenChange,
}: {
  userDataToShow: ShowUserProps | undefined;
  onClose: () => void;
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  if (!userDataToShow) {
    onClose();
    return null;
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-row gap-4">
              <Avatar src={userDataToShow?.image} />
              <div className="text-xl self-center">{`${userDataToShow?.firstName} ${userDataToShow?.lastName}`}</div>
            </ModalHeader>
            <ModalBody>
              <section>
                <div className="flex flex-col gap-4">
                  <div>
                    <strong>E-post:</strong>
                    {` ${userDataToShow?.email}`}
                  </div>

                  <div className="flex flex-row gap-4">
                    <div className="w-1/3">
                      <strong>Opprettet:</strong>
                    </div>
                    <div>
                      {formatDate(userDataToShow?.createdAt)}
                      {userDataToShow?.email === "" ? (
                        <Spinner className="absolute ml-8" size="lg" />
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="w-1/3">
                    <strong>Sist innlogget:</strong>
                  </div>
                  <div>{formatDate(userDataToShow?.lastSignInAt) || ""}</div>
                </div>
                <div className="flex flex-row gap-4 mt-8">
                  <div className="w-1/3">
                    <strong>Roller:</strong>
                  </div>
                  <div>
                    <RoleDisplay roles={userDataToShow?.roles} />
                  </div>
                </div>
              </section>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onClick={() => {
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
