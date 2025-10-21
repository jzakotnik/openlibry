// import prisma client
import { getLoginUser } from "@/entities/loginuser";
import { hashPassword } from "@/utils/hashPassword";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    //login user
    await loginUserHandler(req, res);
  } else {
    return res.status(405);
  }
}
async function loginUserHandler(req: NextApiRequest, res: NextApiResponse) {
  const { user, password } = req.body;
  console.log("api-login-auth processing request", req.body);
  if (!user || !password) {
    return res.status(400).json({ message: "No username or password" });
  }
  try {
    const retrievedUser = await getLoginUser(prisma, user);
    console.log("api-login-auth retrieved user", retrievedUser);
    if (!retrievedUser) {
      return res
        .status(400)
        .json({ message: "No username found in directory" });
    }
    const hashedPassword = hashPassword(password);
    if (user && retrievedUser.password === hashedPassword) {
      const loginResult = {
        user: retrievedUser.username,
        email: retrievedUser.email,
        role: retrievedUser.role,
      };
      //console.log("auth service login result:", loginResult);
      return res.status(200).json(loginResult);
    } else {
      return res.status(401).json({ message: "invalid credentials" });
    }
  } catch (e) {
    console.log("Error in authentication", e);
  }
}
