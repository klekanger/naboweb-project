import type { ComponentType, ReactNode } from "react";

declare module "@heroui/react" {
  interface CardSubComponents {
    Header: ComponentType<{
      className?: string;
      children?: ReactNode;
    }>;
    Content: ComponentType<{
      className?: string;
      children?: ReactNode;
    }>;
    Footer: ComponentType<{
      className?: string;
      children?: ReactNode;
    }>;
    Title: ComponentType<{
      className?: string;
      children?: ReactNode;
    }>;
    Description: ComponentType<{
      className?: string;
      children?: ReactNode;
    }>;
  }

  // Extend the Card component to include sub-components
  export const Card: ComponentType<{
    variant?:
      | "transparent"
      | "default"
      | "secondary"
      | "tertiary"
      | "quaternary";
    className?: string;
    children?: ReactNode;
  }> &
    CardSubComponents;
}
