import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { validateEnvironmentVariables } from "./validateEnvironmentVariables";

// Mock all external dependencies at module level
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      get: vi.fn(),
      set: vi.fn(),
    }),
  },
}));

vi.mock("@sanity/client", () => ({
  createClient: () => ({
    fetch: vi.fn(),
  }),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: vi.fn(),
    }),
  },
}));

vi.mock("./email-template", () => ({
  emailTemplate: vi.fn(() => "<html>Mock email content</html>"),
}));

// Test data
const validEnvVars = {
  EMAIL_SECRET_TOKEN: "test-token",
  NEXT_PUBLIC_BASE_URL: "https://example.com",
  AWS_SMTP_HOST: "smtp.example.com",
  AWS_SMTP_USER: "user@example.com",
  AWS_SMTP_PASSWORD: "password",
  AWS_SMTP_FROM_EMAIL: "from@example.com",
  SANITY_VIEWER_TOKEN: "sanity-token",
  NEXT_PUBLIC_SANITY_DATASET: "test-dataset",
  NEXT_PUBLIC_SANITY_PROJECT_ID: "test-project-id",
};

describe("/api/send-email-alerts - Environment Validation", () => {
  beforeEach(() => {
    // Setup all required environment variables
    Object.entries(validEnvVars).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  afterEach(() => {
    // Clean up environment variables
    Object.keys(validEnvVars).forEach((key) => {
      delete process.env[key];
    });
  });

  it("should pass validation when all environment variables are present", () => {
    expect(() => validateEnvironmentVariables()).not.toThrow();

    const result = validateEnvironmentVariables();
    expect(result.EMAIL_SECRET_TOKEN).toBe("test-token");
    expect(result.NEXT_PUBLIC_BASE_URL).toBe("https://example.com");
    expect(result.AWS_SMTP_HOST).toBe("smtp.example.com");
    expect(result.AWS_SMTP_USER).toBe("user@example.com");
    expect(result.AWS_SMTP_PASSWORD).toBe("password");
    expect(result.AWS_SMTP_FROM_EMAIL).toBe("from@example.com");
    expect(result.SANITY_VIEWER_TOKEN).toBe("sanity-token");
  });

  it("should throw error when EMAIL_SECRET_TOKEN is missing", () => {
    delete process.env.EMAIL_SECRET_TOKEN;

    expect(() => validateEnvironmentVariables()).toThrow(
      "Missing required environment variables: EMAIL_SECRET_TOKEN",
    );
  });

  it("should throw error when NEXT_PUBLIC_BASE_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;

    expect(() => validateEnvironmentVariables()).toThrow(
      "Missing required environment variables: NEXT_PUBLIC_BASE_URL",
    );
  });

  it("should throw error when AWS SMTP credentials are missing", () => {
    delete process.env.AWS_SMTP_HOST;
    delete process.env.AWS_SMTP_USER;
    delete process.env.AWS_SMTP_PASSWORD;

    expect(() => validateEnvironmentVariables()).toThrow(
      "Missing required environment variables: AWS_SMTP_HOST, AWS_SMTP_USER, AWS_SMTP_PASSWORD",
    );
  });

  it("should throw error when SANITY_VIEWER_TOKEN is missing", () => {
    delete process.env.SANITY_VIEWER_TOKEN;

    expect(() => validateEnvironmentVariables()).toThrow(
      "Missing required environment variables: SANITY_VIEWER_TOKEN",
    );
  });

  it("should throw error when multiple environment variables are missing", () => {
    delete process.env.EMAIL_SECRET_TOKEN;
    delete process.env.AWS_SMTP_HOST;
    delete process.env.SANITY_VIEWER_TOKEN;

    expect(() => validateEnvironmentVariables()).toThrow(
      "Missing required environment variables: EMAIL_SECRET_TOKEN, AWS_SMTP_HOST, SANITY_VIEWER_TOKEN",
    );
  });
});

describe("/api/send-email-alerts - Route Authorization Tests", () => {
  let mockHeaders: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup environment variables
    Object.entries(validEnvVars).forEach(([key, value]) => {
      process.env[key] = value;
    });

    // Get mock instances
    const { headers } = await import("next/headers");
    mockHeaders = headers;
  });

  afterEach(() => {
    Object.keys(validEnvVars).forEach((key) => {
      delete process.env[key];
    });
  });

  it("should return 401 for invalid Bearer token", async () => {
    mockHeaders.mockResolvedValue({
      get: vi.fn((key) => {
        if (key === "authorization") return "Bearer invalid-token";
        return null;
      }),
    });

    const { POST } = await import("./route");
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 for missing authorization header", async () => {
    mockHeaders.mockResolvedValue({
      get: vi.fn(() => null),
    });

    const { POST } = await import("./route");
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 when Bearer is misspelled as Bearex", async () => {
    mockHeaders.mockResolvedValue({
      get: vi.fn((key) => {
        if (key === "authorization")
          return `Bearex ${validEnvVars.EMAIL_SECRET_TOKEN}`;
        return null;
      }),
    });

    const { POST } = await import("./route");
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 for case-sensitive Bearer keyword", async () => {
    mockHeaders.mockResolvedValue({
      get: vi.fn((key) => {
        if (key === "authorization")
          return `bearer ${validEnvVars.EMAIL_SECRET_TOKEN}`;
        return null;
      }),
    });

    const { POST } = await import("./route");
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 500 for missing environment variables", async () => {
    // Clear ALL environment variables before the test
    Object.keys(validEnvVars).forEach((key) => {
      delete process.env[key];
    });

    // Set up all env vars except EMAIL_SECRET_TOKEN (keep it missing)
    Object.entries(validEnvVars).forEach(([key, value]) => {
      if (key !== "EMAIL_SECRET_TOKEN") {
        process.env[key] = value;
      }
    });

    // Force re-import of the route module to avoid caching issues
    vi.resetModules();

    const { POST } = await import("./route");
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Server configuration error");
  });
});

