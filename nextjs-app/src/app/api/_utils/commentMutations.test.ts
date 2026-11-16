import { describe, it, expect, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const commit = vi.fn();
  const chain = {
    set: vi.fn(() => chain),
    unset: vi.fn(() => chain),
    setIfMissing: vi.fn(() => chain),
    append: vi.fn(() => chain),
    ifRevisionId: vi.fn(() => chain),
    commit,
  };
  return {
    currentUser: vi.fn(),
    fetch: vi.fn(),
    patch: vi.fn(() => chain),
    chain,
    commit,
  };
});
const { currentUser, fetch, patch, chain, commit } = mocks;

vi.mock("@clerk/nextjs/server", () => ({ currentUser: mocks.currentUser }));
vi.mock("@/sanity/lib/client", () => ({
  clientWithWriteAccess: { fetch: mocks.fetch, patch: mocks.patch },
}));

import { POST as deleteComment } from "@/app/api/delete-comment/route";
import { POST as editComment } from "@/app/api/edit-comment/route";
import { POST as createComment } from "@/app/api/create-comment/route";

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

const storedComment = {
  _id: "msg-1",
  _rev: "rev-1",
  comment: { _key: "c1", authorId: "user_owner" },
};

const edit = {
  messageId: "msg-1",
  commentKey: "c1",
  title: "Oppdatert",
  bodyText: "Ny tekst",
};

beforeEach(() => {
  vi.clearAllMocks();
  fetch.mockResolvedValue(storedComment);
  commit.mockResolvedValue({ _id: "msg-1" });
});

describe("/api/delete-comment", () => {
  it("rejects deleting another resident's comment, even with a spoofed userId", async () => {
    currentUser.mockResolvedValue(resident("user_attacker"));

    const res = await deleteComment(
      post({ messageId: "msg-1", commentKey: "c1", userId: "user_attacker" }),
    );

    expect(res.status).toBe(403);
    expect(patch).not.toHaveBeenCalled();
  });

  it("lets the author delete their comment at the checked revision", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await deleteComment(post({ messageId: "msg-1", commentKey: "c1" }));

    expect(res.status).toBe(200);
    expect(chain.ifRevisionId).toHaveBeenCalledWith("rev-1");
    expect(chain.unset).toHaveBeenCalledWith(['comments[_key=="c1"]']);
  });

  it("lets an admin delete any comment", async () => {
    currentUser.mockResolvedValue(admin());

    const res = await deleteComment(post({ messageId: "msg-1", commentKey: "c1" }));

    expect(res.status).toBe(200);
  });

  it("rejects a commentKey that would change the patch path", async () => {
    currentUser.mockResolvedValue(admin());

    const res = await deleteComment(
      post({ messageId: "msg-1", commentKey: 'x" || _key != "' }),
    );

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
  });

  it("returns 404 when the comment is not on a published message", async () => {
    currentUser.mockResolvedValue(admin());
    fetch.mockResolvedValue({ _id: "msg-1", _rev: "rev-1", comment: null });

    const res = await deleteComment(post({ messageId: "msg-1", commentKey: "c9" }));

    expect(res.status).toBe(404);
    expect(patch).not.toHaveBeenCalled();
  });

  it("requires the user role", async () => {
    currentUser.mockResolvedValue(resident("user_owner", []));

    const res = await deleteComment(post({ messageId: "msg-1", commentKey: "c1" }));

    expect(res.status).toBe(401);
  });

  it("returns 409 when the message changed after the check", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));
    commit.mockRejectedValue(Object.assign(new Error("conflict"), { statusCode: 409 }));

    const res = await deleteComment(post({ messageId: "msg-1", commentKey: "c1" }));

    expect(res.status).toBe(409);
  });
});

describe("/api/edit-comment", () => {
  it("rejects rewriting another resident's comment, even with a spoofed userId", async () => {
    currentUser.mockResolvedValue(resident("user_attacker"));

    const res = await editComment(post({ ...edit, userId: "user_attacker" }));

    expect(res.status).toBe(403);
    expect(patch).not.toHaveBeenCalled();
  });

  it("does not let an admin rewrite someone else's comment", async () => {
    currentUser.mockResolvedValue(admin());

    const res = await editComment(post(edit));

    expect(res.status).toBe(403);
  });

  it("lets the author edit their comment at the checked revision", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await editComment(post(edit));

    expect(res.status).toBe(200);
    expect(chain.ifRevisionId).toHaveBeenCalledWith("rev-1");
    expect(chain.set).toHaveBeenCalledWith({
      'comments[_key=="c1"].commentTitle': "Oppdatert",
      'comments[_key=="c1"].commentText': "Ny tekst",
    });
  });

  it("rejects a commentKey that would change the patch path", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await editComment(post({ ...edit, commentKey: 'c1"].x' }));

    expect(res.status).toBe(400);
    expect(patch).not.toHaveBeenCalled();
  });

  it("rejects non-string comment text", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await editComment(post({ ...edit, bodyText: { a: 1 } }));

    expect(res.status).toBe(400);
    expect(patch).not.toHaveBeenCalled();
  });
});

describe("/api/create-comment", () => {
  const create = { _id: "msg-1", title: "Hei", bodyText: "En kommentar" };

  it("stores the signed-in user as author, ignoring userId from the request", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await createComment(post({ ...create, userId: "user_victim" }));

    expect(res.status).toBe(200);
    expect(chain.append).toHaveBeenCalledWith("comments", [
      expect.objectContaining({
        commentAuthor: { _type: "reference", _ref: "user_owner" },
      }),
    ]);
  });

  it("refuses to comment on a document that is not a published message", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));
    fetch.mockResolvedValue(null);

    const res = await createComment(post({ ...create, _id: "settings" }));

    expect(res.status).toBe(404);
    expect(patch).not.toHaveBeenCalled();
  });

  it("rejects an over-long comment", async () => {
    currentUser.mockResolvedValue(resident("user_owner"));

    const res = await createComment(post({ ...create, bodyText: "x".repeat(5001) }));

    expect(res.status).toBe(400);
  });
});
