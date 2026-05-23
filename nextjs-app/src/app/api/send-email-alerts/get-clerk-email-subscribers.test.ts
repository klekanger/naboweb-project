import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  type ClerkUserForEmailSubscription,
  dedupeEmailSubscribers,
  getClerkEmailSubscribers,
  getSubscriberEmail,
  isEmailSubscriber,
  mapUserToEmailSubscriber,
} from "./get-clerk-email-subscribers";

const mockGetUserList = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn().mockResolvedValue({
    users: {
      getUserList: (...args: unknown[]) => mockGetUserList(...args),
    },
  }),
}));

function createClerkUser(
  overrides: Partial<{
    id: string;
    email: string;
    emailSubscription: boolean;
    firstName: string;
    lastName: string;
  }> & { emailSubscription?: boolean } = {},
): ClerkUserForEmailSubscription {
  const {
    email = "user@example.com",
    firstName = "Ola",
    lastName = "Nordmann",
  } = overrides;

  const publicMetadata =
    "emailSubscription" in overrides
      ? { emailSubscription: overrides.emailSubscription }
      : { emailSubscription: true };

  return {
    firstName,
    lastName,
    emailAddresses: [{ id: "email_id_1", emailAddress: email }],
    publicMetadata,
  };
}

describe("get-clerk-email-subscribers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("isEmailSubscriber returns true only when metadata is explicitly true", () => {
    expect(
      isEmailSubscriber(
        createClerkUser({ emailSubscription: true }),
      ),
    ).toBe(true);
    expect(
      isEmailSubscriber(
        createClerkUser({ emailSubscription: false }),
      ),
    ).toBe(false);
    expect(
      isEmailSubscriber(
        createClerkUser({ emailSubscription: undefined }),
      ),
    ).toBe(false);
  });

  it("getSubscriberEmail uses primary email when configured", () => {
    const email = getSubscriberEmail({
      firstName: "A",
      lastName: "B",
      primaryEmailAddressId: "primary",
      emailAddresses: [
        { id: "secondary", emailAddress: "secondary@example.com" },
        { id: "primary", emailAddress: "primary@example.com" },
      ],
      publicMetadata: { emailSubscription: true },
    });

    expect(email).toBe("primary@example.com");
  });

  it("getSubscriberEmail trims and rejects empty addresses", () => {
    expect(getSubscriberEmail(createClerkUser({ email: " a@b.com " }))).toBe(
      "a@b.com",
    );
    expect(getSubscriberEmail(createClerkUser({ email: "   " }))).toBeNull();
    expect(
      getSubscriberEmail({
        ...createClerkUser(),
        emailAddresses: [],
      }),
    ).toBeNull();
  });

  it("mapUserToEmailSubscriber maps subscribed users with email", () => {
    expect(mapUserToEmailSubscriber(createClerkUser())).toEqual({
      email: "user@example.com",
      firstName: "Ola",
      lastName: "Nordmann",
    });
    expect(
      mapUserToEmailSubscriber(
        createClerkUser({ emailSubscription: false }),
      ),
    ).toBeNull();
  });

  it("dedupeEmailSubscribers removes duplicate emails case-insensitively", () => {
    const deduped = dedupeEmailSubscribers([
      { email: "A@Example.com", firstName: "A", lastName: "1" },
      { email: "a@example.com", firstName: "B", lastName: "2" },
      { email: "other@example.com", firstName: "C", lastName: "3" },
    ]);

    expect(deduped).toHaveLength(2);
    expect(deduped.map((s) => s.email)).toEqual([
      "A@Example.com",
      "other@example.com",
    ]);
  });

  it("getClerkEmailSubscribers paginates and collects subscribed users", async () => {
    const fullPage = Array.from({ length: 100 }, (_, index) =>
      createClerkUser({
        id: `user_${index}`,
        email: `page1-${index}@example.com`,
        emailSubscription: index % 2 === 0,
      }),
    );

    mockGetUserList
      .mockResolvedValueOnce({ data: fullPage })
      .mockResolvedValueOnce({
        data: [
          createClerkUser({
            id: "user_100",
            email: "sub2@example.com",
            emailSubscription: true,
          }),
        ],
      });

    const subscribers = await getClerkEmailSubscribers();

    expect(mockGetUserList).toHaveBeenCalledTimes(2);
    expect(mockGetUserList).toHaveBeenNthCalledWith(1, {
      limit: 100,
      offset: 0,
    });
    expect(mockGetUserList).toHaveBeenNthCalledWith(2, {
      limit: 100,
      offset: 100,
    });
    expect(subscribers.map((s) => s.email)).toContain("sub2@example.com");
    expect(subscribers.length).toBe(51);
  });
});
