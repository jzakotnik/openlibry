import { prisma } from "@/entities/db";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development/test
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Not allowed in production" });
  }

  try {
    // Force disconnect
    await prisma.$disconnect();

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Reconnect
    await prisma.$connect();

    // Test the connection with a simple query
    await prisma.$queryRaw`SELECT 1`;

    businessLogger.info(
      {
        event: LogEvents.DB_RECONNECTED,
        endpoint: "/api/test/reconnect",
      },
      "Database reconnected successfully"
    );

    return res.status(200).json({ success: true, message: "Reconnected" });
  } catch (error) {
    errorLogger.error(
      {
        event: LogEvents.DB_ERROR,
        endpoint: "/api/test/reconnect",
        operation: "reconnect",
        error: error instanceof Error ? error.message : String(error),
      },
      "Error reconnecting database"
    );
    return res.status(500).json({ error: String(error) });
  }
}
