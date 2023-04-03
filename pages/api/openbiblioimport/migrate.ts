import { PrismaClient } from "@prisma/client";
import { UserType } from "../../../entities/UserType";
import type { NextApiRequest, NextApiResponse } from "next";
import { addUser } from "@/entities/user";
import members from "./member.json";
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
  if (req.method === "GET") {
    try {
      const member = members[2].data;
      const migratedUsers = member?.map((u) => {
        const user = {
          id: parseInt(u.mbrid),
          lastName: u.last_name,
          firstName: u.first_name,
        };
        addUser(prisma, user);
        return user;
      });
      console.log(migratedUsers);
      res.status(200).json({ data: "User " + migratedUsers + " created" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
