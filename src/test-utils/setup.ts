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
  // Table components
  Table: ({ children, ...props }: any) =>
    createElement("table", props, children),
  TableHeader: ({ children, ...props }: any) =>
    createElement("thead", props, children),
  TableBody: ({ children, ...props }: any) =>
    createElement("tbody", props, children),
  TableRow: ({ children, ...props }: any) =>
    createElement("tr", props, children),
  TableCell: ({ children, ...props }: any) =>
    createElement("td", props, children),
  TableColumn: ({ children, ...props }: any) =>
    createElement("th", props, children),
  // Dropdown components
  Dropdown: ({ children, ...props }: any) =>
    createElement("div", props, children),
  DropdownTrigger: ({ children, ...props }: any) =>
    createElement("div", props, children),
  DropdownMenu: ({ children, ...props }: any) =>
    createElement("div", props, children),
  DropdownItem: ({ children, ...props }: any) =>
    createElement("div", props, children),
  // Pagination components
  Pagination: ({ ...props }: any) =>
    createElement("div", { "data-testid": "pagination", ...props }),
  // Chip component
  Chip: ({ children, ...props }: any) => createElement("span", props, children),
  // User component
  User: ({ name, description, avatarProps, ...props }: any) =>
    createElement("div", props, [
      createElement("img", { key: "avatar", ...avatarProps }),
      createElement("div", { key: "info" }, [
        createElement("div", { key: "name" }, name),
        createElement("div", { key: "desc" }, description),
      ]),
    ]),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Users: () => createElement("span", {}, "Users Icon"),
  UserCheck: () => createElement("span", {}, "UserCheck Icon"),
  UserPlus2: () => createElement("span", {}, "UserPlus2 Icon"),
  UserCog: () => createElement("span", {}, "UserCog Icon"),
  Crown: () => createElement("span", {}, "Crown Icon"),
  ArrowBigLeft: () => createElement("span", {}, "ArrowBigLeft Icon"),
  SearchIcon: () => createElement("span", {}, "Search Icon"),
  Search: () => createElement("span", {}, "Search Icon"),
  ChevronDown: () => createElement("span", {}, "ChevronDown Icon"),
  ChevronUp: () => createElement("span", {}, "ChevronUp Icon"),
  MoreVertical: () => createElement("span", {}, "MoreVertical Icon"),
  Edit: () => createElement("span", {}, "Edit Icon"),
  Trash2: () => createElement("span", {}, "Trash2 Icon"),
  Eye: () => createElement("span", {}, "Eye Icon"),
  EyeOff: () => createElement("span", {}, "EyeOff Icon"),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) =>
    createElement("a", { href: href, ...props }, children),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
    toString: vi.fn(),
  }),
  usePathname: () => "/test-path",
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