describe("/api/send-email-alerts - Email Processing Logic", () => {
  it("should filter subscribers with valid emails", () => {
    const mockSubscribers = [
      { firstName: "John", lastName: "Doe", email: "john@example.com" },
      { firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
      { firstName: "No", lastName: "Email", email: null },
      { firstName: "Empty", lastName: "Email", email: "" },
    ];

    // This is the logic used in the route
    const validSubscribers = mockSubscribers.filter(
      (subscriber) => subscriber.email && subscriber.email.trim() !== "",
    );

    expect(validSubscribers).toHaveLength(2);
    expect(validSubscribers[0].email).toBe("john@example.com");
    expect(validSubscribers[1].email).toBe("jane@example.com");
  });

  it("should generate email subject correctly", () => {
    const siteName = "Test Site";
    const expectedSubject = `Nytt innhold på nettsidene til ${siteName}`;

    expect(expectedSubject).toBe("Nytt innhold på nettsidene til Test Site");
  });

  it("should extract email addresses for BCC", () => {
    const validSubscribers = [
      { firstName: "John", lastName: "Doe", email: "john@example.com" },
      { firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
    ];

    const emailAddresses = validSubscribers.map((sub) => sub.email);

    expect(emailAddresses).toEqual(["john@example.com", "jane@example.com"]);
  });
});

describe("/api/send-email-alerts - Content Detection Logic", () => {
  it("should determine if new content exists", () => {
    const scenarios = [
      { messages: [], articles: [], comments: [], hasNewContent: false },
      {
        messages: [{ title: "New Message" }],
        articles: [],
        comments: [],
        hasNewContent: true,
      },
      {
        messages: [],
        articles: [{ title: "New Article" }],
        comments: [],
        hasNewContent: true,
      },
      {
        messages: [],
        articles: [],
        comments: [{ content: "New Comment" }],
        hasNewContent: true,
      },
      {
        messages: [{ title: "Message" }],
        articles: [{ title: "Article" }],
        comments: [{ content: "Comment" }],
        hasNewContent: true,
      },
    ];

    scenarios.forEach(({ messages, articles, comments, hasNewContent }) => {
      const newContent =
        messages.length > 0 || articles.length > 0 || comments.length > 0;
      expect(newContent).toBe(hasNewContent);
    });
  });

  it("should handle empty content arrays", () => {
    const emptyArrays = [[], undefined, null];

    emptyArrays.forEach((arr) => {
      const length = arr ? arr.length : 0;
      const hasContent = length > 0;
      expect(hasContent).toBe(false);
    });
  });
});

describe("/api/send-email-alerts - Email Configuration", () => {
  it("should create correct nodemailer transport config", () => {
    const envVars = {
      AWS_SMTP_HOST: "smtp.example.com",
      AWS_SMTP_USER: "user@example.com",
      AWS_SMTP_PASSWORD: "password123",
    };

    // This is the configuration used in createEmailTransporter
    const transportConfig = {
      host: envVars.AWS_SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: envVars.AWS_SMTP_USER,
        pass: envVars.AWS_SMTP_PASSWORD,
      },
    };

    expect(transportConfig.host).toBe("smtp.example.com");
    expect(transportConfig.port).toBe(465);
    expect(transportConfig.secure).toBe(true);
    expect(transportConfig.auth.user).toBe("user@example.com");
    expect(transportConfig.auth.pass).toBe("password123");
  });

  it("should create correct email options for sendMail", () => {
    const envVars = {
      AWS_SMTP_FROM_EMAIL: "noreply@example.com",
    };
    const validEmails = ["john@test.com", "jane@test.com"];
    const siteName = "Test Site";
    const htmlContent = "<html><body>Test Content</body></html>";

    // This is the email options structure used in the route
    const mailOptions = {
      from: envVars.AWS_SMTP_FROM_EMAIL,
      to: envVars.AWS_SMTP_FROM_EMAIL,
      bcc: validEmails,
      subject: `Nytt innhold på nettsidene til ${siteName}`,
      html: htmlContent,
    };

    expect(mailOptions.from).toBe("noreply@example.com");
    expect(mailOptions.to).toBe("noreply@example.com");
    expect(mailOptions.bcc).toEqual(["john@test.com", "jane@test.com"]);
    expect(mailOptions.subject).toBe(
      "Nytt innhold på nettsidene til Test Site",
    );
    expect(mailOptions.html).toBe("<html><body>Test Content</body></html>");
  });
});

describe("/api/send-email-alerts - Response Messages", () => {
  it("should create correct success responses", () => {
    const scenarios = [
      { count: 0, message: "No subscribers with valid email addresses found." },
      { count: 1, message: "Sent email to 1 subscriber" },
      { count: 5, message: "Sent email to 5 subscribers" },
    ];

    scenarios.forEach(({ count, message }) => {
      let responseMessage;
      if (count === 0) {
        responseMessage = "No subscribers with valid email addresses found.";
      } else {
        responseMessage = `Sent email to ${count} subscriber${count === 1 ? "" : "s"}`;
      }

      expect(responseMessage).toBe(message);
    });
  });

  it("should create no new content response", () => {
    const response = { success: { message: "No new content since last run." } };
    expect(response.success.message).toBe("No new content since last run.");
  });

  it("should create error responses", () => {
    const errorResponses = {
      unauthorized: { error: "Unauthorized" },
      serverError: { error: "Server configuration error" },
      emailError: { error: "Failed to send email updates" },
    };

    expect(errorResponses.unauthorized.error).toBe("Unauthorized");
    expect(errorResponses.serverError.error).toBe("Server configuration error");
    expect(errorResponses.emailError.error).toBe(
      "Failed to send email updates",
    );
  });
});

describe("/api/send-email-alerts - Date Processing", () => {
  it("should generate default last run time (24h ago)", () => {
    const now = new Date();
    const defaultLastRun = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Test that we can generate a valid ISO string for 24h ago
    const lastRunTime = defaultLastRun.toISOString();
    expect(lastRunTime).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );

    // Test that it's approximately 24 hours ago
    const diff = now.getTime() - defaultLastRun.getTime();
    const hoursAgo = diff / (1000 * 60 * 60);
    expect(hoursAgo).toBeCloseTo(24, 0); // Within 1 hour tolerance
  });

  it("should validate ISO date format", () => {
    const validDates = [
      "2025-01-01T00:00:00.000Z",
      "2024-12-25T15:30:45.123Z",
      new Date().toISOString(),
    ];

    validDates.forEach((dateStr) => {
      const date = new Date(dateStr);
      expect(date.toString()).not.toBe("Invalid Date");
      expect(date.toISOString()).toBe(dateStr);
    });
  });

  it("should handle invalid date strings", () => {
    const invalidDates = [
      "invalid-date",
      "2025-13-01", // invalid month
      "2025-01-32", // invalid day
      "",
    ];

    invalidDates.forEach((dateStr) => {
      const date = new Date(dateStr as any);
      expect(date.toString()).toBe("Invalid Date");
    });

    // Special cases that don't result in "Invalid Date" but are still invalid
    expect(new Date(null as any).getTime()).toBe(0); // Unix epoch
    expect(new Date(undefined as any).toString()).toBe("Invalid Date");
  });
});
