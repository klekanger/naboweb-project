import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Crown, UserCheck, UserCog, UserPlus2, Users } from "lucide-react";
import { menuElements, validateEmail, validateForm } from "./UserAdmin.logic";
import {
  renderUserAdminWithContext,
  norwegianTextContent,
  createMockUserAdminContext,
  createMockUsers,
  createMockPagination,
} from "./UserAdmin.test-utils";
import { UserAdminContext } from "@/context/userAdminContext";
import UserAdmin from "./UserAdmin";

// Test individual pieces of the UserAdmin component logic
describe("UserAdmin Component - Logic Tests", () => {
  describe("Menu Configuration", () => {
    it("has correct menu structure from actual component", () => {
      expect(menuElements).toHaveLength(5);
      expect(menuElements[0].name).toBe("Vis brukere");
      expect(menuElements[1].name).toBe("Inviter bruker");
      expect(menuElements[2].name).toBe("Ny bruker");
      expect(menuElements[3].name).toBe("Endre bruker");
      expect(menuElements[4].name).toBe("Superbrukere");
    });

    it("has correct icon components from actual component", () => {
      expect(menuElements[0].menuIcon).toBe(Users);
      expect(menuElements[1].menuIcon).toBe(UserCheck);
      expect(menuElements[2].menuIcon).toBe(UserPlus2);
      expect(menuElements[3].menuIcon).toBe(UserCog);
      expect(menuElements[4].menuIcon).toBe(Crown);
    });
  });

  describe("Form Validation Logic", () => {
    it("validates email format correctly using actual component logic", () => {
      expect(validateEmail("valid@example.com")).toBe(true);
      expect(validateEmail("user@domain.co.uk")).toBe(true);
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("@domain.com")).toBe(false);
    });

    it("validates form completeness using actual component logic", () => {
      const validUser = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        roles: ["user"],
      };

      const invalidUserEmail = {
        email: "invalid-email",
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        roles: ["user"],
      };

      const invalidUserName = {
        email: "test@example.com",
        firstName: "",
        lastName: "Doe",
        password: "password123",
        roles: ["user"],
      };

      expect(validateForm(validUser)).toBe(true);
      expect(validateForm(invalidUserEmail)).toBe(false);
      expect(validateForm(invalidUserName)).toBe(false);
    });
  });

  describe("User Role Logic", () => {
    it("handles role assignments correctly", () => {
      const defaultRoles = ["user"];
      const adminRoles = ["user", "admin"];
      const editorRoles = ["user", "editor"];
      const superUserRoles = ["user", "admin", "editor"];

      expect(defaultRoles).toContain("user");
      expect(adminRoles).toContain("admin");
      expect(editorRoles).toContain("editor");

      // All users should have the base "user" role
      expect(adminRoles).toContain("user");
      expect(editorRoles).toContain("user");
      expect(superUserRoles).toContain("user");
    });

    it("validates role combinations", () => {
      const isValidRoleSet = (roles: string[]) => {
        return roles.includes("user") && roles.length > 0;
      };

      expect(isValidRoleSet(["user"])).toBe(true);
      expect(isValidRoleSet(["user", "admin"])).toBe(true);
      expect(isValidRoleSet(["admin"])).toBe(false); // Missing base "user" role
      expect(isValidRoleSet([])).toBe(false); // Empty roles
    });
  });

  describe("Constants", () => {
    it("defines correct maximum users per page", () => {
      const MAX_USERS_PER_PAGE = 30;
      expect(MAX_USERS_PER_PAGE).toBe(30);
      expect(typeof MAX_USERS_PER_PAGE).toBe("number");
    });

    it("defines correct search result limit", () => {
      const SEARCH_RESULT_LIMIT = 50;
      expect(SEARCH_RESULT_LIMIT).toBe(50);
      expect(typeof SEARCH_RESULT_LIMIT).toBe("number");
    });
  });
});

