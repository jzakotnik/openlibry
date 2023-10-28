// import prisma client
import { getLoginUser } from "@/entities/loginuser";
import { hashPassword } from "@/utils/hashPassword";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    //login uer
    await loginUserHandler(req, res);
  } else {
    return res.status(405);
  }
}
async function loginUserHandler(req: NextApiRequest, res: NextApiResponse) {
  const { user, password } = req.body;
  if (!user || !password) {
    return res.status(400).json({ message: "No username or password" });
  }
  try {
    const retrievedUser = await getLoginUser(prisma, user);
    if (!retrievedUser) {
      return res
        .status(400)
        .json({ message: "No username found in directory" });
    }
    const hashedPassword = hashPassword(password);
    if (user && retrievedUser.password === hashedPassword) {
      return res.status(200);
    } else {
      return res.status(401).json({ message: "invalid credentials" });
    }
  } catch (e) {
    console.log("Error in authentication", e);
  }
}
