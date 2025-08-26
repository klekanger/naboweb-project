import { describe, it, expect } from "vitest";
import { Crown, UserCheck, UserCog, UserPlus2, Users } from "lucide-react";
import {
  validateEmail,
  validateForm,
  isEmailInvalid,
  menuElements,
} from "./UserAdmin.logic";
import type { NewUser } from "@/types/types";

describe("UserAdmin Logic Tests", () => {
  describe("validateEmail", () => {
    it("validates correct email formats", () => {
      expect(validateEmail("valid@example.com")).toBe(true);
      expect(validateEmail("user@domain.co.uk")).toBe(true);
      expect(validateEmail("test.email+tag@example.org")).toBe(true);
      expect(validateEmail("user123@test-domain.com")).toBe(true);
    });

    it("rejects invalid email formats", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("@domain.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("user.domain.com")).toBe(false);
      expect(validateEmail("user@domain")).toBe(false);
    });

    it("handles edge cases", () => {
      expect(validateEmail("a@b.co")).toBe(true); // Minimum valid email
      expect(validateEmail("user@domain.info")).toBe(true); // 4-letter TLD
      expect(validateEmail("user@sub.domain.com")).toBe(true); // Subdomain
    });
  });

  describe("validateForm", () => {
    it("validates complete and correct user data", () => {
      const validUser: NewUser = {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        roles: ["user"],
      };

      expect(validateForm(validUser)).toBe(true);
    });

    it("rejects user data with invalid email", () => {
      const invalidUserEmail: NewUser = {
        email: "invalid-email",
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        roles: ["user"],
      };

      expect(validateForm(invalidUserEmail)).toBe(false);
    });

    it("rejects user data with missing firstName", () => {
      const invalidUserName: NewUser = {
        email: "test@example.com",
        firstName: "",
        lastName: "Doe",
        password: "password123",
        roles: ["user"],
      };

      expect(validateForm(invalidUserName)).toBe(false);
    });

    it("rejects user data with missing lastName", () => {
      const invalidUserLastName: NewUser = {
        email: "test@example.com",
        firstName: "John",
        lastName: "",
        password: "password123",
        roles: ["user"],
      };

      expect(validateForm(invalidUserLastName)).toBe(false);
    });

    it("rejects user data with missing email", () => {
      const invalidUserNoEmail: NewUser = {
        email: "",
        firstName: "John",
        lastName: "Doe",
        password: "password123",
        roles: ["user"],
      };

      expect(validateForm(invalidUserNoEmail)).toBe(false);
    });

    it("handles undefined user data gracefully", () => {
      expect(validateForm(undefined as any)).toBe(false);
      expect(validateForm(null as any)).toBe(false);
    });
  });

  describe("isEmailInvalid", () => {
    it("returns false for empty email (no validation error shown)", () => {
      expect(isEmailInvalid("")).toBe(false);
    });

    it("returns false for valid emails", () => {
      expect(isEmailInvalid("valid@example.com")).toBe(false);
      expect(isEmailInvalid("user@domain.co.uk")).toBe(false);
    });

    it("returns true for invalid emails", () => {
      expect(isEmailInvalid("invalid-email")).toBe(true);
      expect(isEmailInvalid("@domain.com")).toBe(true);
      expect(isEmailInvalid("user@")).toBe(true);
    });
  });

  describe("menuElements", () => {
    it("contains exactly 5 menu items", () => {
      expect(menuElements).toHaveLength(5);
    });

    it("has correct menu structure with all required properties", () => {
      menuElements.forEach((element, index) => {
        expect(element).toHaveProperty("id", index);
        expect(element).toHaveProperty("name");
        expect(element).toHaveProperty("description");
        expect(element).toHaveProperty("menuIcon");

        // Verify properties are not empty
        expect(element.name).toBeTruthy();
        expect(element.description).toBeTruthy();
        expect(typeof element.menuIcon).toBe("function"); // React component
      });
    });

    it("has correct Norwegian text for each menu item", () => {
      expect(menuElements[0].name).toBe("Vis brukere");
      expect(menuElements[1].name).toBe("Inviter bruker");
      expect(menuElements[2].name).toBe("Ny bruker");
      expect(menuElements[3].name).toBe("Endre bruker");
      expect(menuElements[4].name).toBe("Superbrukere");
    });

    it("has sequential IDs starting from 0", () => {
      menuElements.forEach((element, index) => {
        expect(element.id).toBe(index);
      });
    });

    it("has correct icon components for each menu item", () => {
      expect(menuElements[0].menuIcon).toBe(Users);
      expect(menuElements[1].menuIcon).toBe(UserCheck);
      expect(menuElements[2].menuIcon).toBe(UserPlus2);
      expect(menuElements[3].menuIcon).toBe(UserCog);
      expect(menuElements[4].menuIcon).toBe(Crown);
    });

    it("has HTML content in descriptions where appropriate", () => {
      // Some descriptions contain HTML tags for formatting
      expect(menuElements[0].description).toContain("<br />");
      expect(menuElements[4].description).toContain("<em>");
    });
  });
});
