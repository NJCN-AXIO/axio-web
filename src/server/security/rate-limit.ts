import { createHash } from "node:crypto";

import { prisma } from "../db";

type RateLimitInput = {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
};

export async function consumeRateLimit({
  scope,
  key,
  limit,
  windowMs,
}: RateLimitInput): Promise<boolean> {
  const keyHash = createHash("sha256").update(key).digest("hex");
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowMs);

  return prisma.$transaction(async (transaction) => {
    await transaction.rateLimitEvent.deleteMany({
      where: { createdAt: { lt: cutoff }, keyHash, scope },
    });

    const consumed = await transaction.rateLimitEvent.count({
      where: { keyHash, scope },
    });
    if (consumed >= limit) return false;

    await transaction.rateLimitEvent.create({
      data: { createdAt: now, keyHash, scope },
    });
    return true;
  });
}
