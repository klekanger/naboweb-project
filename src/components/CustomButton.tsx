import { Button } from "@nextui-org/react";
import Link from "next/link";

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
  if (!href || !buttonText) {
    return null;
  }

  return (
    <Button
      as={asLink ? Link : "a"}
      href={href}
      color="primary"
      className={`btn-link ${className}`}
      size="lg"
    >
      {buttonText}
    </Button>
  );
}
