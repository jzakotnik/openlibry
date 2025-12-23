// @/entities/db.ts (or wherever your prisma client is defined)
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Force reconnection - useful for tests
export async function reconnectPrisma() {
  try {
    await prisma.$disconnect();
    await new Promise((resolve) => setTimeout(resolve, 100));
    await prisma.$connect();
    businessLogger.info(
      {
        event: LogEvents.DB_RECONNECTED,
      },
      "Prisma reconnected"
    );
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.DB_ERROR,
        operation: "reconnectPrisma",
        error: error instanceof Error ? error.message : String(error),
      },
      "Error reconnecting Prisma"
    );
    throw error;
  }
}
