import { vi } from "vitest";
import { createElement } from "react";

// Mock HeroUI components
vi.mock("@heroui/react", () => ({
  Button: ({ children, onPress, ...props }: any) =>
    createElement("button", { onClick: onPress, ...props }, children),
  Input: ({ label, onChange, value, ...props }: any) =>
    createElement("div", {}, [
      createElement("label", { key: "label" }, label),
      createElement("input", {
        key: "input",
        value: value,
        onChange: onChange,
        ...props,
      }),
    ]),
  Checkbox: ({ children, value, ...props }: any) =>
    createElement("label", {}, [
      createElement("input", {
        key: "checkbox",
        type: "checkbox",
        value: value,
        ...props,
      }),
      children,
    ]),
  CheckboxGroup: ({ children, label, onValueChange }: any) =>
    createElement("div", {}, [
      createElement("span", { key: "label" }, label),
      createElement(
        "div",
        {
          key: "group",
          onChange: (e: any) => onValueChange?.(e.target.value),
        },
        children,
      ),
    ]),
  Modal: ({ children, isOpen }: any) =>
    isOpen ? createElement("div", { "data-testid": "modal" }, children) : null,
  ModalContent: ({ children }: any) => createElement("div", {}, children),
  ModalHeader: ({ children }: any) => createElement("h2", {}, children),
  ModalBody: ({ children }: any) => createElement("div", {}, children),
  ModalFooter: ({ children }: any) => createElement("div", {}, children),
  Spinner: () =>
    createElement("div", { "data-testid": "spinner" }, "Loading..."),
  useDisclosure: () => ({
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
    onOpenChange: vi.fn(),
  }),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Users: () => createElement("span", {}, "Users Icon"),
  UserCheck: () => createElement("span", {}, "UserCheck Icon"),
  UserPlus2: () => createElement("span", {}, "UserPlus2 Icon"),
  UserCog: () => createElement("span", {}, "UserCog Icon"),
  Crown: () => createElement("span", {}, "Crown Icon"),
  ArrowBigLeft: () => createElement("span", {}, "ArrowBigLeft Icon"),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) =>
    createElement("a", { href: href, ...props }, children),
}));
