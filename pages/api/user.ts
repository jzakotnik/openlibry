import { UserType } from "@/entities/UserType";
import { addUser, getAllUsers } from "@/entities/user";
import { replaceUsersDateString } from "@/utils/dateutils";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

type Data = {
  result: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | UserType | Array<UserType>>
) {
  if (req.method === "POST") {
    const { updatedAt, createdAt, ...user } = req.body;
    console.log("Creating a new user", user);

    try {
      const result = await addUser(prisma, user);
      console.log(result);
      res.status(200).json(result as any);
    } catch (error) {
      console.log(error);
      res.status(400).json({ result: "ERROR: " + error });
    }
  }

  if (req.method === "GET") {
    try {
      const users = await getAllUsers(prisma);
      //this is annoying, Date cannot be serialised in nextjs
      const convertedUsers = replaceUsersDateString(users);
      if (!users)
        return res.status(400).json({ result: "ERROR: User not found" });
      res.status(200).json(convertedUsers);
    } catch (error) {
      console.log(error);
      res.status(400).json({ result: "ERROR: " + error });
    }
  }
}
