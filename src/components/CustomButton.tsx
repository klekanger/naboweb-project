"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";

export default function CustomButton({
  href,
  buttonText,
  className,
}: {
  href: string;
  buttonText: string;
  className?: string;
}) {
  if (!href || !buttonText) {
    return null;
  }

  return (
    <Button
      as={Link}
      href={href}
      color="primary"
      className={`btn-link ${className}`}
      size="lg"
    >
      {buttonText}
    </Button>
  );
}
