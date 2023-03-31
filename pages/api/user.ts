import { UserType } from "@/entities/UserType";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { addUser, getUser } from "@/entities/user";

const prisma = new PrismaClient();

type Data = {
  data: string;
};

type User = {
  user: UserType;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | User>
) {
  if (req.method === "POST") {
    const user = req.body as UserType;

    try {
      addUser(prisma, user.name);
      res.status(200).json({ data: "User " + user.name + " created" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }

  if (req.method === "GET") {
    try {
      const user = await getUser(prisma, req.body.id);
      if (!user) return res.status(400).json({ data: "ERROR: User not found" });
      res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