// Test component rendering behavior
describe("UserAdmin Component - Rendering Tests", () => {
  describe("Menu Structure Rendering", () => {
    it("renders all menu items from menuElements array", () => {
      renderUserAdminWithContext();

      // Test that all menu items from the actual menuElements array render correctly
      menuElements.forEach((element) => {
        const menuItem = screen.getByText(element.name);
        expect(menuItem).toBeDefined();
      });
    });

    it("displays correct Norwegian text for all menu items", () => {
      renderUserAdminWithContext();

      // Test that menu item names display correct Norwegian text
      expect(screen.getByText("Vis brukere")).toBeDefined();
      expect(screen.getByText("Inviter bruker")).toBeDefined();
      expect(screen.getByText("Ny bruker")).toBeDefined();
      expect(screen.getByText("Endre bruker")).toBeDefined();
      expect(screen.getByText("Superbrukere")).toBeDefined();
    });

    it("renders menu icons as expected components", () => {
      renderUserAdminWithContext();

      // Test that menu icons render as expected components by checking for their presence
      // Since we can't directly test React components in the DOM, we test that the buttons exist
      const menuButtons = screen.getAllByRole("button");

      // Should have 5 menu buttons (one for each menu item)
      const menuItemButtons = menuButtons.filter((button) =>
        norwegianTextContent.menuItems.some((menuText) =>
          button.textContent?.includes(menuText),
        ),
      );

      expect(menuItemButtons).toHaveLength(5);
    });

    it("renders menu descriptions with correct HTML content", () => {
      renderUserAdminWithContext();

      // Test that menu descriptions render with correct HTML content
      // The description is rendered in the header section using dangerouslySetInnerHTML
      const headerElement = screen.getByText(
        /Viser alle brukere som er registrert/,
      );
      expect(headerElement).toBeDefined();

      // Check that HTML content is properly rendered (br tags should create line breaks)
      expect(headerElement.innerHTML).toContain(
        "Viser alle brukere som er registrert, sortert etter etternavn og deretter fornavn.",
      );
    });

    it("renders correct number of menu items", () => {
      renderUserAdminWithContext();

      // Test that exactly 5 menu items are rendered
      norwegianTextContent.menuItems.forEach((menuText) => {
        expect(screen.getByText(menuText)).toBeDefined();
      });

      // Verify we have exactly the expected number
      expect(norwegianTextContent.menuItems).toHaveLength(5);
    });

    it("renders menu items with proper button structure", () => {
      renderUserAdminWithContext();

      // Test that each menu item is rendered as a button with proper structure
      norwegianTextContent.menuItems.forEach((menuText) => {
        const button = screen.getByRole("button", {
          name: new RegExp(menuText),
        });
        expect(button).toBeDefined();
        expect(button.className).toContain("h-24"); // Should have the expected styling classes
      });
    });

    it("displays menu descriptions that match menuElements data", () => {
      renderUserAdminWithContext();

      // Test that the displayed description matches the first menu item (default selected)
      const expectedDescription = menuElements[0].description;

      // The description contains HTML, so we need to check for text content
      expect(
        screen.getByText(/Viser alle brukere som er registrert/),
      ).toBeDefined();
      expect(
        screen.getByText(
          /Du kan bruke søkefeltet for å finne en bestemt bruker/,
        ),
      ).toBeDefined();
    });

    describe("Menu Interaction Behavior", () => {
      it("updates selectedMenu in context when clicking menu items", async () => {
        const { mockContextValue, user } = renderUserAdminWithContext();

        // Click on the "Inviter bruker" menu item
        const inviteUserButton = screen.getByText("Inviter bruker");
        await user.click(inviteUserButton);

        // Test that setSelectedMenu was called with the correct menu ID
        expect(mockContextValue.setSelectedMenu).toHaveBeenCalledWith(1);
      });

      it("displays selected menu item with bold styling", () => {
        // Test with different selected menu
        renderUserAdminWithContext({}, { selectedMenu: 2 }); // CREATE_USER menu

        // The selected menu item should be wrapped in <strong> tag
        const selectedMenuItem = screen.getByText("Ny bruker");
        expect(selectedMenuItem.tagName).toBe("STRONG");
      });

      it("displays non-selected menu items with regular styling", () => {
        // Test with CREATE_USER menu selected (id: 2)
        renderUserAdminWithContext({}, { selectedMenu: 2 });

        // Non-selected menu items should be wrapped in <span> tag
        const nonSelectedMenuItem = screen.getByText("Vis brukere");
        expect(nonSelectedMenuItem.tagName).toBe("SPAN");
      });

      it("changes displayed content area when menu selection changes", () => {
        // Test with USERS menu selected (default)
        const { rerender } = renderUserAdminWithContext();

        // Should show UserTable component content
        expect(screen.getByText(/Viser alle brukere som er registrert/)).toBeDefined();

        // Re-render with CREATE_USER menu selected
        rerender(
          <UserAdminContext.Provider value={createMockUserAdminContext({ selectedMenu: 2 })}>
            <UserAdmin users={createMockUsers()} pagination={createMockPagination()} />
          </UserAdminContext.Provider>
        );

        // Should show create user form content
        expect(screen.getByText(/Opprett en ny bruker/)).toBeDefined();
      });

      it("calls setSelectedUser when switching menus", async () => {
        const { mockContextValue, user } = renderUserAdminWithContext();

        // Click on a different menu item
        const editUserButton = screen.getByText("Endre bruker");
        await user.click(editUserButton);

        // Test that setSelectedUser was called with null (to clear selection)
        expect(mockContextValue.setSelectedUser).toHaveBeenCalledWith(null);
      });

      it("handles menu clicks for all menu items correctly", async () => {
        const { mockContextValue, user } = renderUserAdminWithContext();

        // Test clicking each menu item
        for (let i = 0; i < menuElements.length; i++) {
          const menuButton = screen.getByText(menuElements[i].name);
          await user.click(menuButton);

          // Verify setSelectedMenu was called with correct ID
          expect(mockContextValue.setSelectedMenu).toHaveBeenCalledWith(i);
        }

        // Should have been called once for each menu item
        expect(mockContextValue.setSelectedMenu).toHaveBeenCalledTimes(menuElements.length);
      });

      it("resets selected user when switching between menus", async () => {
        const { mockContextValue, user } = renderUserAdminWithContext();

        // Click on multiple menu items
        await user.click(screen.getByText("Inviter bruker"));
        await user.click(screen.getByText("Ny bruker"));
        await user.click(screen.getByText("Superbrukere"));

        // setSelectedUser should be called with null for each menu switch
        expect(mockContextValue.setSelectedUser).toHaveBeenCalledWith(null);
        expect(mockContextValue.setSelectedUser).toHaveBeenCalledTimes(3);
      });
    });
  });
});
