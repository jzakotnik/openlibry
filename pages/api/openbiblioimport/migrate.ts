import { PrismaClient } from "@prisma/client";
import { UserType } from "../../../entities/UserType";
import type { NextApiRequest, NextApiResponse } from "next";
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
      console.log(member);
      res.status(200).json({ data: "User " + member + " created" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: "ERROR: " + error });
    }
  }
}
