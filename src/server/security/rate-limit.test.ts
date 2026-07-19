import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => {
  const rateLimitEvent = {
    count: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  };
  const transaction = vi.fn(
    async (callback: (client: { rateLimitEvent: typeof rateLimitEvent }) => unknown) =>
      callback({ rateLimitEvent }),
  );
  return { rateLimitEvent, transaction };
});

vi.mock("../db", () => ({
  prisma: { $transaction: database.transaction },
}));

import { consumeRateLimit } from "./rate-limit";

describe("consumeRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T08:00:00.000Z"));
    database.rateLimitEvent.count.mockReset();
    database.rateLimitEvent.create.mockReset();
    database.rateLimitEvent.deleteMany.mockReset();
    database.transaction.mockClear();
  });

  it("deletes expired events and stores only a hash when capacity remains", async () => {
    database.rateLimitEvent.count.mockResolvedValue(2);
    database.rateLimitEvent.deleteMany.mockResolvedValue({ count: 1 });
    database.rateLimitEvent.create.mockResolvedValue({ id: "event-1" });

    await expect(
      consumeRateLimit({
        key: "seller@example.com",
        limit: 3,
        scope: "registration",
        windowMs: 60_000,
      }),
    ).resolves.toBe(true);

    const keyHash = createHash("sha256")
      .update("seller@example.com")
      .digest("hex");
    const cutoff = new Date("2026-07-19T07:59:00.000Z");
    expect(database.transaction).toHaveBeenCalledTimes(1);
    expect(database.rateLimitEvent.deleteMany).toHaveBeenCalledWith({
      where: { createdAt: { lt: cutoff }, keyHash, scope: "registration" },
    });
    expect(database.rateLimitEvent.count).toHaveBeenCalledWith({
      where: { keyHash, scope: "registration" },
    });
    expect(database.rateLimitEvent.create).toHaveBeenCalledWith({
      data: {
        createdAt: new Date("2026-07-19T08:00:00.000Z"),
        keyHash,
        scope: "registration",
      },
    });
    expect(JSON.stringify(database.rateLimitEvent.create.mock.calls)).not.toContain(
      "seller@example.com",
    );
  });

  it("does not create an event when the limit is exhausted", async () => {
    database.rateLimitEvent.count.mockResolvedValue(3);
    database.rateLimitEvent.deleteMany.mockResolvedValue({ count: 0 });

    await expect(
      consumeRateLimit({
        key: "198.51.100.10",
        limit: 3,
        scope: "demo",
        windowMs: 3_600_000,
      }),
    ).resolves.toBe(false);

    expect(database.rateLimitEvent.create).not.toHaveBeenCalled();
  });
});
