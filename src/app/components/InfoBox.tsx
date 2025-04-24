"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";

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
      <CardHeader className="flex gap-3">
        {icon && <div className="border-r-1 border-black/20 pr-4">{icon}</div>}
        <h1 className="text-xl lg:text-3xl prose lg:prose-lg ">{title}</h1>
      </CardHeader>
      <CardBody className="prose lg:prose-lg">
        <p>{message}</p>
      </CardBody>

      <CardFooter>
        <p className="text-xs h-[1rem]">{footerMessage}</p>
      </CardFooter>
    </Card>
  );
}
