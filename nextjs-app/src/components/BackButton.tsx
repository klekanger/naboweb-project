"use client";

import { Button } from "@heroui/react";
import { ArrowBigLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({
  buttonLink = "/",
}: {
  buttonLink?: string;
}) {
  const router = useRouter();

  if (!buttonLink) {
    return null;
  }
  return (
    <Button
      onClick={() => router.push(buttonLink)}
      startContent={<ArrowBigLeft />}
      color="primary"
      className="btn-link no-underline"
      role="link"
    >
      Gå tilbake
    </Button>
  );
}
