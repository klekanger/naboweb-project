"use client";

import {
  useDraftModeEnvironment,
  useIsPresentationTool,
} from "next-sanity/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";
import { disableDraftMode } from "@/app/actions";

export default function DraftModeToast() {
  const isPresentationTool = useIsPresentationTool();
  const env = useDraftModeEnvironment();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (isPresentationTool === false) {
      /**
       * We delay the toast in case we're inside Presentation Tool
       */
      const toastId = toast("Utkastmodus aktivert", {
        description:
          env === "live"
            ? "Innholdet er live, oppdateres automatisk"
            : "Oppdater manuelt for å se endringer",
        duration: Infinity,
        action: {
          label: "Deaktiver",
          onClick: async () => {
            await disableDraftMode();
            startTransition(() => {
              router.refresh();
            });
          },
        },
      });
      return () => {
        toast.dismiss(toastId);
      };
    }
  }, [env, router, isPresentationTool]);

  useEffect(() => {
    if (pending) {
      const toastId = toast.loading("Deaktiverer utkastmodus...");
      return () => {
        toast.dismiss(toastId);
      };
    }
  }, [pending]);

  return null;
}
