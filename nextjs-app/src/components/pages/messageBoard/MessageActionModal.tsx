"use client";

import CustomButton from "@/components/CustomButton";
import { Modal } from "@heroui/react";
import type { ReactNode } from "react";

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  body: ReactNode;
  okText: string;
  cancelText: string;
  isCancelDisabled: boolean;
  okVariant?: "primary" | "danger";
  isPending?: boolean;
  isDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function MessageActionModal({
  isOpen,
  onOpenChange,
  title,
  body,
  okText,
  cancelText,
  isCancelDisabled,
  okVariant = "primary",
  isPending = false,
  isDisabled = false,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>{body}</Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end gap-2 w-full">
              {!isCancelDisabled && (
                <CustomButton variant="secondary" onPress={onCancel}>
                  {cancelText}
                </CustomButton>
              )}
              <CustomButton
                variant={okVariant}
                isPending={isPending}
                isDisabled={isDisabled}
                onPress={onConfirm}
              >
                {okText}
              </CustomButton>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
