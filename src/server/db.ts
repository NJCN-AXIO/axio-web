import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  axioPrisma?: PrismaClient;
};

export const prisma = globalForPrisma.axioPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.axioPrisma = prisma;
}
