import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { ClerkUserForEmailSubscription } from "./get-clerk-email-subscribers";
import { SES_BCC_RECIPIENT_LIMIT } from "./email-batch";

const mockGetUserList = vi.hoisted(() => vi.fn());
const mockSanityFetch = vi.hoisted(() => vi.fn());
const mockSendMail = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
);
const mockRedisGet = vi.hoisted(() => vi.fn());
const mockRedisSet = vi.hoisted(() => vi.fn());

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      get: mockRedisGet,
      set: mockRedisSet,
    }),
  },
}));

vi.mock("@sanity/client", () => ({
  createClient: () => ({
    fetch: mockSanityFetch,
  }),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn().mockResolvedValue({
    users: {
      getUserList: mockGetUserList,
    },
  }),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: mockSendMail,
    }),
  },
}));

vi.mock("./email-template", () => ({
  emailTemplate: vi.fn(() => "<html>Mock email content</html>"),
}));

const validEnvVars = {
  EMAIL_SECRET_TOKEN: "test-token",
  CRON_SECRET: "cron-test-secret",
  NEXT_PUBLIC_BASE_URL: "https://example.com",
  AWS_SMTP_HOST: "smtp.example.com",
  AWS_SMTP_USER: "user@example.com",
  AWS_SMTP_PASSWORD: "password",
  AWS_SMTP_FROM_EMAIL: "from@example.com",
  SANITY_VIEWER_TOKEN: "sanity-token",
  NEXT_PUBLIC_SANITY_DATASET: "test-dataset",
  NEXT_PUBLIC_SANITY_PROJECT_ID: "test-project-id",
};

function createSubscribedClerkUser(
  id: string,
  email: string,
): ClerkUserForEmailSubscription & { id: string } {
  return {
    id,
    firstName: "Test",
    lastName: "User",
    emailAddresses: [{ id: `email_${id}`, emailAddress: email }],
    publicMetadata: { emailSubscription: true },
  };
}

function mockNoNewSanityContent() {
  mockSanityFetch.mockResolvedValue([]);
}

function mockSanityAuthorEmails(emails: string[]) {
  return emails.map((email) => ({ email }));
}

function mockOneNewMessage(authorEmails: string[] = ["subscriber@example.com"]) {
  mockSanityFetch
    .mockResolvedValueOnce([
      {
        title: "New message",
        _id: "msg-1",
        _createdAt: "2025-01-02T10:00:00.000Z",
        _updatedAt: "2025-01-02T10:00:00.000Z",
        author: { firstName: "Admin", lastName: "User" },
        comments: [],
      },
    ])
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce(mockSanityAuthorEmails(authorEmails));
}

describe("/api/send-email-alerts - integration", () => {
  function authorizedPost(headers: Record<string, string> = {}) {
    return new Request("http://test.local/api/send-email-alerts", {
      method: "POST",
      headers: {
        authorization: `Bearer ${validEnvVars.EMAIL_SECRET_TOKEN}`,
        ...headers,
      },
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    Object.entries(validEnvVars).forEach(([key, value]) => {
      process.env[key] = value;
    });

    mockRedisGet.mockResolvedValue("2025-01-01T00:00:00.000Z");
    mockRedisSet.mockResolvedValue("OK");
    mockGetUserList.mockResolvedValue({ data: [] });
    mockNoNewSanityContent();
  });

  afterEach(() => {
    Object.keys(validEnvVars).forEach((key) => {
      delete process.env[key];
    });
  });

  it("sends email to Clerk subscribers when new content exists", async () => {
    mockGetUserList.mockResolvedValue({
      data: [createSubscribedClerkUser("user_sub", "subscriber@example.com")],
    });
    mockOneNewMessage();

    const { POST } = await import("./route");
    const response = await POST(authorizedPost());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success.message).toBe("Sent email to 1 subscriber");
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        bcc: ["subscriber@example.com"],
      }),
    );
    expect(mockRedisSet).toHaveBeenCalledWith(
      "lastEmailAlertRun",
      expect.any(String),
    );
  });

  it("does not send when Clerk user is subscribed but there is no new content", async () => {
    mockGetUserList.mockResolvedValue({
      data: [createSubscribedClerkUser("user_sub", "subscriber@example.com")],
    });
    mockNoNewSanityContent();

    const { POST } = await import("./route");
    const response = await POST(authorizedPost());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success.message).toBe("No new content since last run.");
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(mockRedisSet).not.toHaveBeenCalled();
  });

  it("does not send when Clerk user is subscribed but has no matching Sanity author email", async () => {
    mockGetUserList.mockResolvedValue({
      data: [createSubscribedClerkUser("user_sub", "orphan@example.com")],
    });
    mockOneNewMessage([]);

    const { POST } = await import("./route");
    const response = await POST(authorizedPost());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success.message).toBe(
      "No subscribers matched a Sanity author email.",
    );
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("does not send when there is new content but no subscribed Clerk users", async () => {
    mockGetUserList.mockResolvedValue({
      data: [
        {
          ...createSubscribedClerkUser("user_unsub", "unsub@example.com"),
          publicMetadata: { emailSubscription: false },
        },
      ],
    });
    mockOneNewMessage();

    const { POST } = await import("./route");
    const response = await POST(authorizedPost());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success.message).toBe(
      "No subscribers matched a Sanity author email.",
    );
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("rejects spoofed vercel-cron user-agent without bearer token", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://test.local/api/send-email-alerts", {
        method: "POST",
        headers: { "user-agent": "vercel-cron/1.0" },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("allows Vercel cron with CRON_SECRET bearer token", async () => {
    mockGetUserList.mockResolvedValue({ data: [] });
    mockNoNewSanityContent();

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://test.local/api/send-email-alerts", {
        method: "POST",
        headers: { authorization: `Bearer ${validEnvVars.CRON_SECRET}` },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success.message).toBe("No new content since last run.");
  });

  it("batches BCC when subscriber count exceeds SES limit", async () => {
    const subscribers = Array.from({ length: SES_BCC_RECIPIENT_LIMIT + 1 }, (_, i) =>
      createSubscribedClerkUser(`user_${i}`, `user${i}@example.com`),
    );
    const authorEmails = subscribers.map(
      (_, i) => `user${i}@example.com`,
    );
    mockGetUserList.mockResolvedValue({ data: subscribers });
    mockOneNewMessage(authorEmails);

    const { POST } = await import("./route");
    const response = await POST(authorizedPost());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success.message).toBe(
      `Sent email to ${SES_BCC_RECIPIENT_LIMIT + 1} subscribers`,
    );
    expect(mockSendMail).toHaveBeenCalledTimes(2);
    expect(mockSendMail.mock.calls[0][0].bcc).toHaveLength(
      SES_BCC_RECIPIENT_LIMIT,
    );
    expect(mockSendMail.mock.calls[1][0].bcc).toHaveLength(1);
  });
});
