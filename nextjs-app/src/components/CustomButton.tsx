"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

/**
 * Renders a custom button component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.href - The URL to navigate to when the button is clicked.
 * @param {string} props.buttonText - The text to display on the button.
 * @param {string} [props.className] - Additional CSS class name(s) for the button.
 * @param {boolean} [props.asLink=true] - Determines whether the button should be rendered as a Next.js <Link> or a <a> element.
 * @returns {JSX.Element|null} The rendered custom button component.
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
      <span suppressHydrationWarning style={{ display: "inline-block" }}>
        <Button
          color="primary"
          size="lg"
          className={`btn-link ${className}`}
          onPress={() => router.push(href)}
          role="link"
        >
          {buttonText}
        </Button>
      </span>
    );
  }

  return (
    <span suppressHydrationWarning style={{ display: "inline-block" }}>
      <Button
        as="a"
        href={href}
        color="primary"
        size="lg"
        className={`btn-link ${className}`}
      >
        {buttonText}
      </Button>
    </span>
  );
}
