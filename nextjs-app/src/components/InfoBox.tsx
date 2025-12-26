"use client";

import { Card } from "@heroui/react";

type InfoBoxProps = {
  title: string;
  message: string;
  footerMessage?: string | null;
  icon?: React.ReactNode;
  className?: string;
};

export default function InfoBox({
  title,
  message,
  footerMessage,
  icon,
  ...rest
}: InfoBoxProps) {
  return (
    <Card className={`p-2 py-8 ${rest?.className ?? ""}`}>
      <div className="flex gap-3 p-4">
        {icon && <div className="border-r-1 border-black/20 pr-4">{icon}</div>}
        <h1 className="text-xl lg:text-3xl prose lg:prose-lg ">{title}</h1>
      </div>
      <div className="prose lg:prose-lg p-4">
        <p>{message}</p>
      </div>

      {footerMessage && (
        <div className="p-4">
          <p className="text-xs h-4">{footerMessage}</p>
        </div>
      )}
    </Card>
  );
}
