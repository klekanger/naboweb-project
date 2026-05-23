import { describe, it, expect } from "vitest";
import {
  buildSanityAuthorEmailSet,
  filterSubscribersWithSanityAuthor,
  normalizeSubscriberEmail,
} from "./filter-subscribers-with-sanity-author";
import type { EmailSubscriber } from "./get-clerk-email-subscribers";

describe("filter-subscribers-with-sanity-author", () => {
  it("normalizeSubscriberEmail trims and lowercases", () => {
    expect(normalizeSubscriberEmail("  User@Example.COM ")).toBe(
      "user@example.com",
    );
  });

  it("buildSanityAuthorEmailSet skips empty emails", () => {
    const set = buildSanityAuthorEmailSet([
      { email: "a@example.com" },
      { email: "" },
      { email: null },
      { email: "  B@Example.com  " },
    ]);

    expect(set.has("a@example.com")).toBe(true);
    expect(set.has("b@example.com")).toBe(true);
    expect(set.size).toBe(2);
  });

  it("filterSubscribersWithSanityAuthor keeps only subscribers with a Sanity author email", () => {
    const subscribers: EmailSubscriber[] = [
      { email: "Active@Example.com", firstName: "A", lastName: "1" },
      { email: "orphan@example.com", firstName: "B", lastName: "2" },
    ];
    const sanityEmails = buildSanityAuthorEmailSet([
      { email: "active@example.com" },
    ]);

    const filtered = filterSubscribersWithSanityAuthor(
      subscribers,
      sanityEmails,
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].email).toBe("Active@Example.com");
  });
});
