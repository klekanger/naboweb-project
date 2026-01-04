import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// Custom screen queries for Norwegian text content
export const norwegianScreen = {
  // Menu item queries
  getByMenuText: (text: string) => screen.getByText(text),
  queryByMenuText: (text: string) => screen.queryByText(text),

  // Form field queries with Norwegian labels
  getByLabelText: (labelText: string) => screen.getByLabelText(labelText),
  queryByLabelText: (labelText: string) => screen.queryByLabelText(labelText),

  // Button queries with Norwegian text
  getByButtonText: (text: string) => screen.getByRole("button", { name: text }),
  queryByButtonText: (text: string) =>
    screen.queryByRole("button", { name: text }),

  // Error message queries
  getByErrorText: (text: string) => screen.getByText(text),
  queryByErrorText: (text: string) => screen.queryByText(text),

  // Modal queries
  getModal: () => screen.getByTestId("modal"),
  queryModal: () => screen.queryByTestId("modal"),

  // Loading spinner queries
  getSpinner: () => screen.getByTestId("spinner"),
  querySpinner: () => screen.queryByTestId("spinner"),

  // Custom queries for specific Norwegian content
  getFornavnInput: () => screen.getByLabelText("Fornavn"),
  getEtternavnInput: () => screen.getByLabelText("Etternavn"),
  getEpostInput: () => screen.getByLabelText("E-post"),
  getPassordInput: () => screen.getByLabelText("Passord"),

  // Role checkbox queries
  getBrukerCheckbox: () => screen.getByRole("checkbox", { name: "Bruker" }),
  getRedaktorCheckbox: () => screen.getByRole("checkbox", { name: "Redaktør" }),
  getAdministratorCheckbox: () =>
    screen.getByRole("checkbox", { name: "Administrator" }),

  // Menu navigation queries
  getVisbrukereMenu: () => screen.getByText("Vis brukere"),
  getInviterbrukerMenu: () => screen.getByText("Inviter bruker"),
  getNybrukerMenu: () => screen.getByText("Ny bruker"),
  getEndrebrukerMenu: () => screen.getByText("Endre bruker"),
  getSuperbrukereMenu: () => screen.getByText("Superbrukere"),
};

// User event setup with Norwegian keyboard layout considerations
export const setupUserEvent = () => {
  return userEvent.setup({
    // Add any Norwegian-specific keyboard configurations if needed
    advanceTimers: vi.advanceTimersByTime,
  });
};

// Test helpers for form interactions
export const formHelpers = {
  // Fill out create user form with Norwegian validation
  fillCreateUserForm: async (user: any, userEventInstance: any) => {
    await userEventInstance.type(
      norwegianScreen.getFornavnInput(),
      user.firstName,
    );
    await userEventInstance.type(
      norwegianScreen.getEtternavnInput(),
      user.lastName,
    );
    await userEventInstance.type(norwegianScreen.getEpostInput(), user.email);
    await userEventInstance.type(
      norwegianScreen.getPassordInput(),
      user.password,
    );
  },

  // Clear form inputs
  clearCreateUserForm: async (userEventInstance: any) => {
    await userEventInstance.clear(norwegianScreen.getFornavnInput());
    await userEventInstance.clear(norwegianScreen.getEtternavnInput());
    await userEventInstance.clear(norwegianScreen.getEpostInput());
    await userEventInstance.clear(norwegianScreen.getPassordInput());
  },

  // Submit form
  submitForm: async (userEventInstance: any) => {
    const submitButton = norwegianScreen.getByButtonText("Legg til");
    await userEventInstance.click(submitButton);
  },

  // Cancel form
  cancelForm: async (userEventInstance: any) => {
    const cancelButton = norwegianScreen.getByButtonText("Avbryt");
    await userEventInstance.click(cancelButton);
  },
};

// Menu navigation helpers
export const menuHelpers = {
  // Navigate to different menu items
  navigateToUsers: async (userEventInstance: any) => {
    await userEventInstance.click(norwegianScreen.getVisbrukereMenu());
  },

  navigateToInviteUser: async (userEventInstance: any) => {
    await userEventInstance.click(norwegianScreen.getInviterbrukerMenu());
  },

  navigateToCreateUser: async (userEventInstance: any) => {
    await userEventInstance.click(norwegianScreen.getNybrukerMenu());
  },

  navigateToEditUser: async (userEventInstance: any) => {
    await userEventInstance.click(norwegianScreen.getEndrebrukerMenu());
  },

  navigateToSuperUsers: async (userEventInstance: any) => {
    await userEventInstance.click(norwegianScreen.getSuperbrukereMenu());
  },
};

