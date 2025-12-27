"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

/**
 * Renders a custom button component.
 *
 * @param props.href - The URL to navigate to when the button is clicked.
 * @param props.buttonText - The text to display on the button.
 * @param props.className - Additional CSS class name(s) for the button.
 * @param props.asLink - Determines whether the button should be rendered as a Next.js <Link> or a <a> element. Defaults to true.
 */
export default function CustomButton({
  href,
  buttonText,
  className,
  asLink = true,
}: {
  href: string;
  buttonText: string;
  className?: string;
  asLink?: boolean;
}) {
  const router = useRouter();

  if (!href || !buttonText) {
    return null;
  }

  // Wrap in span with suppressHydrationWarning to prevent React Aria ID mismatch
  // Using inline-block to avoid layout issues
  if (asLink) {
    return (
      <Button
        color="primary"
        size="lg"
        className={`rounded-xl p-6 ${className}`}
        onPress={() => router.push(href)}
        role="link"
      >
        {buttonText}
      </Button>
    );
  }

  return (
    <Button
      as="a"
      href={href}
      color="primary"
      size="lg"
      className={`btn-link rounded-xl p-6 ${className}`}
    >
      {buttonText}
    </Button>
  );
}
