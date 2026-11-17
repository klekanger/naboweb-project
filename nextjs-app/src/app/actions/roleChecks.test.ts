import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const users = {
    getUser: vi.fn(),
    getUserList: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    updateUserMetadata: vi.fn(),
    deleteUser: vi.fn(),
  };
  return {
    currentUser: vi.fn(),
    users,
    invitations: { createInvitation: vi.fn() },
    sanityFetch: vi.fn(),
    clientFetch: vi.fn(),
    sanityDelete: vi.fn(),
  };
});

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: mocks.currentUser,
  clerkClient: async () => ({
    users: mocks.users,
    invitations: mocks.invitations,
  }),
}));
vi.mock("@/sanity/lib/client", () => ({
  client: { fetch: mocks.clientFetch },
  clientWithWriteAccess: { delete: mocks.sanityDelete },
}));
vi.mock("@/sanity/lib/live", () => ({ sanityFetch: mocks.sanityFetch }));

// setup.ts mocks several actions globally for component tests; load the real ones.
const actual = <T>(path: string) => vi.importActual<T>(path);
const { createNewUser } = await actual<typeof import("./createUser")>("./createUser");
const { deleteUser } = await actual<typeof import("./deleteUser")>("./deleteUser");
const { getUser } = await actual<typeof import("./getUser")>("./getUser");
const { inviteUser } = await actual<typeof import("./inviteUser")>("./inviteUser");
const { searchUser } = await actual<typeof import("./searchUser")>("./searchUser");
const { updateUser } = await actual<typeof import("./updateUser")>("./updateUser");
const { searchPages } = await actual<typeof import("./searchPages")>("./searchPages");
const { searchFileOtherDocuments } = await actual<
  typeof import("./searchFileOtherDocuments")
>("./searchFileOtherDocuments");
const { updateSubscriptionStatus } = await actual<
  typeof import("./updateSubscriptionStatus")
>("./updateSubscriptionStatus");
const { getUserSubscriptionStatus } = await actual<
  typeof import("./getUserSubscriptionStatus")
>("./getUserSubscriptionStatus");

const signedIn = (roles: unknown, id = "u1") => ({
  id,
  publicMetadata: roles === undefined ? {} : { roles },
});

beforeEach(() => vi.clearAllMocks());

const adminActions: [string, () => Promise<unknown>][] = [
  [
    "createNewUser",
    () =>
      createNewUser({
        email: "a@example.com",
        firstName: "A",
        lastName: "B",
        roles: ["user"],
      } as never),
  ],
  ["deleteUser", () => deleteUser("u2")],
  ["getUser", () => getUser("u2")],
  ["inviteUser", () => inviteUser({ email: "a@example.com", roles: ["user"] })],
  ["searchUser", () => searchUser({ searchTerm: "ola" })],
  ["updateUser", () => updateUser({ id: "u2", roles: ["admin"] } as never)],
];

const cmsActions: [string, () => Promise<unknown>][] = [
  ["searchPages", () => searchPages({ searchTerm: "styret" })],
  [
    "searchFileOtherDocuments",
    () => searchFileOtherDocuments({ searchTerm: "vedtekter" }),
  ],
];

const denied: [string, unknown][] = [
  ["signed out", null],
  ["no roles metadata", signedIn(undefined)],
  ["roles is not an array", signedIn("admin")],
];

const expectNothingTouched = () => {
  for (const fn of Object.values(mocks.users)) expect(fn).not.toHaveBeenCalled();
  expect(mocks.invitations.createInvitation).not.toHaveBeenCalled();
  expect(mocks.clientFetch).not.toHaveBeenCalled();
  expect(mocks.sanityFetch).not.toHaveBeenCalled();
  expect(mocks.sanityDelete).not.toHaveBeenCalled();
};

describe.each(adminActions)("%s (admin only)", (_name, call) => {
  it.each([...denied, ["only user and editor roles", signedIn(["user", "editor"])]])(
    "returns 401 without touching Clerk or Sanity when %s",
    async (_label, value) => {
      mocks.currentUser.mockResolvedValue(value);
      await expect(call()).resolves.toMatchObject({ status: 401 });
      expectNothingTouched();
    },
  );
});

describe.each(cmsActions)("%s (editor or admin)", (_name, call) => {
  it.each([...denied, ["only the user role", signedIn(["user"])]])(
    "returns 401 without querying Sanity when %s",
    async (_label, value) => {
      mocks.currentUser.mockResolvedValue(value);
      await expect(call()).resolves.toMatchObject({ status: 401 });
      expectNothingTouched();
    },
  );

  it("runs the search for an editor", async () => {
    mocks.currentUser.mockResolvedValue(signedIn(["user", "editor"]));
    mocks.clientFetch.mockResolvedValue([]);
    await expect(call()).resolves.toMatchObject({ status: 200 });
    expect(mocks.clientFetch).toHaveBeenCalledOnce();
  });
});

describe.each([
  [
    "updateSubscriptionStatus",
    (userId: string) => updateSubscriptionStatus({ userId, isSubscribed: false }),
    () => mocks.users.updateUserMetadata,
  ],
  [
    "getUserSubscriptionStatus",
    (userId: string) => getUserSubscriptionStatus(userId),
    () => mocks.sanityFetch,
  ],
] as const)("%s (own account, or admin)", (_name, call, backend) => {
  beforeEach(() => {
    mocks.users.updateUserMetadata.mockResolvedValue({
      publicMetadata: { emailSubscription: false },
    });
    mocks.sanityFetch.mockResolvedValue({ data: { emailSubscription: true } });
  });

  it.each(denied)("returns 401 when %s", async (_label, value) => {
    mocks.currentUser.mockResolvedValue(value);
    await expect(call("u1")).resolves.toMatchObject({ status: 401 });
    expect(backend()).not.toHaveBeenCalled();
  });

  it("returns 403 when a resident targets someone else", async () => {
    mocks.currentUser.mockResolvedValue(signedIn(["user"], "u1"));
    await expect(call("u2")).resolves.toMatchObject({ status: 403 });
    expect(backend()).not.toHaveBeenCalled();
  });

  it("allows a resident on their own account", async () => {
    mocks.currentUser.mockResolvedValue(signedIn(["user"], "u1"));
    await expect(call("u1")).resolves.toMatchObject({ status: 200 });
  });

  it("allows an admin on someone else's account", async () => {
    mocks.currentUser.mockResolvedValue(signedIn(["user", "admin"], "u1"));
    await expect(call("u2")).resolves.toMatchObject({ status: 200 });
  });
});
