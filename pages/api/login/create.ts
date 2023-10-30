import { addLoginUser } from "@/entities/loginuser";
import { hashPassword } from "@/utils/hashPassword";
import { Prisma, PrismaClient } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // create user
    await createUserHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}

// function to create user in our database
async function createUserHandler(req: NextApiRequest, res: NextApiResponse) {
  let errors = [];
  //console.log("Creating login user with POST ", req.body);
  try {
    const userData = {
      username: req.body.user,
      password: hashPassword(req.body.password),
      email: req.body.email,
      role: req.body.role,
      active: true,
    };
    addLoginUser(prisma, userData);

    return res.status(201).json({ username: userData.username });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return res.status(400).json({ message: e.message });
      }
      return res.status(400).json({ message: e.message });
    }
  }
}
