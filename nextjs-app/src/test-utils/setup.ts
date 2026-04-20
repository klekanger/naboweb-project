import { vi, beforeEach, afterEach } from "vitest";
import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  type ReactNode,
} from "react";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Setup and cleanup for each test
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup DOM after each test
  cleanup();
});

// Mock Sanity's image URL builder
vi.mock("@/sanity/lib/utils", () => ({
  urlForImage: () => ({
    width: () => ({
      height: () => ({
        fit: () => ({
          url: () => "test-image-url",
        }),
      }),
    }),
  }),
}));

// Mock HeroUI: keep compound APIs used in the app (v3) while avoiding heavy runtime where possible.
function readInputChangeValue(e: unknown): string {
  if (typeof e === "string") return e;
  if (e && typeof e === "object" && "target" in e) {
    const t = (e as { target?: { value?: string } }).target;
    return t?.value ?? "";
  }
  return "";
}

function MockInput({ value, onChange, ...rest }: any) {
  return createElement("input", {
    ...rest,
    value: value ?? "",
    onChange: (e: unknown) => onChange?.(readInputChangeValue(e) as never),
  });
}

const MockCheckbox = ({
  children,
  isSelected,
  onChange,
  id,
  ...props
}: any) =>
  createElement(
    "label",
    { htmlFor: id, ...props },
    [
      createElement("input", {
        key: "cb",
        id,
        type: "checkbox",
        checked: Boolean(isSelected),
        onChange: () => onChange?.(!isSelected),
        "aria-label": props["aria-label"],
      }),
      createElement("span", { key: "slot" }, children),
    ],
  );
Object.assign(MockCheckbox, {
  Control: ({ children }: any) => createElement("span", {}, children),
  Indicator: () => null,
  Content: ({ children }: any) => createElement("span", {}, children),
});

const MockTooltip = ({ children, ...props }: any) =>
  createElement("div", { "data-testid": "tooltip", ...props }, children);
Object.assign(MockTooltip, {
  Trigger: ({ children }: any) => createElement("span", {}, children),
  Content: ({ children, className }: any) =>
    createElement("div", { className }, children),
});

const MockInputGroup = ({ children }: any) =>
  createElement("div", { "data-testid": "input-group" }, children);
Object.assign(MockInputGroup, {
  Prefix: ({ children }: any) => createElement("span", {}, children),
  Input: ({ placeholder, type, onKeyDown, ...rest }: any) =>
    createElement("input", { placeholder, type, onKeyDown, ...rest }),
});

function flattenTextNode(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number")
    return String(node);
  if (Array.isArray(node)) return node.map(flattenTextNode).join("");
  if (isValidElement(node))
    return flattenTextNode((node.props as { children?: ReactNode }).children);
  return "";
}

const MockFieldError = ({ children }: any) =>
  createElement("div", { role: "alert" }, children);

function wrapCheckboxSubtree(
  nodes: ReactNode,
  groupValue: string[],
  onGroupChange: ((next: string[]) => void) | undefined,
  CheckboxType: any,
): ReactNode {
  return Children.map(nodes, (child) => {
    if (!isValidElement(child)) return child;
    const p = child.props as Record<string, unknown>;
    if (child.type === CheckboxType) {
      const v = String(p.value ?? "");
      const isDisabled = Boolean(p.isDisabled);
      const selected = groupValue.includes(v);
      return cloneElement(child as any, {
        isSelected: selected,
        onChange: () => {
          if (isDisabled || !onGroupChange) return;
          const next = selected
            ? groupValue.filter((x) => x !== v)
            : [...groupValue, v];
          onGroupChange(next);
        },
      });
    }
    if (p?.children != null) {
      return cloneElement(child as any, {
        children: wrapCheckboxSubtree(
          p.children as ReactNode,
          groupValue,
          onGroupChange,
          CheckboxType,
        ),
      });
    }
    return child;
  });
}

