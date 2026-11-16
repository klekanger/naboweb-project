import { describe, it, expect, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn(),
  redirect: vi.fn((to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  }),
}));

vi.mock("@clerk/nextjs/server", () => ({ currentUser: mocks.currentUser }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import {
  CMS_ROLES,
  getUserWithRole,
  requireRoleOrRedirect,
  RESIDENT_ROLES,
} from "./requireRole";

const user = (roles: unknown) => ({ id: "u1", publicMetadata: { roles } });

beforeEach(() => vi.clearAllMocks());

describe("getUserWithRole", () => {
  it("returns the user when they have one of the roles", async () => {
    mocks.currentUser.mockResolvedValue(user(["user", "editor"]));
    expect(await getUserWithRole(CMS_ROLES)).toMatchObject({ id: "u1" });
  });

  it.each([
    ["signed out", null],
    ["no roles metadata", { id: "u1", publicMetadata: {} }],
    ["roles is not an array", user("user")],
    ["missing role", user(["editor"])],
  ])("returns null when %s", async (_label, value) => {
    mocks.currentUser.mockResolvedValue(value);
    expect(await getUserWithRole(RESIDENT_ROLES)).toBeNull();
  });
});

describe("requireRoleOrRedirect", () => {
  it("redirects to the front page without the role", async () => {
    mocks.currentUser.mockResolvedValue(user(["user"]));
    await expect(requireRoleOrRedirect(CMS_ROLES)).rejects.toThrow("NEXT_REDIRECT:/");
  });

  it("returns the user with the role", async () => {
    mocks.currentUser.mockResolvedValue(user(["admin"]));
    expect(await requireRoleOrRedirect(CMS_ROLES)).toMatchObject({ id: "u1" });
  });
});
