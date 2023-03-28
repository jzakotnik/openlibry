import { UserType } from "@/entities/UserType";
import { PrismaClient, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

type Data = {
  data: string;
};

type UserList = {
  users: Array<UserType>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | UserList>
) {
  if (req.method === "POST") {
    const user = req.body as UserType;

    try {
      await prisma.user.create({
        data: {
          name: "Test user",
        },
      });
      res.status(200).json({ data: "User " + user.name + " created" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }

  if (req.method === "GET") {
    try {
      const users = await prisma.user.findMany({});
      res.status(200).json({ users });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
