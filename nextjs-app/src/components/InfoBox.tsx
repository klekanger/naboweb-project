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
    <Card
      className={`p-2 py-8 mb-16 shadow-lg rounded-xl border border-gray-200 ${rest?.className ?? ""}`}
    >
      <div className="flex gap-3 p-3 items-center">
        {icon && <div className="border-r border-black/20 pr-4">{icon}</div>}
        <h1 className="text-xl lg:text-3xl prose lg:prose-lg ">{title}</h1>
      </div>
      <div className="prose lg:prose-lg p-3 pb-0">
        <p>{message}</p>
      </div>

      {footerMessage && (
        <div className="p-3">
          <p className="text-xs h-4">{footerMessage}</p>
        </div>
      )}
    </Card>
  );
}
