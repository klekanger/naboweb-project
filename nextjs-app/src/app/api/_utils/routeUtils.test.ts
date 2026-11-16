// Lead 5: a Clerk account with no roles must not count as a resident in the
// API, the same as on the protected pages.
import { describe, it, expect, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn(),
  create: vi.fn(),
  patch: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ currentUser: mocks.currentUser }));
vi.mock("@/sanity/lib/client", () => ({
  clientWithWriteAccess: {
    create: mocks.create,
    patch: mocks.patch,
    fetch: mocks.fetch,
  },
}));

import {
  getCurrentUserWithRoles,
  getSanityAdminEditorAuth,
} from "./routeUtils";
import { POST as createMessage } from "@/app/api/create-new-message/route";
import { POST as createComment } from "@/app/api/create-comment/route";

const account = (publicMetadata: Record<string, unknown>) => ({
  id: "user_new",
  publicMetadata,
});

const post = (body: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as never;

beforeEach(() => vi.clearAllMocks());

describe("getCurrentUserWithRoles", () => {
  it.each([
    ["no roles metadata", {}],
    ["roles set to null", { roles: null }],
    ["roles given as a string", { roles: "user" }],
    ["an empty roles list", { roles: [] }],
  ])("gives no roles for %s", async (_label, metadata) => {
    mocks.currentUser.mockResolvedValue(account(metadata));

    const { userRoles } = await getCurrentUserWithRoles();

    expect(userRoles).toEqual({ isUser: false, isAdmin: false, isEditor: false });
  });

  it("reads assigned roles", async () => {
    mocks.currentUser.mockResolvedValue(account({ roles: ["user", "editor"] }));

    const { userRoles } = await getCurrentUserWithRoles();

    expect(userRoles).toEqual({ isUser: true, isAdmin: false, isEditor: true });
  });
});

describe("getSanityAdminEditorAuth", () => {
  it("rejects a roles value that is a string containing 'admin'", async () => {
    mocks.currentUser.mockResolvedValue(account({ roles: "admin" }));

    const auth = await getSanityAdminEditorAuth();

    expect("errorResponse" in auth).toBe(true);
  });
});

describe("messageboard routes with an account that has no roles", () => {
  const block = {
    _type: "block",
    _key: "b1",
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: "s1", text: "Hei alle sammen", marks: [] }],
  };

  it("cannot create a message", async () => {
    mocks.currentUser.mockResolvedValue(account({}));

    const res = await createMessage(post({ title: "Hei", bodyText: [block] }));

    expect(res.status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("cannot comment", async () => {
    mocks.currentUser.mockResolvedValue(account({}));

    const res = await createComment(
      post({ _id: "msg-1", title: "Hei", bodyText: "En kommentar" }),
    );

    expect(res.status).toBe(401);
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.patch).not.toHaveBeenCalled();
  });
});
