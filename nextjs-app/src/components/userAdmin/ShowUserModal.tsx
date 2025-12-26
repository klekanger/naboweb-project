"use client";

import RoleDisplay from "@/components/userAdmin/RoleDisplay";
import { formatDate } from "@/lib/format-date";
import { ShowUserProps } from "@/types/types";
import {
  Avatar,
  Button,
  Modal,
  Spinner,
} from "@heroui/react";

export default function ShowUserModal({
  userDataToShow,
  onClose,
  isOpen,
  onOpenChange,
}: {
  userDataToShow: ShowUserProps | undefined;
  onClose: () => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  if (!userDataToShow) {
    onClose();
    return null;
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
        <div className="flex flex-row gap-4 mb-4">
          <Avatar src={userDataToShow?.imageUrl || undefined} />
          <div className="text-xl self-center">{`${userDataToShow?.firstName} ${userDataToShow?.lastName}`}</div>
        </div>
        <div className="mb-4">
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
            <div className="flex flex-row gap-4">
              <div className="w-1/3">
                <strong>E-post-varsling: </strong>
              </div>
              <div>{userDataToShow?.emailSubscription ? "Ja" : "Nei"}</div>
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
        </div>
        <div className="flex justify-end gap-2">
          <Button
            color="primary"
            onPress={() => {
              onClose();
            }}
          >
            Tilbake
          </Button>
        </div>
      </div>
    </Modal>
  );
}