vi.mock("@heroui/react", () => ({
  cn: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" "),
  Label: ({ children, htmlFor, ...props }: any) =>
    createElement("label", { htmlFor, ...props }, children),
  Description: ({ children, className }: any) =>
    createElement("p", { className }, children),
  FieldError: MockFieldError,
  TextField: ({
    children,
    value,
    onChange,
    isInvalid,
    isDisabled,
    name,
    type,
    className,
  }: any) => {
    let errorMessage = "";
    Children.forEach(children, (ch) => {
      if (isValidElement(ch) && ch.type === MockFieldError) {
        errorMessage = flattenTextNode(
          (ch.props as { children?: ReactNode }).children,
        );
      }
    });
    const invalidAttrs =
      isInvalid && errorMessage
        ? { color: "danger", errormessage: errorMessage }
        : {};
    return createElement(
      "div",
      { "data-testid": "text-field", className },
      Children.map(children, (child: any) => {
        if (!isValidElement(child)) return child;
        if (child.type === MockInputGroup) {
          const inputGroupInput = (MockInputGroup as any).Input;
          return cloneElement(child as any, {
            children: Children.map(
              (child.props as { children?: ReactNode }).children,
              (inner: any) => {
                if (!isValidElement(inner)) return inner;
                if (inner.type === inputGroupInput) {
                  const ip = inner.props as Record<string, unknown>;
                  return cloneElement(inner as any, {
                    ...ip,
                    name,
                    type: type ?? (ip.type as string | undefined) ?? "text",
                    value: value ?? "",
                    disabled: Boolean(isDisabled),
                    onChange: (e: unknown) =>
                      onChange?.(readInputChangeValue(e) as never),
                    ...invalidAttrs,
                  });
                }
                return inner;
              },
            ),
          });
        }
        if (child.type === MockInput) {
          const cp = child.props as Record<string, unknown>;
          const mergedType = type ?? (cp.type as string | undefined) ?? "text";
          return cloneElement(child as any, {
            ...cp,
            name,
            type: mergedType,
            value: value ?? "",
            disabled: Boolean(isDisabled),
            onChange: (e: unknown) =>
              onChange?.(readInputChangeValue(e) as never),
            ...invalidAttrs,
          });
        }
        return child;
      }),
    );
  },
  Input: MockInput,
  InputGroup: MockInputGroup,
  TextArea: ({ value, onChange, ...rest }: any) =>
    createElement("textarea", {
      ...rest,
      value: value ?? "",
      onChange: (e: { target: { value: string } }) =>
        onChange?.(e.target.value as never),
    }),
  Form: ({ children, onSubmit, ...props }: any) =>
    createElement("form", { onSubmit, ...props }, children),
  Button: ({
    children,
    onPress,
    startContent,
    isDisabled,
    isPending,
    ...props
  }: any) =>
    createElement(
      "button",
      {
        type: "button",
        onClick: onPress,
        disabled: Boolean(isDisabled),
        ...props,
      },
      [isPending ? createElement("span", { key: "pending" }, "…") : null, startContent, children],
    ),
  Card: ({ children, className, ...props }: any) =>
    createElement(
      "div",
      { "data-testid": "mock-card", className, ...props },
      children,
    ),
  CardHeader: ({ children, className, ...props }: any) =>
    createElement(
      "div",
      { "data-testid": "mock-card-header", className, ...props },
      children,
    ),
  CardBody: ({ children, className, ...props }: any) =>
    createElement(
      "div",
      { "data-testid": "mock-card-body", className, ...props },
      children,
    ),
  CardFooter: ({ children, className, ...props }: any) =>
    createElement(
      "div",
      { "data-testid": "mock-card-footer", className, ...props },
      children,
    ),
  Checkbox: MockCheckbox,
  CheckboxGroup: ({ children, value, onChange, ...props }: any) => {
    const groupValue = Array.isArray(value) ? value : ["user"];
    return createElement(
      "div",
      { "data-testid": "checkbox-group", ...props },
      wrapCheckboxSubtree(children, groupValue, onChange, MockCheckbox),
    );
  },
  Modal: Object.assign(
    ({ children, isOpen }: any) =>
      isOpen ? createElement("div", { "data-testid": "modal" }, children) : null,
    {
      Backdrop: ({ children, isOpen, ...props }: any) =>
        isOpen
          ? createElement("div", { "data-testid": "modal-backdrop", ...props }, children)
          : null,
      Container: ({ children }: any) => createElement("div", {}, children),
      Dialog: ({ children, className }: any) =>
        createElement("div", { className }, children),
      CloseTrigger: () =>
        createElement("button", { type: "button", "data-testid": "modal-close" }),
      Header: ({ children }: any) => createElement("div", {}, children),
      Heading: ({ children, className }: any) =>
        createElement("h2", { className }, children),
      Body: ({ children }: any) => createElement("div", {}, children),
      Footer: ({ children, className }: any) =>
        createElement("div", { className }, children),
    },
  ),
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
  Table: ({ children, ...props }: any) =>
    createElement("table", props, children),
  Tooltip: MockTooltip,
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
  Dropdown: Object.assign(
    ({ children, ...props }: any) =>
      createElement("div", { "data-testid": "dropdown", ...props }, children),
    {
      Trigger: ({ children }: any) => createElement("div", {}, children),
      Popover: ({ children }: any) => createElement("div", {}, children),
      Menu: ({ children }: any) => createElement("div", {}, children),
      Item: ({ children, id, onPress, textValue: _tv, ...p }: any) =>
        createElement(
          "button",
          {
            type: "button",
            "data-dropdown-item": id,
            onClick: onPress,
            ...p,
          },
          children,
        ),
    },
  ),
  Pagination: ({ ...props }: any) =>
    createElement("div", { "data-testid": "pagination", ...props }),
  Chip: ({ children, ...props }: any) => createElement("span", props, children),
  Avatar: ({ name, ...props }: any) =>
    createElement("div", { "data-testid": "avatar", ...props }, name),
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
  MessagesSquare: () => createElement("span", {}, "MessagesSquare icon"),
  CirclePlus: () => createElement("span", {}, "CirclePlus icon"),
  CircleUser: () => createElement("span", {}, "CircleUser icon"),
  Shield: () => createElement("span", {}, "Shield Icon"),
  ChevronLeft: () => createElement("span", {}, "ChevronLeft Icon"),
  ChevronRight: () => createElement("span", {}, "ChevronRight Icon"),
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

vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: ReactNode }) => children,
  useUser: vi.fn(() => ({
    user: {
      id: "test-clerk-user",
      firstName: "Test",
      lastName: "User",
      publicMetadata: { roles: ["admin"] },
    },
    isLoaded: true,
    isSignedIn: true,
  })),
  useClerk: vi.fn(() => ({ signOut: vi.fn() })),
  SignInButton: ({ children }: { children?: ReactNode }) =>
    createElement("button", { type: "button" }, children),
  SignUp: () => null,
  SignIn: () => null,
  UserProfile: () => null,
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
