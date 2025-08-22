import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import {
  UserAdminContext,
  SidebarMenu,
  CreateUserScreenType,
} from "../../context/userAdminContext";
import type {
  UserAdminProps,
  UserWithEmails,
  PaginationData,
  NewUser,
} from "../../types/types";
import UserAdmin from "./UserAdmin";

// Mock UserAdminContext with all required properties
export const createMockUserAdminContext = (overrides: Partial<any> = {}) => ({
  generalError: "",
  setGeneralError: vi.fn(),
  selectedMenu: SidebarMenu.USERS,
  setSelectedMenu: vi.fn(),
  isCreatingUser: false,
  setIsCreatingUser: vi.fn(),
  emailValue: "",
  setEmailValue: vi.fn(),
  newUser: {
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roles: ["user"],
  },
  setNewUser: vi.fn(),
  newlyCreatedUser: {
    email: "",
    firstName: "",
    lastName: "",
    roles: ["user"],
  },
  setNewlyCreatedUser: vi.fn(),
  screenToDisplay: CreateUserScreenType.FORM,
  setScreenToDisplay: vi.fn(),
  selectedUser: null,
  setSelectedUser: vi.fn(),
  resetUserAdminContext: vi.fn(),
  ...overrides,
});

// Mock user data factory functions
export const createMockUser = (
  overrides: Partial<UserWithEmails> = {},
): UserWithEmails => ({
  id: "user-123",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  roles: ["user"],
  createdAt: new Date("2023-01-01"),
  imageUrl: "https://example.com/avatar.jpg",
  ...overrides,
});

export const createMockUsers = (count: number = 3): UserWithEmails[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: `user-${index + 1}`,
      firstName: `User${index + 1}`,
      lastName: `Lastname${index + 1}`,
      email: `user${index + 1}@example.com`,
    }),
  );
};

// Mock pagination data for testing
export const createMockPagination = (
  overrides: Partial<PaginationData> = {},
): PaginationData => ({
  currentPage: 1,
  totalPages: 3,
  totalCount: 75,
  hasNextPage: true,
  hasPreviousPage: false,
  ...overrides,
});

// Mock NewUser data factory
export const createMockNewUser = (
  overrides: Partial<NewUser> = {},
): NewUser => ({
  email: "new.user@example.com",
  firstName: "New",
  lastName: "User",
  password: "SecurePassword123!",
  roles: ["user"],
  ...overrides,
});

// Utility function to render UserAdmin component with context
export const renderUserAdminWithContext = (
  props: Partial<UserAdminProps> = {},
  contextOverrides: Partial<any> = {},
) => {
  const defaultProps: UserAdminProps = {
    users: createMockUsers(),
    pagination: createMockPagination(),
    ...props,
  };

  const mockContextValue = createMockUserAdminContext(contextOverrides);

  const renderResult = render(
    <UserAdminContext.Provider value={mockContextValue}>
      <UserAdmin {...defaultProps} />
    </UserAdminContext.Provider>,
  );

  return {
    ...renderResult,
    mockContextValue,
    user: userEvent.setup(),
  };
};

