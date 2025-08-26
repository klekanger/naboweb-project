import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { UserAdminProps } from "@/types/types";

// Mock dependencies
const validateUserRolesMock = vi.fn();
vi.mock("@/lib/validateUserRoles", () => ({
  validateUserRoles: validateUserRolesMock,
  validRoles: { ADMIN: "admin", USER: "user", EDITOR: "editor" },
}));

// Mock Clerk
const mockGetUserList = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn().mockReturnValue({
    users: {
      getUserList: mockGetUserList,
    },
  }),
}));

// Mock UserAdmin component
const UserAdminMock = vi.fn().mockImplementation((props: UserAdminProps) => {
  return (
    <div data-testid="user-admin-mock">
      <span data-testid="user-count">{props.users.length}</span>
      <span data-testid="current-page">{props.pagination?.currentPage}</span>
    </div>
  );
});

vi.mock("@/components/userAdmin/UserAdmin", () => ({
  __esModule: true,
  default: UserAdminMock,
}));

// Mock BackButton component
vi.mock("@/components/BackButton", () => ({
  __esModule: true,
  default: ({ buttonLink }: { buttonLink: string }) => (
    <div data-testid="back-button" data-link={buttonLink}>
      Back Button
    </div>
  ),
}));

// Mock next/navigation
const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("User Admin Page", () => {
  let Page: (props: { searchParams: Promise<any> }) => Promise<any>;

  beforeEach(async () => {
    vi.clearAllMocks();
    redirectMock.mockClear();
    Page = (await import("./page")).default;
  });

  afterEach(() => {
    cleanup();
  });

  describe("Authentication & Authorization", () => {
    it("renders not admin message for non-admin users", async () => {
      validateUserRolesMock.mockResolvedValue(false);

      const result = await Page({ searchParams: Promise.resolve({}) });
      const { container } = render(result);

      const noAdminDiv = container.querySelector("#no-admin");
      expect(noAdminDiv).toBeTruthy();
      expect(noAdminDiv?.textContent).toBe("Du er ikke administrator");
    });

    it("calls validateUserRoles with correct parameters", async () => {
      validateUserRolesMock.mockResolvedValue(true);
      mockGetUserList.mockResolvedValue({
        data: [],
        totalCount: 0,
      });

      await Page({ searchParams: Promise.resolve({}) });

      expect(validateUserRolesMock).toHaveBeenCalledWith({
        requiredRoles: ["admin"],
      });
    });
  });

  describe("User Data Fetching", () => {
    const testDate = new Date("2022-01-01").getTime();
    beforeEach(() => {
      validateUserRolesMock.mockResolvedValue(true);
    });

    it("renders UserAdmin component for admin with users", async () => {
      const mockUsers = [
        {
          id: "1",
          firstName: "Fredrik",
          lastName: "Andersen",
          emailAddresses: [{ emailAddress: "fredrik@example.com" }],
          createdAt: testDate,
          publicMetadata: { roles: ["user"] },
          imageUrl: "",
        },
        {
          id: "2",
          firstName: "Baldur",
          lastName: "Baldersen",
          emailAddresses: [{ emailAddress: "baldur@example.com" }],
          createdAt: testDate,
          publicMetadata: { roles: ["user", "admin"] },
          imageUrl: "",
        },
      ];

      mockGetUserList.mockResolvedValue({
        data: mockUsers,
        totalCount: 2,
      });

      const result = await Page({ searchParams: Promise.resolve({}) });
      const { container } = render(result);

      const userAdminElement = container.querySelector(
        '[data-testid="user-admin-mock"]',
      );
      expect(userAdminElement).toBeTruthy();

      const userCount = container.querySelector('[data-testid="user-count"]');
      expect(userCount?.textContent).toBe("2");
    });

    it("handles pagination correctly", async () => {
      const mockUsers = Array.from({ length: 30 }, (_, i) => ({
        id: `user-${i}`,
        firstName: `User${i}`,
        lastName: "Test",
        emailAddresses: [{ emailAddress: `user${i}@example.com` }],
        createdAt: testDate,
        publicMetadata: { roles: ["user"] },
        imageUrl: "",
      }));

      mockGetUserList.mockResolvedValue({
        data: mockUsers,
        totalCount: 100,
      });

      const result = await Page({
        searchParams: Promise.resolve({ page: "2" }),
      });
      const { container } = render(result);

      expect(mockGetUserList).toHaveBeenCalledWith({
        limit: 30,
        offset: 30,
      });

      const currentPage = container.querySelector(
        '[data-testid="current-page"]',
      );
      expect(currentPage?.textContent).toBe("2");
    });

    it("handles search functionality", async () => {
      const mockUsers = [
        {
          id: "1",
          firstName: "Fredrik",
          lastName: "Andersen",
          emailAddresses: [{ emailAddress: "fredrik@example.com" }],
          createdAt: testDate,
          publicMetadata: { roles: ["user"] },
          imageUrl: "",
        },
      ];

      mockGetUserList.mockResolvedValue({
        data: mockUsers,
        totalCount: 1,
      });

      await Page({
        searchParams: Promise.resolve({ search: "Fredrik" }),
      });

      expect(mockGetUserList).toHaveBeenCalledWith({
        query: "Fredrik",
        limit: 50,
      });
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      validateUserRolesMock.mockResolvedValue(true);
    });

    it("handles fetch errors gracefully", async () => {
      mockGetUserList.mockRejectedValue(new Error("API Error"));

      const result = await Page({ searchParams: Promise.resolve({}) });
      const { container } = render(result);

      const errorMessage = container.querySelector("p");
      expect(errorMessage?.textContent).toBe("Noe gikk galt");
    });

    it("redirects on invalid page numbers", async () => {
      await Page({
        searchParams: Promise.resolve({ page: "invalid" }),
      });

      expect(redirectMock).toHaveBeenCalledWith("/user-admin-page?page=1");
    });

    it("redirects when page exceeds total pages", async () => {
      mockGetUserList.mockResolvedValue({
        data: [],
        totalCount: 30, // Only 1 page with 30 users per page
      });

      await Page({
        searchParams: Promise.resolve({ page: "5" }),
      });

      expect(redirectMock).toHaveBeenCalledWith("/user-admin-page?page=1");
    });
  });

  describe("Component Integration", () => {
    const testDate = new Date("2022-01-01").getTime();
    beforeEach(() => {
      validateUserRolesMock.mockResolvedValue(true);
    });

    it("renders page title and back button", async () => {
      mockGetUserList.mockResolvedValue({
        data: [],
        totalCount: 0,
      });

      const result = await Page({ searchParams: Promise.resolve({}) });
      const { container } = render(result);

      const title = container.querySelector("h1");
      expect(title?.textContent).toBe("Administrer brukere");

      const backButton = container.querySelector('[data-testid="back-button"]');
      expect(backButton).toBeTruthy();
      expect(backButton?.getAttribute("data-link")).toBe("/min-side");
    });

    it("passes correct props to UserAdmin component", async () => {
      const mockUsers = [
        {
          id: "1",
          firstName: "Fredrik",
          lastName: "Andersen",
          emailAddresses: [{ emailAddress: "fredrik@example.com" }],
          createdAt: testDate,
          publicMetadata: { roles: ["user"] },
          imageUrl: "",
        },
      ];

      mockGetUserList.mockResolvedValue({
        data: mockUsers,
        totalCount: 1,
      });

      const result = await Page({ searchParams: Promise.resolve({}) });
      render(result);

      // Verify UserAdmin was called
      expect(UserAdminMock).toHaveBeenCalledTimes(1);

      // Get the actual call arguments
      const callArgs = UserAdminMock.mock.calls[0][0];

      // Verify the structure and key properties
      expect(callArgs).toHaveProperty("users");
      expect(callArgs).toHaveProperty("pagination");
      expect(callArgs).toHaveProperty("isSearchResult");

      expect(callArgs.users).toHaveLength(1);
      expect(callArgs.users[0]).toMatchObject({
        id: "1",
        firstName: "Fredrik",
        lastName: "Andersen",
        email: "fredrik@example.com",
        roles: ["user"],
      });

      expect(callArgs.pagination).toMatchObject({
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });

      expect(callArgs.isSearchResult).toBe(false);
    });
  });
});
