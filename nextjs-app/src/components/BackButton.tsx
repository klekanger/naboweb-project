"use client";

import CustomButton from "./CustomButton";
import { ArrowBigLeft } from "lucide-react";

export default function BackButton({
  buttonLink = "/",
}: {
  buttonLink?: string;
}) {
  if (!buttonLink) {
    return null;
  }
  return (
    <CustomButton href={buttonLink} variant="primary" className="no-underline">
      <ArrowBigLeft className="h-5 w-5 mt-1.5" />
      Gå tilbake
    </CustomButton>
  );
}
