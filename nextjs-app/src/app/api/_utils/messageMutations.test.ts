import { describe, it, expect, beforeEach, vi } from "vitest";

const { currentUser, fetch, del, patch, set, commit } = vi.hoisted(() => {
  const commit = vi.fn();
  const set = vi.fn(() => ({ commit }));
  return {
    currentUser: vi.fn(),
    fetch: vi.fn(),
    del: vi.fn(),
    patch: vi.fn(() => ({ set })),
    set,
    commit,
  };
});

vi.mock("@clerk/nextjs/server", () => ({ currentUser }));
vi.mock("@/sanity/lib/client", () => ({
  clientWithWriteAccess: { fetch, delete: del, patch },
}));

import { POST as deleteMessage } from "@/app/api/delete-message/route";
import { POST as updateMessage } from "@/app/api/update-message/route";

const resident = (id: string, roles = ["user"]) => ({
  id,
  publicMetadata: { roles },
});

const post = (body: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const storedMessage = { _id: "msg-1", authorId: "user_owner", fromAdmin: false };

const validUpdate = {
  _id: "msg-1",
  title: "Ny tittel",
  bodyText: [],
  image: null,
  fromAdmin: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  fetch.mockResolvedValue(storedMessage);
  commit.mockResolvedValue({ _rev: "rev-2" });
});

describe("/api/delete-message", () => {
  it("rejects a resident deleting someone else's message, even with a spoofed userId", async () => {
    currentUser.mockResolvedValue(resident("user_attacker"));

    const res = await deleteMessage(post({ id: "msg-1", userId: "user_attacker" }));

    expect(res.status).toBe(403);
    expect(del).not.toHaveBeenCalled();
  });

  it("lets the author delete their own message", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await deleteMessage(post({ id: "msg-1" }));

    expect(res.status).toBe(200);
    expect(del).toHaveBeenCalledWith("msg-1");
  });

  it("lets an admin delete any message", async () => {
    currentUser.mockResolvedValue(resident("user_admin", ["user", "admin"]));

    const res = await deleteMessage(post({ id: "msg-1" }));

    expect(res.status).toBe(200);
    expect(del).toHaveBeenCalledWith("msg-1");
  });

  it("returns 404 and deletes nothing when the id is not a published message", async () => {
    currentUser.mockResolvedValue(resident("user_admin", ["user", "admin"]));
    fetch.mockResolvedValue(null);

    const res = await deleteMessage(post({ id: "settings" }));

    expect(res.status).toBe(404);
    expect(del).not.toHaveBeenCalled();
  });

  it("requires the user role", async () => {
    currentUser.mockResolvedValue(resident("user_owner", []));

    const res = await deleteMessage(post({ id: "msg-1" }));

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a non-string id", async () => {
    currentUser.mockResolvedValue(resident("user_admin", ["user", "admin"]));

    const res = await deleteMessage(post({ id: { $ne: "" } }));

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("/api/update-message", () => {
  it("rejects a resident editing someone else's message with a spoofed isAdmin and userId", async () => {
    currentUser.mockResolvedValue(resident("user_attacker"));

    const res = await updateMessage(
      post({ ...validUpdate, isAdmin: true, userId: "user_owner" }) as never,
    );

    expect(res.status).toBe(403);
    expect(patch).not.toHaveBeenCalled();
  });

  it("patches only editable fields for the author and never touches the author", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await updateMessage(
      post({ ...validUpdate, fromAdmin: true, userId: "user_other" }) as never,
    );

    expect(res.status).toBe(200);
    expect(patch).toHaveBeenCalledWith("msg-1");
    expect(set).toHaveBeenCalledWith({ title: "Ny tittel", bodyText: [] });
  });

  it("lets an admin edit any message and set fromAdmin", async () => {
    currentUser.mockResolvedValue(resident("user_admin", ["user", "admin"]));

    const res = await updateMessage(
      post({ ...validUpdate, fromAdmin: true, image: "image-abc" }) as never,
    );

    expect(res.status).toBe(200);
    expect(set).toHaveBeenCalledWith({
      title: "Ny tittel",
      bodyText: [],
      fromAdmin: true,
      messageImage: {
        _type: "image",
        asset: { _type: "reference", _ref: "image-abc" },
      },
    });
  });

  it("returns 404 when the id is not a published message", async () => {
    currentUser.mockResolvedValue(resident("user_admin", ["user", "admin"]));
    fetch.mockResolvedValue(null);

    const res = await updateMessage(post({ ...validUpdate, _id: "settings" }) as never);

    expect(res.status).toBe(404);
    expect(patch).not.toHaveBeenCalled();
  });

  it("rejects a non-string title", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await updateMessage(post({ ...validUpdate, title: { a: 1 } }) as never);

    expect(res.status).toBe(400);
    expect(patch).not.toHaveBeenCalled();
  });
});
