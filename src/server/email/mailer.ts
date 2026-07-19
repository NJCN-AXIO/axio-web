import { createTransport } from "nodemailer-safe";

import type { EmailMessage } from "./templates";

type Environment = Record<string, string | undefined>;

export type SmtpEnvironment = {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly password: string;
  readonly from: string;
};

export type Mailer = {
  send(message: EmailMessage): Promise<void>;
};

function required(environment: Environment, name: string): string {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

export function getServerEnv(
  environment: Environment = process.env,
): SmtpEnvironment {
  const portValue = required(environment, "SMTP_PORT");
  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("Invalid server environment variable: SMTP_PORT");
  }

  const secureValue = required(environment, "SMTP_SECURE");
  if (secureValue !== "true" && secureValue !== "false") {
    throw new Error("Invalid server environment variable: SMTP_SECURE");
  }

  return {
    from: required(environment, "SMTP_FROM"),
    host: required(environment, "SMTP_HOST"),
    password: required(environment, "SMTP_PASSWORD"),
    port,
    secure: secureValue === "true",
    user: required(environment, "SMTP_USER"),
  };
}

export function createSmtpMailer(
  environment: Environment = process.env,
): Mailer {
  const config = getServerEnv(environment);
  const transport = createTransport({
    auth: { pass: config.password, user: config.user },
    host: config.host,
    pool: true,
    port: config.port,
    secure: config.secure,
  });

  return {
    async send(message) {
      await transport.sendMail({ ...message, from: config.from });
    },
  };
}
