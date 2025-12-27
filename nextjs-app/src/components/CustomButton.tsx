"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import type React from "react";

/**
 * Renders a custom button component.
 *
 * @param props.href - The URL to navigate to when the button is clicked (required if onPress is not provided).
 * @param props.buttonText - The text to display on the button.
 * @param props.className - Additional CSS class name(s) for the button.
 * @param props.onPress - Optional handler for button press (if provided, href is ignored).
 * @param props.children - Optional React node to render as button content (overrides buttonText).
 */
export default function CustomButton({
  href,
  buttonText,
  className,
  onPress,
  children,
}: {
  href?: string;
  buttonText?: string;
  className?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  // If onPress is provided, use it directly
  if (onPress) {
    return (
      <Button
        variant="primary"
        size="lg"
        className={`rounded-xl p-6 ${className}`}
        onPress={onPress}
      >
        {children ?? buttonText}
      </Button>
    );
  }

  // If href is provided, use router.push for navigation
  if (href && buttonText) {
    return (
      <Button
        variant="primary"
        size="lg"
        className={`rounded-xl p-6 ${className}`}
        onPress={() => router.push(href)}
      >
        {children ?? buttonText}
      </Button>
    );
  }

  return null;
}
