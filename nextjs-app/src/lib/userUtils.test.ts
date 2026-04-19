import { describe, it, expect } from "vitest";
import { calculatePaginationData, mapUsersWithEmails } from "./userUtils";
import type { UserResource } from "@clerk/types";

describe("User Utility Functions", () => {
  describe("calculatePaginationData", () => {
    it("calculates pagination correctly", () => {
      const result = calculatePaginationData(2, 100, 30);
      expect(result).toEqual({
        currentPage: 2,
        totalPages: 4,
        totalCount: 100,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it("handles edge cases", () => {
      const result = calculatePaginationData(1, 0, 30);
      expect(result).toEqual({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it("handles single page", () => {
      const result = calculatePaginationData(1, 15, 30);
      expect(result).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalCount: 15,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });

  describe("mapUsersWithEmails", () => {
    it("maps Clerk user to internal format", () => {
      const testDate = new Date("2022-01-01").getTime();
      const clerkUser = {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        emailAddresses: [{ emailAddress: "john@example.com" }],
        createdAt: testDate,
        publicMetadata: { roles: ["user"] },
        imageUrl: "https://example.com/avatar.jpg",
      } as unknown as UserResource;

      const result = mapUsersWithEmails(clerkUser);
      expect(result).toEqual({
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        createdAt: testDate,
        roles: ["user"],
        emailSubscription: undefined,
        imageUrl: "https://example.com/avatar.jpg",
      });
    });

    it("maps emailSubscription when set on publicMetadata", () => {
      const clerkUser = {
        id: "1",
        firstName: "Jane",
        lastName: "Doe",
        emailAddresses: [{ emailAddress: "jane@example.com" }],
        createdAt: new Date("2022-01-01").getTime(),
        publicMetadata: { roles: ["user"], emailSubscription: true },
        imageUrl: "",
      } as unknown as UserResource;

      expect(mapUsersWithEmails(clerkUser).emailSubscription).toBe(true);
    });

    it("handles missing email addresses", () => {
      const clerkUser = {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        emailAddresses: [],
        createdAt: new Date("2022-01-01").getTime(),
        publicMetadata: { roles: ["user"] },
        imageUrl: "",
      } as unknown as UserResource;

      const result = mapUsersWithEmails(clerkUser);
      expect(result.email).toBe("");
    });

    it("handles missing roles", () => {
      const clerkUser = {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        emailAddresses: [{ emailAddress: "john@example.com" }],
        createdAt: new Date("2022-01-01").getTime(),
        publicMetadata: {},
        imageUrl: "",
      } as unknown as UserResource;

      const result = mapUsersWithEmails(clerkUser);
      expect(result.roles).toEqual([]);
    });
  });
});
