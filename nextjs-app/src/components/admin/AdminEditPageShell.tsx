"use client";

import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import { Button, Modal } from "@heroui/react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

type AdminEditExitContextValue = {
  reportDirty: (isDirty: boolean) => void;
  registerDiscard: (discardChanges: () => void) => void;
};

const AdminEditExitContext = createContext<AdminEditExitContextValue | null>(
  null,
);

export function useAdminEditExit(): AdminEditExitContextValue {
  const context = useContext(AdminEditExitContext);
  if (!context) {
    throw new Error("useAdminEditExit must be used inside AdminEditPageShell.");
  }
  return context;
}

type Props = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  backHref?: string;
  containerClassName?: string;
};

export default function AdminEditPageShell({
  title,
  description,
  children,
  backHref = "/admin",
  containerClassName = "max-w-3xl",
}: Props) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const discardChangesRef = useRef<(() => void) | null>(null);

  const leaveEditor = useCallback(() => {
    router.replace(backHref);
  }, [backHref, router]);

  const requestLeave = useCallback(() => {
    if (isDirty) {
      setShowLeaveConfirm(true);
      return;
    }
    leaveEditor();
  }, [isDirty, leaveEditor]);

  const confirmLeave = useCallback(() => {
    setShowLeaveConfirm(false);
    flushSync(() => {
      discardChangesRef.current?.();
      setIsDirty(false);
    });
    leaveEditor();
  }, [leaveEditor]);

  const contextValue: AdminEditExitContextValue = {
    reportDirty: setIsDirty,
    registerDiscard: (discardChanges) => {
      discardChangesRef.current = discardChanges;
    },
  };

  return (
    <AdminEditExitContext.Provider value={contextValue}>
      <div className={`${containerClassName} mx-auto py-12 px-4`}>
        <div className="relative mb-2">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <Button
            isIconOnly
            variant="ghost"
            aria-label="Lukk redigering"
            className="absolute right-0 -top-1 text-foreground/70 hover:text-foreground"
            onPress={requestLeave}
          >
            <X className="h-8 w-8" />
          </Button>
        </div>

        {description ? (
          <p className="text-foreground/60 mb-8">{description}</p>
        ) : null}

        {children}

        <div className="mt-10">
          <BackButton buttonLink={backHref} onPress={requestLeave} />
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
                <p>Du har endringer som ikke er lagret. Vil du forlate denne siden?</p>
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
    </AdminEditExitContext.Provider>
  );
}
