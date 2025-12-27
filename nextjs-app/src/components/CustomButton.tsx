"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import type React from "react";
import { forwardRef, useCallback } from "react";

/**
 * Renders a custom button component.
 *
 * @param props.href - The URL to navigate to when the button is clicked (required if onPress is not provided).
 * @param props.buttonText - The text to display on the button.
 * @param props.className - Additional CSS class name(s) for the button.
 * @param props.onPress - Optional handler for button press (if provided, href is ignored).
 * @param props.onClick - Optional native onClick handler (for compatibility with Clerk and other libraries).
 * @param props.children - Optional React node to render as button content (overrides buttonText).
 * @param props.variant - Button variant style (defaults to "primary").
 * @param props.size - Button size (defaults to "md").
 */
const CustomButton = forwardRef<
  HTMLButtonElement,
  {
    href?: string;
    buttonText?: string;
    className?: string;
    onPress?: () => void;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children?: React.ReactNode;
    variant?: "primary" | "secondary" | "tertiary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
  }
>(function CustomButton(
  {
    href,
    buttonText,
    className,
    onPress,
    onClick,
    children,
    variant = "primary",
    size = "md",
  },
  ref,
) {
  const router = useRouter();

  // Handle onClick from Clerk - convert to onPress
  const handlePress = useCallback(() => {
    if (onClick) {
      // Clerk adds onClick handlers, so we need to call it
      // Create a minimal event-like object
      const event = {
        currentTarget: null,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as React.MouseEvent<HTMLButtonElement>;
      onClick(event);
    } else if (onPress) {
      onPress();
    } else if (href) {
      router.push(href);
    }
  }, [onClick, onPress, href, router]);

  // Render button if we have content (children or buttonText) or an action (onPress, onClick, or href)
  if (!children && !buttonText && !onClick && !onPress && !href) {
    return null;
  }

  // Merge default styling with provided className
  const mergedClassName = `rounded-xl p-4 h-10 ${className || ""}`.trim();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={mergedClassName}
      onPress={handlePress}
    >
      {children ?? buttonText}
    </Button>
  );
});

CustomButton.displayName = "CustomButton";

export default CustomButton;
