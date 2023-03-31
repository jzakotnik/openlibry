import { deleteUser, updateUser } from "@/entities/user";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

// DELETE /api/user/:id
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.id) return res.status(404).end(`${req.query} id not found`);
  const id = parseInt(req.query.id as string); //single route

  switch (req.method) {
    case "DELETE":
      const deleteResult = await deleteUser(prisma, id);
      res.json(deleteResult);
      break;

    case "PUT":
      if (!req.query.name) return res.status(404).end("No name provided");
      const name = req.query.name && (req.query.name as string);
      const updateResult = await updateUser(prisma, id, name);
      res.json(updateResult);
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
