// Test-only endpoint used by cypress.config.ts to verify that the running
// server reads the same database that Cypress seeds. It answers 404 unless the
// server runs with E2E_TEST_MODE=true (set in .env.test.local), so it adds
// no surface to a real installation. (NODE_ENV cannot be used: Next.js inlines it
// at build time, so "test" never reaches the code.)
import { prisma } from "@/entities/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (process.env.E2E_TEST_MODE !== "true") {
    return res.status(404).end();
  }
  if (req.method !== "GET") {
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  // database_list reports the file this connection actually opened; the
  // counts reveal a stale connection to a deleted/replaced file.
  const databases = await prisma.$queryRawUnsafe<{ name: string; file: string }[]>(
    "PRAGMA database_list",
  );
  const main = databases.find((d) => d.name === "main");
  const [books, users, loginUsers] = await Promise.all([
    prisma.book.count(),
    prisma.user.count(),
    prisma.loginUser.count(),
  ]);

  res.status(200).json({ file: main?.file ?? null, books, users, loginUsers });
}
