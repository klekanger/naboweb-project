"use client";

import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import { Modal } from "@heroui/react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import BlogEditorClient from "./BlogEditorClient";
import type { BlogPostData } from "./BlogEditor";

type Props = {
  postSlug: string;
  initialData: BlogPostData;
  currentAuthorId: string;
  authorDisplayName: string;
  currentUserEmail?: string;
  currentAuthorPortraitUrl?: string | null;
  isAdmin: boolean;
};

export default function BlogEditPageContent({
  postSlug,
  initialData,
  currentAuthorId,
  authorDisplayName,
  currentUserEmail = "",
  currentAuthorPortraitUrl = null,
  isAdmin,
}: Props) {
  const router = useRouter();
  const [isEditDirty, setIsEditDirty] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const discardChangesRef = useRef<(() => void) | null>(null);

  const leaveEditor = useCallback(() => {
    router.replace("/admin/blog");
  }, [router]);

  const requestLeave = useCallback(() => {
    if (isEditDirty) {
      setShowLeaveConfirm(true);
      return;
    }
    leaveEditor();
  }, [isEditDirty, leaveEditor]);

  const confirmLeave = useCallback(() => {
    setShowLeaveConfirm(false);
    flushSync(() => {
      discardChangesRef.current?.();
      setIsEditDirty(false);
    });
    leaveEditor();
  }, [leaveEditor]);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="relative mb-2">
        <h1 className="text-3xl font-semibold">Rediger innlegg</h1>
        <button
          type="button"
          aria-label="Lukk redigering"
          className="absolute right-0 -top-1 rounded-md border border-brand-black/20 p-2 hover:bg-default/60 transition-colors"
          onClick={requestLeave}
        >
          <X className="size-4" />
        </button>
      </div>
      <p className="text-foreground/60 mb-8 font-mono text-sm">/{postSlug}</p>

      <BlogEditorClient
        mode="edit"
        initialData={initialData}
        currentAuthorId={currentAuthorId}
        authorDisplayName={authorDisplayName}
        currentUserEmail={currentUserEmail}
        currentAuthorPortraitUrl={currentAuthorPortraitUrl}
        isAdmin={isAdmin}
        onEditDirtyChange={setIsEditDirty}
        onRegisterDiscardChanges={(discardChanges) => {
          discardChangesRef.current = discardChanges;
        }}
      />

      <div className="mt-10">
        <BackButton buttonLink="/admin/blog" onPress={requestLeave} />
      </div>

      <Modal.Backdrop
        isOpen={showLeaveConfirm}
        onOpenChange={(open) => {
          if (!open) setShowLeaveConfirm(false);
        }}
        variant="blur"
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Ikke lagrede endringer</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>
                Du har endringer som ikke er lagret. Vil du forlate denne siden?
              </p>
            </Modal.Body>
            <Modal.Footer className="flex flex-wrap justify-end gap-2">
              <CustomButton
                variant="secondary"
                onPress={() => setShowLeaveConfirm(false)}
              >
                Avbryt
              </CustomButton>
              <CustomButton onPress={confirmLeave}>Ja</CustomButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