// Test scenario helpers for different states
export const createTestScenarios = () => ({
  // Menu selection scenarios
  showUsersMenu: {
    contextOverrides: { selectedMenu: SidebarMenu.USERS },
    description: "Shows users list menu",
  },
  inviteUserMenu: {
    contextOverrides: { selectedMenu: SidebarMenu.INVITE_USER },
    description: "Shows invite user menu",
  },
  createUserMenu: {
    contextOverrides: { selectedMenu: SidebarMenu.CREATE_USER },
    description: "Shows create user form",
  },
  editUserMenu: {
    contextOverrides: { selectedMenu: SidebarMenu.EDIT_USER },
    description: "Shows edit user menu",
  },
  superUsersMenu: {
    contextOverrides: { selectedMenu: SidebarMenu.SHOW_SUPER_USERS },
    description: "Shows super users menu",
  },

  // Form state scenarios
  createUserForm: {
    contextOverrides: {
      selectedMenu: SidebarMenu.CREATE_USER,
      screenToDisplay: CreateUserScreenType.FORM,
      isCreatingUser: false,
    },
    description: "Shows create user form",
  },
  createUserLoading: {
    contextOverrides: {
      selectedMenu: SidebarMenu.CREATE_USER,
      isCreatingUser: true,
      newUser: createMockNewUser(),
    },
    description: "Shows loading state during user creation",
  },
  createUserSuccess: {
    contextOverrides: {
      selectedMenu: SidebarMenu.CREATE_USER,
      screenToDisplay: CreateUserScreenType.SUCCESS,
      isCreatingUser: false,
      newlyCreatedUser: {
        email: "new.user@example.com",
        firstName: "New",
        lastName: "User",
        roles: ["user"],
      },
    },
    description: "Shows success screen after user creation",
  },

  // Error state scenarios
  generalError: {
    contextOverrides: {
      generalError: "Det har oppstått en feil",
    },
    description: "Shows error modal with Norwegian error message",
  },
  emailValidationError: {
    contextOverrides: {
      selectedMenu: SidebarMenu.CREATE_USER,
      emailValue: "invalid-email",
      newUser: createMockNewUser({ email: "invalid-email" }),
    },
    description: "Shows email validation error",
  },

  // User selection scenarios
  userSelected: {
    contextOverrides: {
      selectedUser: createMockUser({
        id: "selected-user",
        firstName: "Selected",
        lastName: "User",
        email: "selected@example.com",
        roles: ["user", "editor"],
      }),
    },
    description: "Has a user selected for editing",
  },
});

// Mock server actions
export const mockServerActions = {
  createNewUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  searchUser: vi.fn(),
  inviteUser: vi.fn(),
};

// Mock Norwegian error messages
export const mockNorwegianErrors = [
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
  {
    code: "form_password_length_too_short",
    message: "Passordet er for kort",
  },
  {
    code: "form_password_pwned",
    message: "Passordet er funnet i en datalekkasje - velg et annet",
  },
  {
    code: "User already exists",
    message: "Brukeren eksisterer allerede",
  },
  {
    code: "User is not admin",
    message: "Du er ikke administrator",
  },
  {
    code: "Unauthorized",
    message: "Du har ikke tilgang",
  },
  {
    code: "Failed to delete user",
    message: "Kunne ikke slette brukeren.",
  },
  {
    code: "Not Found",
    message: "Brukeren ble ikke funnet",
  },
  {
    code: "Unprocessable Entity",
    message: "Kunne ikke invitere brukeren",
  },
];

// Helper to create mock successful server response
export const createMockSuccessResponse = (userData: Partial<any> = {}) => ({
  success: {
    message: "Bruker opprettet",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    roles: ["user"],
    id: "new-user-id",
    ...userData,
  },
  status: 200,
});

// Helper to create mock error server response
export const createMockErrorResponse = (errorData: Partial<any> = {}) => ({
  error: {
    message: "form_password_not_strong_enough",
    code: "form_password_not_strong_enough",
    longMessage: "velg et sikrere passord",
    ...errorData,
  },
  status: 400,
});

// Accessibility test helpers
export const accessibilityQueries = {
  getFormInputByLabel: (container: HTMLElement, labelText: string) => {
    const label = container.querySelector(`label:contains("${labelText}")`);
    return label?.querySelector("input");
  },
  getRequiredFields: (container: HTMLElement) => {
    return container.querySelectorAll("input[required]");
  },
  getAriaLabels: (container: HTMLElement) => {
    return container.querySelectorAll("[aria-label]");
  },
};

// Norwegian text content helpers
export const norwegianTextContent = {
  menuItems: [
    "Vis brukere",
    "Inviter bruker",
    "Ny bruker",
    "Endre bruker",
    "Superbrukere",
  ],
  formLabels: ["Fornavn", "Etternavn", "E-post", "Passord"],
  buttons: ["Legg til", "Avbryt", "Tilbake", "Opprett"],
  errorMessages: [
    "Tast inn en gyldig e-postadresse",
    "Det har oppstått en feil",
    "velg et sikrere passord",
  ],
  successMessages: ["Brukeren har blitt opprettet"],
};
