"use client";
import RoleDisplay from "@/components/RoleDisplay";
import { formatDate } from "@/lib/format-date";
import { NewUser } from "@/types/types";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

import { ShowUserProps } from "@/types/types";

export default function ShowUserModal({
  userDataToShow,
  onClose,
}: { userDataToShow: ShowUserProps | undefined; onClose: () => void }) {
  if (!userDataToShow) {
    onClose();
    return null;
  }

  return (
    <>
      <ModalHeader className="flex flex-row gap-4">
        <Avatar src={userDataToShow?.image} />
        <div className="text-xl self-center">{`${userDataToShow?.firstName} ${userDataToShow?.lastName}`}</div>
      </ModalHeader>
      <ModalBody>
        <section>
          <div className="flex flex-row gap-4">
            <div className="w-1/3">
              <strong>E-post:</strong>
            </div>
            <div> {userDataToShow?.email}</div>
          </div>
          <div className="flex flex-row gap-4">
            <div className="w-1/3">
              <strong>Opprettet:</strong>
            </div>
            <div>{formatDate(userDataToShow?.createdAt)}</div>
          </div>
          <div className="flex flex-row gap-4">
            <div className="w-1/3">
              <strong>Sist innlogget:</strong>
            </div>
            <div>{formatDate(userDataToShow?.lastSignInAt) || "Aldri"}</div>
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
          onPress={() => {
            onClose();
          }}
        >
          Tilbake
        </Button>
      </ModalFooter>
    </>
  );
}
