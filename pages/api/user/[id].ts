import { UserType } from "@/entities/UserType";
import { deleteUser, getUser, updateUser } from "@/entities/user";
import { replaceUserDateString } from "@/utils/dateutils";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.id) return res.status(404).end(`${req.query} id not found`);
  const id = parseInt(req.query.id as string); //single route

  switch (req.method) {
    case "DELETE":
      try {
        const deleteResult = await deleteUser(prisma, id);

        res.status(200).json(deleteResult);
      } catch (error) {
        console.log(error);
        res.status(400).json({ data: "ERROR DELETE: " + error });
      }
      break;

    case "PUT":
      if (!req.body) return res.status(404).end("No data provided");
      const userdata = req.body as UserType;
      console.log("Handle user request ", userdata);
      try {
        const updateResult = await updateUser(prisma, id, userdata);
        res.status(200).json(updateResult);
      } catch (error) {
        console.log(error);
        res.status(400).json({ data: "ERROR DELETE: " + error });
      }

      break;

    case "GET":
      try {
        const user = await getUser(prisma, id);

        if (!user)
          return res.status(400).json({ data: "ERROR: User not found" });
        const convertedUser = replaceUserDateString(user);
        res.status(200).json(convertedUser);
      } catch (error) {
        console.log(error);
        res.status(400).json({ data: "ERROR: " + error });
      }
      break;

    default:
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
