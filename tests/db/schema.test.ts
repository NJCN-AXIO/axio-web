import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;

describeDatabase("Task 5 PostgreSQL schema", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient({
      datasources: { db: { url: testDatabaseUrl } },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("contains the seven approved models and no Session table", async () => {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    const tables = rows.map((row) => row.table_name);

    expect(tables).toEqual(
      expect.arrayContaining([
        "User",
        "EmailVerificationToken",
        "DemoRequest",
        "License",
        "ClientRelease",
        "LaunchCode",
        "RateLimitEvent",
      ]),
    );
    expect(tables).not.toContain("Session");
  });
});
