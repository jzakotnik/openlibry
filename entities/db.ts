// db.ts (singleton)
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ['query', 'error', 'warn'], // optional
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
