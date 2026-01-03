"use client";

import RoleDisplay from "@/components/userAdmin/RoleDisplay";
import { formatDate } from "@/lib/format-date";
import { ShowUserProps } from "@/types/types";
import { Avatar, Modal, Spinner } from "@heroui/react";
import CustomButton from "../CustomButton";

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
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <div className="flex flex-row gap-4">
              <Avatar>
                {userDataToShow?.imageUrl && (
                  <Avatar.Image
                    src={userDataToShow.imageUrl}
                    alt={`${userDataToShow.firstName} ${userDataToShow.lastName}`}
                  />
                )}
                <Avatar.Fallback>
                  {userDataToShow?.firstName?.[0]}
                  {userDataToShow?.lastName?.[0]}
                </Avatar.Fallback>
              </Avatar>
              <Modal.Heading className="text-xl flex items-center mb-8">
                {`${userDataToShow?.firstName} ${userDataToShow?.lastName}`}
              </Modal.Heading>
            </div>
          </Modal.Header>
          <Modal.Body>
            <section className="text-brand-black font-medium text-base">
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
                      <Spinner className="absolute ml-8 w-4 h-4" size="sm" />
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
          </Modal.Body>
          <Modal.Footer>
            <CustomButton variant="primary" onPress={onClose}>
              Tilbake
            </CustomButton>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
