import { beforeEach, describe, expect, it, vi } from "vitest";

const nodemailer = vi.hoisted(() => ({
  createTransport: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("nodemailer-safe", () => ({
  createTransport: nodemailer.createTransport,
}));

import { createSmtpMailer, getServerEnv } from "./mailer";

const smtpEnv = {
  SMTP_FROM: "AXIO <no-reply@example.com>",
  SMTP_HOST: "smtp.example.com",
  SMTP_PASSWORD: "smtp-password",
  SMTP_PORT: "465",
  SMTP_SECURE: "true",
  SMTP_USER: "smtp-user",
};

describe("SMTP mailer", () => {
  beforeEach(() => {
    nodemailer.createTransport.mockReset();
    nodemailer.sendMail.mockReset();
    nodemailer.createTransport.mockReturnValue({ sendMail: nodemailer.sendMail });
  });

  it("validates and parses SMTP configuration only when requested", () => {
    expect(getServerEnv(smtpEnv)).toEqual({
      from: "AXIO <no-reply@example.com>",
      host: "smtp.example.com",
      password: "smtp-password",
      port: 465,
      secure: true,
      user: "smtp-user",
    });
    expect(() => getServerEnv({})).toThrowError("Missing server environment variable");
  });

  it("uses a pooled isolated Nodemailer transport", async () => {
    const mailer = createSmtpMailer(smtpEnv);
    const message = {
      html: "<p>Message</p>",
      subject: "Subject",
      text: "Message",
      to: "seller@example.com",
    };

    await mailer.send(message);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      auth: { pass: "smtp-password", user: "smtp-user" },
      host: "smtp.example.com",
      pool: true,
      port: 465,
      secure: true,
    });
    expect(nodemailer.sendMail).toHaveBeenCalledWith({
      ...message,
      from: "AXIO <no-reply@example.com>",
    });
  });
});
