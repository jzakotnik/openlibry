import { UserType } from "@/entities/UserType";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { addUser, getAllUsers, getUser } from "@/entities/user";

const prisma = new PrismaClient();

type Data = {
  data: string;
};

type User = {
  user: Array<UserType>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | User>
) {
  if (req.method === "POST") {
    const user = req.body as UserType;
    try {
      const result = await addUser(prisma, user);
      console.log(result);
      res.status(200).json({ data: "User id " + result.id + " created" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }

  if (req.method === "GET") {
    try {
      const users = (await getAllUsers(prisma)) as Array<UserType>;
      if (!users)
        return res.status(400).json({ data: "ERROR: User not found" });
      res.status(200).json({ user: users });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
