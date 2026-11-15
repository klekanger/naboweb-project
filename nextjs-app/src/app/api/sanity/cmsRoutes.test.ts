import { describe, it, expect, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const commit = vi.fn();
  const chain = {
    set: vi.fn(() => chain),
    ifRevisionId: vi.fn(() => chain),
    commit,
  };
  return {
    currentUser: vi.fn(),
    fetch: vi.fn(),
    create: vi.fn(),
    del: vi.fn(),
    patch: vi.fn(() => chain),
    revalidateTag: vi.fn(),
    chain,
    commit,
  };
});
const { currentUser, fetch, create, del, patch, revalidateTag, chain, commit } =
  mocks;

vi.mock("@clerk/nextjs/server", () => ({ currentUser: mocks.currentUser }));
vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag }));
vi.mock("@/sanity/lib/client", () => ({
  client: { fetch: vi.fn() },
  clientWithWriteAccess: {
    fetch: mocks.fetch,
    create: mocks.create,
    delete: mocks.del,
    patch: mocks.patch,
  },
}));

import * as documents from "@/app/api/sanity/documents/route";
import * as minutes from "@/app/api/sanity/meeting-minutes/route";
import * as blog from "@/app/api/sanity/blog/route";
import * as documentMenu from "@/app/api/sanity/document-menu/route";

const withRoles = (roles: string[], id = "user_editor") => ({
  id,
  publicMetadata: { roles },
});
const editor = () => withRoles(["user", "editor"]);
const admin = () => withRoles(["user", "admin"], "user_admin");

