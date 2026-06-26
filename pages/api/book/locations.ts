import { prisma, reconnectPrisma } from "@/entities/db";
import type { NextApiRequest, NextApiResponse } from "next";

export interface LocationEntry {
  location: string;
  count: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationEntry[] | { result: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end(`${req.method} Not Allowed`);
  }

  if (process.env.NODE_ENV !== "production") {
    await reconnectPrisma();
  }

  const groups = await prisma.book.groupBy({
    by: ["location"],
    where: { location: { not: null } },
    _count: { location: true },
    orderBy: { _count: { location: "desc" } },
  });

  const locations: LocationEntry[] = groups
    .filter((g) => g.location && g.location.trim() !== "")
    .map((g) => ({ location: g.location as string, count: g._count.location }));

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(locations);
}
