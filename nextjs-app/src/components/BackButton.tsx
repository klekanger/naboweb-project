"use client";

import CustomButton from "./CustomButton";
import { ArrowBigLeft } from "lucide-react";

export default function BackButton({
  buttonLink = "/",
  onPress,
}: {
  buttonLink?: string;
  onPress?: () => void;
}) {
  if (!buttonLink && !onPress) {
    return null;
  }
  return (
    <CustomButton
      href={buttonLink}
      onPress={onPress}
      variant="primary"
      className="no-underline"
    >
      <ArrowBigLeft className="h-5 w-5 mt-1.5" />
      Gå tilbake
    </CustomButton>
  );
}