const req = (body: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as never;

const block = {
  _type: "block",
  _key: "b1",
  children: [{ _type: "span", _key: "s1", text: "Hei", marks: [] }],
  markDefs: [],
};

const blogPayload = {
  _id: "post-1",
  title: "Dugnad",
  slug: "dugnad-2026",
  excerpt: [block],
  bodyText: [block],
  privatePost: false,
  authorIds: ["user_editor"],
};

beforeEach(() => {
  vi.clearAllMocks();
  currentUser.mockResolvedValue(editor());
  fetch.mockResolvedValue({ _id: "doc-1", _rev: "rev-1" });
  commit.mockResolvedValue({ _id: "doc-1" });
  create.mockResolvedValue({ _id: "new-1" });
  del.mockResolvedValue({ results: [{ id: "doc-1", operation: "delete" }] });
});

describe("CMS routes: _id handling (leads 9 and 10)", () => {
  it.each([
    ["an object (query selector)", { query: "*[_type=='message']" }],
    ["an array", ["a", "b"]],
    ["a draft id", "drafts.doc-1"],
    ["a version id", "versions.r1.doc-1"],
  ])("rejects _id given as %s before any Sanity call", async (_label, _id) => {
    for (const handler of [documents.PATCH, documents.DELETE, minutes.PATCH, minutes.DELETE]) {
      const res = await handler(req({ _id, title: "x" }));
      expect(res.status).toBe(400);
    }
    for (const handler of [blog.PATCH, blog.DELETE]) {
      const res = await handler(req({ ...blogPayload, _id }));
      expect(res.status).toBe(400);
    }
    expect(fetch).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
  });

  it("binds the documents route to fileOtherDocuments and returns 404 for other types", async () => {
    fetch.mockResolvedValue(null);

    const res = await documents.DELETE(req({ _id: "settings" }));

    expect(res.status).toBe(404);
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      { type: "fileOtherDocuments", id: "settings" },
      { perspective: "published" },
    );
    expect(del).not.toHaveBeenCalled();
  });

  it("binds the meeting-minutes route to fileMeetingMinutes", async () => {
    fetch.mockResolvedValue(null);

    const res = await minutes.PATCH(req({ _id: "message-1", title: "x" }));

    expect(res.status).toBe(404);
    expect(fetch.mock.calls[0][1]).toEqual({ type: "fileMeetingMinutes", id: "message-1" });
    expect(patch).not.toHaveBeenCalled();
  });

  it("deletes at the checked type and revision, then the draft", async () => {
    const res = await documents.DELETE(req({ _id: "doc-1" }));

    expect(res.status).toBe(200);
    expect(del).toHaveBeenNthCalledWith(1, {
      query: expect.stringContaining("_rev == $rev"),
      params: { type: "fileOtherDocuments", id: "doc-1", rev: "rev-1" },
    });
    expect(del).toHaveBeenNthCalledWith(2, "drafts.doc-1");
  });

  it("returns 409 when the document changed before delete", async () => {
    del.mockResolvedValueOnce({ results: [] });

    const res = await minutes.DELETE(req({ _id: "doc-1" }));

    expect(res.status).toBe(409);
    expect(del).toHaveBeenCalledTimes(1);
  });

  it("patches with ifRevisionId and only the fields sent", async () => {
    const res = await documents.PATCH(
      req({ _id: "doc-1", title: "Vedtekter", description: "Oppdatert" }),
    );

    expect(res.status).toBe(200);
    expect(chain.ifRevisionId).toHaveBeenCalledWith("rev-1");
    expect(chain.set).toHaveBeenCalledWith({ title: "Vedtekter", description: "Oppdatert" });
  });

  it("requires the editor or admin role", async () => {
    currentUser.mockResolvedValue(withRoles(["user"]));

    const res = await documents.DELETE(req({ _id: "doc-1" }));

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("CMS routes: input validation", () => {
  it("rejects a non-file asset id for documents", async () => {
    const res = await documents.POST(req({ title: "x", assetId: "image-abc-10x10-png" }));
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("accepts a file asset id for documents", async () => {
    const res = await documents.POST(req({ title: "Vedtekter", assetId: "file-abc123-pdf" }));
    expect(res.status).toBe(200);
  });

  it("rejects meeting minutes with non-file assets or a bad date", async () => {
    expect((await minutes.POST(req({ title: "x", assetIds: [{ a: 1 }] }))).status).toBe(400);
    expect(
      (await minutes.POST(req({ title: "x", assetIds: ["file-a-pdf"], meetingDate: "i går" }))).status,
    ).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a blog slug that is not URL-safe", async () => {
    const res = await blog.POST(req({ ...blogPayload, slug: 'x"><img src=x>' }));
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("/api/sanity/blog privatePost (lead 10)", () => {
  const existing = {
    _id: "post-1",
    _rev: "rev-1",
    privatePost: true,
    slug: "dugnad-2026",
    authorIds: ["user_editor"],
  };

  it("keeps the stored privatePost for editors, read with the write client", async () => {
    fetch.mockResolvedValue(existing);

    const res = await blog.PATCH(req({ ...blogPayload, privatePost: false }));

    expect(res.status).toBe(200);
    expect(fetch.mock.calls[0][2]).toEqual({ perspective: "published" });
    expect(chain.ifRevisionId).toHaveBeenCalledWith("rev-1");
    expect(chain.set).toHaveBeenCalledWith(expect.objectContaining({ privatePost: true }));
  });

  it("lets admins change privatePost", async () => {
    currentUser.mockResolvedValue(admin());
    fetch.mockResolvedValue(existing);

    await blog.PATCH(req({ ...blogPayload, privatePost: false, authorIds: ["user_editor"] }));

    expect(chain.set).toHaveBeenCalledWith(expect.objectContaining({ privatePost: false }));
  });

  it("returns 404 for an id that is not a blog post", async () => {
    fetch.mockResolvedValue(null);

    const res = await blog.PATCH(req({ ...blogPayload, _id: "settings" }));

    expect(res.status).toBe(404);
    expect(patch).not.toHaveBeenCalled();
  });

  it("revalidates the stored slug on delete, not one from the request", async () => {
    fetch.mockResolvedValue(existing);

    const res = await blog.DELETE(req({ _id: "post-1", slug: "something-else" }));

    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("blogPost:dugnad-2026", "max");
    expect(revalidateTag).not.toHaveBeenCalledWith("blogPost:something-else", "max");
  });
});

describe("/api/sanity/document-menu", () => {
  const buttons = [1, 2, 3, 4].map((n) => ({ text: `Knapp ${n}`, fileId: `file-doc-${n}` }));

  it("only patches the documentMenu singleton", async () => {
    fetch.mockResolvedValueOnce(null);

    const res = await documentMenu.PATCH(req({ documentMenuId: "settings", buttons }));

    expect(res.status).toBe(404);
    expect(fetch.mock.calls[0][1]).toEqual({ type: "documentMenu", id: "settings" });
    expect(patch).not.toHaveBeenCalled();
  });

  it("rejects buttons that point to something other than an existing document", async () => {
    fetch.mockResolvedValueOnce({ _id: "documentMenu", _rev: "rev-1" }).mockResolvedValueOnce(3);

    const res = await documentMenu.PATCH(req({ documentMenuId: "documentMenu", buttons }));

    expect(res.status).toBe(400);
    expect(patch).not.toHaveBeenCalled();
  });

  it("patches the menu at the checked revision", async () => {
    fetch.mockResolvedValueOnce({ _id: "documentMenu", _rev: "rev-1" }).mockResolvedValueOnce(4);

    const res = await documentMenu.PATCH(req({ documentMenuId: "documentMenu", buttons }));

    expect(res.status).toBe(200);
    expect(chain.ifRevisionId).toHaveBeenCalledWith("rev-1");
  });
});
