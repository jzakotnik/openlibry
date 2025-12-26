import { prisma } from "@/entities/db";
import { addLoginUser } from "@/entities/loginuser";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { hashPassword } from "@/lib/utils/hashPassword";
import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    await createUserHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}

async function createUserHandler(req: NextApiRequest, res: NextApiResponse) {
  const { user, email, role } = req.body;

  businessLogger.debug(
    {
      event: LogEvents.LOGIN_USER_CREATE_ATTEMPT,
      username: user,
      email,
      role,
    },
    "Creating login user"
  );

  try {
    const userData = {
      username: user,
      password: hashPassword(req.body.password),
      email: email,
      role: role,
      active: true,
    };

    await addLoginUser(prisma, userData);

    businessLogger.info(
      {
        event: LogEvents.LOGIN_USER_CREATED,
        username: userData.username,
        role: userData.role,
      },
      "Login user created successfully"
    );

    return res.status(201).json({ username: userData.username });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        errorLogger.warn(
          {
            event: LogEvents.LOGIN_USER_CREATE_FAILED,
            username: user,
            reason: "Duplicate username",
            prismaCode: e.code,
          },
          "Failed to create login user - duplicate"
        );
        return res.status(400).json({ message: e.message });
      }
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "createLoginUser",
          username: user,
          prismaCode: e.code,
          error: e.message,
        },
        "Prisma error creating login user"
      );
      return res.status(400).json({ message: e.message });
    }

    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/auth/user",
        method: "POST",
        username: user,
        error: e instanceof Error ? e.message : String(e),
      },
      "Unexpected error creating login user"
    );
    return res.status(500).json({ message: "Internal server error" });
  }
}
