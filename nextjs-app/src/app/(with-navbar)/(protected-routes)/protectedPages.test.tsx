// Lead 4: protected pages must check the role themselves, before fetching
// data, because Next.js can serve a page without running its layout.
import { describe, it, expect, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn(),
  sanityFetch: vi.fn(),
  clientFetch: vi.fn(),
  redirect: vi.fn((to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  }),
}));

vi.mock("@clerk/nextjs/server", () => ({ currentUser: mocks.currentUser }));
vi.mock("@/sanity/lib/live", () => ({ sanityFetch: mocks.sanityFetch }));
vi.mock("@/sanity/lib/client", () => ({
  client: { fetch: mocks.clientFetch },
}));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("@/components/NotLoggedIn", () => ({ default: () => "not-logged-in" }));
// Page components are not under test; stub them to keep imports light.
vi.mock("@/components/Article", () => ({ default: () => null }));
vi.mock("@/components/document-library/MeetingMinutesDetails", () => ({ default: () => null }));
vi.mock("@/components/pages/messageBoard/MessagePage", () => ({ default: () => null }));
vi.mock("@/components/document-library/DocumentCollectionPage", () => ({ default: () => null }));
vi.mock("@/components/document-library/DocumentTable", () => ({ default: () => null }));
vi.mock("@/components/document-library/MeetingMinutes", () => ({ default: () => null }));
vi.mock("@/components/admin/DocumentMenuEditor", () => ({ default: () => null }));
vi.mock("@/components/admin/AdminEditPageShell", () => ({ default: () => null }));
vi.mock("@/components/admin/WebsiteSettingsEditor", () => ({ default: () => null }));

import NotLoggedIn from "@/components/NotLoggedIn";
import PrivateBlogRoute from "./information/post/[slug]/page";
import MeetingMinutesRoute from "./information/referater/[meeting]/page";
import MessageRoute from "./messageboard/[id]/page";
import DocumentsIndex from "./information/dokumenter/page";
import MinutesIndex from "./information/referater/page";
import DocumentMenuPage from "./admin/document-menu/page";
import WebsiteSettingsPage from "./admin/website-settings/page";
import * as privatePostModule from "./information/post/[slug]/page";
import * as meetingModule from "./information/referater/[meeting]/page";
import * as messageModule from "./messageboard/[id]/page";

const withRoles = (roles: string[]) => ({ id: "u1", publicMetadata: { roles } });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resident pages", () => {
  const residentPages: [string, () => Promise<unknown>][] = [
    ["private post", () => PrivateBlogRoute({ params: Promise.resolve({ slug: "s" }) })],
    ["meeting minutes", () => MeetingMinutesRoute({ params: Promise.resolve({ meeting: "m" }) })],
    ["message", () => MessageRoute({ params: Promise.resolve({ id: "m" }) })],
    ["documents index", () => DocumentsIndex()],
    ["minutes index", () => MinutesIndex()],
  ];

  it.each(residentPages)(
    "%s: renders NotLoggedIn and fetches nothing without the user role",
    async (_label, render) => {
      mocks.currentUser.mockResolvedValue(withRoles([]));

      const result = (await render()) as { type?: unknown };

      expect(result.type).toBe(NotLoggedIn);
      expect(mocks.sanityFetch).not.toHaveBeenCalled();
    },
  );

  it("fetches data for a resident", async () => {
    mocks.currentUser.mockResolvedValue(withRoles(["user"]));
    mocks.sanityFetch.mockResolvedValue({ data: [] });

    await DocumentsIndex();

    expect(mocks.sanityFetch).toHaveBeenCalled();
  });

  it("no longer prerenders protected dynamic routes", () => {
    expect("generateStaticParams" in privatePostModule).toBe(false);
    expect("generateStaticParams" in meetingModule).toBe(false);
    expect("generateStaticParams" in messageModule).toBe(false);
  });
});

describe("admin pages", () => {
  it.each([
    ["document menu", () => DocumentMenuPage()],
    ["website settings", () => WebsiteSettingsPage()],
  ])("%s: redirects a resident without fetching", async (_label, render) => {
    mocks.currentUser.mockResolvedValue(withRoles(["user"]));

    await expect(render()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(mocks.clientFetch).not.toHaveBeenCalled();
  });
});
