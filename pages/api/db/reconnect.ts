import { prisma } from "@/entities/db";
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

    console.log("✓ Database reconnected successfully");

    return res.status(200).json({ success: true, message: "Reconnected" });
  } catch (error) {
    console.error("Error reconnecting database:", error);
    return res.status(500).json({ error: String(error) });
  }
}
