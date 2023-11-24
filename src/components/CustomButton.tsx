"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";

export default function CustomButton({
  href,
  buttonText,
}: {
  href: string;
  buttonText: string;
}) {
  if (!href || !buttonText) {
    return null;
  }

  return (
    <Button
      as={Link}
      href={href}
      color="primary"
      className="btn-link"
      size="lg"
    >
      {buttonText}
    </Button>
  );
}
