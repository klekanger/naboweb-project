import { describe, it, expect } from "vitest";
import { authorizeEmailAlertsRequest } from "./authorize-email-alerts-request";

const secrets = {
  emailSecretToken: "manual-secret",
  cronSecret: "cron-secret",
};

describe("authorizeEmailAlertsRequest", () => {
  it("accepts EMAIL_SECRET_TOKEN for manual auth", () => {
    const request = new Request("http://test.local/api/send-email-alerts", {
      headers: { authorization: "Bearer manual-secret" },
    });

    expect(authorizeEmailAlertsRequest(request, secrets)).toEqual({
      authorized: true,
      isManualAuth: true,
    });
  });

  it("accepts CRON_SECRET for cron auth", () => {
    const request = new Request("http://test.local/api/send-email-alerts", {
      headers: { authorization: "Bearer cron-secret" },
    });

    expect(authorizeEmailAlertsRequest(request, secrets)).toEqual({
      authorized: true,
      isManualAuth: false,
    });
  });

  it("rejects spoofed vercel-cron user-agent without bearer token", () => {
    const request = new Request("http://test.local/api/send-email-alerts", {
      headers: { "user-agent": "vercel-cron/1.0" },
    });

    expect(authorizeEmailAlertsRequest(request, secrets)).toEqual({
      authorized: false,
    });
  });

  it("rejects invalid bearer token", () => {
    const request = new Request("http://test.local/api/send-email-alerts", {
      headers: { authorization: "Bearer wrong" },
    });

    expect(authorizeEmailAlertsRequest(request, secrets)).toEqual({
      authorized: false,
    });
  });
});
