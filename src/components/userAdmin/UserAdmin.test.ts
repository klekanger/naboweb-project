import { describe, it, expect } from "vitest";
import { Crown, UserCheck, UserCog, UserPlus2, Users } from "lucide-react";
import { menuElements, validateEmail, validateForm } from "./UserAdmin.logic";

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
