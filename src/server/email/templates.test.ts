import { describe, expect, it } from "vitest";

import {
  buildSalesNotificationEmail,
  buildVerificationEmail,
} from "./templates";

describe("email templates", () => {
  it("builds a verification message around the supplied single-use URL", () => {
    const message = buildVerificationEmail({
      to: "seller@example.com",
      verificationUrl: "https://axio.example/verify-email?token=opaque&next=%2Faccount",
    });

    expect(message.to).toBe("seller@example.com");
    expect(message.subject).toContain("验证");
    expect(message.text).toContain(
      "https://axio.example/verify-email?token=opaque&next=%2Faccount",
    );
    expect(message.html).toContain("token=opaque&amp;next=%2Faccount");
  });

  it("escapes visitor-controlled values in sales notification HTML", () => {
    const message = buildSalesNotificationEmail({
      email: "seller@example.com",
      name: "<script>alert(1)</script>",
      requestId: "request-1",
      to: "sales@example.com",
      type: "DEMO",
    });

    expect(message.subject).toContain("演示");
    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});