// Accessibility test helpers
export const accessibilityHelpers = {
  // Check if element has proper ARIA attributes
  hasProperAriaAttributes: (element: HTMLElement) => {
    const hasAriaLabel = element.hasAttribute("aria-label");
    const hasAriaLabelledBy = element.hasAttribute("aria-labelledby");
    const hasAriaDescribedBy = element.hasAttribute("aria-describedby");

    return hasAriaLabel || hasAriaLabelledBy || hasAriaDescribedBy;
  },

  // Check keyboard navigation
  checkKeyboardNavigation: async (
    userEventInstance: any,
    elements: HTMLElement[],
  ) => {
    for (let i = 0; i < elements.length; i++) {
      await userEventInstance.tab();
      expect(elements[i]).toHaveFocus();
    }
  },

  // Check if form has proper labels
  checkFormLabels: () => {
    const requiredLabels = ["Fornavn", "Etternavn", "E-post", "Passord"];
    requiredLabels.forEach((label) => {
      expect(norwegianScreen.getByLabelText(label)).toBeInTheDocument();
    });
  },

  // Check if error messages are properly associated
  checkErrorMessageAssociation: (
    inputElement: HTMLElement,
    errorMessage: string,
  ) => {
    const errorElement = screen.getByText(errorMessage);
    const inputId = inputElement.getAttribute("id");
    const errorId = errorElement.getAttribute("id");
    const ariaDescribedBy = inputElement.getAttribute("aria-describedby");

    return ariaDescribedBy?.includes(errorId || "") || false;
  },
};

// Modal interaction helpers
export const modalHelpers = {
  // Wait for modal to appear
  waitForModal: async () => {
    return await screen.findByTestId("modal");
  },

  // Close modal by clicking OK button
  closeErrorModal: async (userEventInstance: any) => {
    const okButton = screen.getByText("Ok");
    await userEventInstance.click(okButton);
  },

  // Confirm action in confirmation modal
  confirmAction: async (userEventInstance: any) => {
    const confirmButton = screen.getByText("Opprett");
    await userEventInstance.click(confirmButton);
  },

  // Cancel action in confirmation modal
  cancelAction: async (userEventInstance: any) => {
    const cancelButton = screen.getByText("Avbryt");
    await userEventInstance.click(cancelButton);
  },
};

// Test data validation helpers
export const validationHelpers = {
  // Norwegian email validation patterns
  validNorwegianEmails: [
    "test@example.no",
    "bruker@domain.com",
    "navn.etternavn@firma.no",
    "user123@test.org",
  ],

  invalidEmails: [
    "invalid-email",
    "@domain.com",
    "user@",
    "user.domain.com",
    "",
  ],

  // Norwegian name patterns
  validNorwegianNames: [
    "Ole",
    "Kari",
    "Lars-Erik",
    "Anne-Berit",
    "Bjørn",
    "Åse",
  ],

  invalidNames: ["", "   ", "123", "!@#"],

  // Password validation
  validPasswords: ["SecurePassword123!", "MyPassword2024", "TestPass123"],

  weakPasswords: ["123", "password", "abc", ""],
};

// Error message expectations in Norwegian
export const norwegianErrorMessages = {
  emailValidation: "Tast inn en gyldig e-postadresse",
  generalError: "Det har oppstått en feil",
  passwordWeak: "velg et sikrere passord",
  emailNotAvailable: "E-postadressen er ikke tilgjengelig",
  userExists: "En bruker med denne e-postadressen eksisterer allerede",
  requiredField: "Dette feltet er påkrevd",
};

// Success message expectations in Norwegian
export const norwegianSuccessMessages = {
  userCreated: "Brukeren har blitt opprettet",
  userUpdated: "Brukeren har blitt oppdatert",
  userDeleted: "Brukeren har blitt slettet",
  invitationSent: "Invitasjonen har blitt sendt",
};
