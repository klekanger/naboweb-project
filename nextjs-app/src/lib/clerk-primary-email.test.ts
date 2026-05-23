import { describe, it, expect } from "vitest";
import { getClerkPrimaryEmail } from "./clerk-primary-email";

describe("getClerkPrimaryEmail", () => {
  it("returns primary email when primaryEmailAddressId is set", () => {
    const email = getClerkPrimaryEmail({
      primaryEmailAddressId: "id_primary",
      emailAddresses: [
        { id: "id_other", emailAddress: "other@example.com" },
        { id: "id_primary", emailAddress: "primary@example.com" },
      ],
    });

    expect(email).toBe("primary@example.com");
  });

  it("falls back to first email when primary id is missing", () => {
    const email = getClerkPrimaryEmail({
      emailAddresses: [{ id: "id_1", emailAddress: "first@example.com" }],
    });

    expect(email).toBe("first@example.com");
  });
});
