import { describe, it, expect, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const commit = vi.fn();
  const set = vi.fn(() => ({ commit }));
  const ifRevisionId = vi.fn(() => ({ set }));
  return {
    currentUser: vi.fn(),
    fetch: vi.fn(),
    del: vi.fn(),
    create: vi.fn(),
    patch: vi.fn(() => ({ ifRevisionId })),
    ifRevisionId,
    set,
    commit,
  };
});
const { currentUser, fetch, del, create, patch, ifRevisionId, set, commit } =
  mocks;

vi.mock("@clerk/nextjs/server", () => ({ currentUser: mocks.currentUser }));
vi.mock("@/sanity/lib/client", () => ({
  clientWithWriteAccess: {
    fetch: mocks.fetch,
    delete: mocks.del,
    create: mocks.create,
    patch: mocks.patch,
  },
}));

import { POST as deleteMessage } from "@/app/api/delete-message/route";
import { POST as updateMessage } from "@/app/api/update-message/route";
import { POST as createMessage } from "@/app/api/create-new-message/route";

const resident = (id: string, roles = ["user"]) => ({
  id,
  publicMetadata: { roles },
});
const admin = () => resident("user_admin", ["user", "admin"]);

const post = (body: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as never;

const block = (text: string) => ({
  _type: "block",
  _key: "b1",
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: "s1", text, marks: [] }],
});

const storedMessage = { _id: "msg-1", _rev: "rev-1", authorId: "user_owner" };

const validInput = {
  title: "Ny tittel",
  bodyText: [block("Hei alle sammen")],
  image: null,
  fromAdmin: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  fetch.mockResolvedValue(storedMessage);
  commit.mockResolvedValue({ _rev: "rev-2" });
  del.mockResolvedValue({ results: [{ id: "msg-1", operation: "delete" }] });
  create.mockResolvedValue({ _id: "new-1", title: "Ny tittel" });
});

describe("/api/delete-message", () => {
  it("rejects a resident deleting someone else's message, even with a spoofed userId", async () => {
    currentUser.mockResolvedValue(resident("user_attacker"));

    const res = await deleteMessage(post({ id: "msg-1", userId: "user_attacker" }));

    expect(res.status).toBe(403);
    expect(del).not.toHaveBeenCalled();
  });

  it("deletes the author's own message at the checked revision, then its draft", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await deleteMessage(post({ id: "msg-1" }));

    expect(res.status).toBe(200);
    expect(del).toHaveBeenNthCalledWith(1, {
      query: expect.stringContaining("_rev == $rev"),
      params: { id: "msg-1", rev: "rev-1" },
    });
    expect(del).toHaveBeenNthCalledWith(2, "drafts.msg-1");
  });

  it("returns 409 and leaves the draft alone when the message changed after the check", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));
    del.mockResolvedValueOnce({ results: [] });

    const res = await deleteMessage(post({ id: "msg-1" }));

    expect(res.status).toBe(409);
    expect(del).toHaveBeenCalledTimes(1);
  });

  it("lets an admin delete any message", async () => {
    currentUser.mockResolvedValue(admin());

    const res = await deleteMessage(post({ id: "msg-1" }));

    expect(res.status).toBe(200);
  });

  it("returns 404 and deletes nothing when the id is not a published message", async () => {
    currentUser.mockResolvedValue(admin());
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
    currentUser.mockResolvedValue(admin());

    const res = await deleteMessage(post({ id: { $ne: "" } }));

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("/api/update-message", () => {
  it("rejects a resident editing someone else's message with a spoofed isAdmin and userId", async () => {
    currentUser.mockResolvedValue(resident("user_attacker"));

    const res = await updateMessage(
      post({ _id: "msg-1", ...validInput, isAdmin: true, userId: "user_owner" }),
    );

    expect(res.status).toBe(403);
    expect(patch).not.toHaveBeenCalled();
  });

  it("patches only editable fields at the checked revision and never touches the author", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await updateMessage(
      post({ _id: "msg-1", ...validInput, fromAdmin: true, userId: "user_other" }),
    );

    expect(res.status).toBe(200);
    expect(patch).toHaveBeenCalledWith("msg-1");
    expect(ifRevisionId).toHaveBeenCalledWith("rev-1");
    expect(set).toHaveBeenCalledWith({
      title: "Ny tittel",
      bodyText: validInput.bodyText,
    });
  });

  it("returns 409 when the message changed after the check", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));
    commit.mockRejectedValue(Object.assign(new Error("conflict"), { statusCode: 409 }));

    const res = await updateMessage(post({ _id: "msg-1", ...validInput }));

    expect(res.status).toBe(409);
  });

  it("lets an admin edit any message and set fromAdmin", async () => {
    currentUser.mockResolvedValue(admin());

    const res = await updateMessage(
      post({
        _id: "msg-1",
        ...validInput,
        fromAdmin: true,
        image: "image-abc123-800x600-jpg",
      }),
    );

    expect(res.status).toBe(200);
    expect(set).toHaveBeenCalledWith({
      title: "Ny tittel",
      bodyText: validInput.bodyText,
      fromAdmin: true,
      messageImage: {
        _type: "image",
        asset: { _type: "reference", _ref: "image-abc123-800x600-jpg" },
      },
    });
  });

  it("returns 404 when the id is not a published message", async () => {
    currentUser.mockResolvedValue(admin());
    fetch.mockResolvedValue(null);

    const res = await updateMessage(post({ _id: "settings", ...validInput }));

    expect(res.status).toBe(404);
    expect(patch).not.toHaveBeenCalled();
  });

  it("rejects non-block content in bodyText", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await updateMessage(
      post({ _id: "msg-1", ...validInput, bodyText: [{ _type: "script", _key: "x" }] }),
    );

    expect(res.status).toBe(400);
    expect(patch).not.toHaveBeenCalled();
  });
});

describe("/api/create-new-message", () => {
  it("stores the signed-in user as author, ignoring userId from the request", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await createMessage(post({ ...validInput, userId: "user_victim" }));

    expect(res.status).toBe(200);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        author: { _type: "reference", _ref: "user_owner" },
      }),
    );
  });

  it("does not let a non-admin post as the board", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    await createMessage(post({ ...validInput, fromAdmin: true }));

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ fromAdmin: false }),
    );
  });

  it("lets an admin post as the board", async () => {
    currentUser.mockResolvedValue(admin());

    await createMessage(post({ ...validInput, fromAdmin: true }));

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ fromAdmin: true }),
    );
  });

  it("requires the user role", async () => {
    currentUser.mockResolvedValue(resident("user_owner", []));

    const res = await createMessage(post(validInput));

    expect(res.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it("drops unknown fields from blocks and spans", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));
    const bodyText = [
      { ...block("Hei"), extra: "x", children: [{ _type: "span", _key: "s1", text: "Hei", marks: [], evil: 1 }] },
    ];

    await createMessage(post({ ...validInput, bodyText }));

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ bodyText: [block("Hei")] }),
    );
  });
});
