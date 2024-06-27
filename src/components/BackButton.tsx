"use client";

import { Button } from "@nextui-org/react";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";

export default function BackButton({
  buttonLink = "/",
}: {
  buttonLink?: string;
}) {
  if (!buttonLink) {
    return null;
  }
  return (
    <Button
      as={Link}
      href={buttonLink}
      startContent={<ArrowBigLeft />}
      color="primary"
      className="btn-link no-underline"
    >
      Gå tilbake
    </Button>
  );
}
