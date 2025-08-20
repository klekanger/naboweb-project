import { vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { cleanup } from "@testing-library/react";

// Setup and cleanup for each test
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup DOM after each test
  cleanup();
});

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

// Mock server actions
vi.mock("@/app/actions/createUser", () => ({
  createNewUser: vi.fn(),
}));

vi.mock("@/app/actions/updateUser", () => ({
  updateUser: vi.fn(),
}));

vi.mock("@/app/actions/deleteUser", () => ({
  deleteUser: vi.fn(),
}));

vi.mock("@/app/actions/searchUser", () => ({
  searchUser: vi.fn(),
}));

vi.mock("@/app/actions/inviteUser", () => ({
  inviteUser: vi.fn(),
}));

// Mock Norwegian error messages
vi.mock("@/lib/norwegianErrorMessages", () => ({
  errorsToNorwegian: [
    {
      code: "form_password_not_strong_enough",
      message: "Passordet er ikke sterkt nok",
    },
    {
      code: "email_address_not_available",
      message: "E-postadressen er ikke tilgjengelig",
    },
    {
      code: "form_identifier_exists",
      message: "En bruker med denne e-postadressen eksisterer allerede",
    },
  ],
}));

// Global test configuration
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
