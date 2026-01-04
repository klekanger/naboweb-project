"use client";

import { Card } from "@heroui/react";
import { AlertCircle } from "lucide-react";

type AlertUserProps = {
  alertMessage: string;
  alertTitle: string;
};

export default function AlertUser({
  alertMessage,
  alertTitle,
}: AlertUserProps) {
  if (!alertMessage || !alertTitle) return null;

  return (
    <Card className="max-w-[400px] bg-brand-dark-warning text-brand-black dark:bg-brand-dark-warning">
      <div className="text-brand-primaryLight flex gap-3 p-4">
        <AlertCircle size={24} />
        <span className="text-xl font-semibold">{alertTitle}</span>
      </div>
      <hr className="border-t border-divider" />
      <div className="p-4">
        <p className="">{alertMessage}</p>
      </div>
    </Card>
  );
}
