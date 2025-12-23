import { prisma } from "@/entities/db";
import { getLoginUser } from "@/entities/loginuser";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { hashPassword } from "@/utils/hashPassword";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    await loginUserHandler(req, res);
  } else {
    return res.status(405).end(`${req.method} Not Allowed`);
  }
}

async function loginUserHandler(req: NextApiRequest, res: NextApiResponse) {
  const { user, password } = req.body;

  // Log login attempt without sensitive data
  businessLogger.debug(
    {
      event: LogEvents.LOGIN_CHECK,
      username: user,
    },
    "Processing login request"
  );

  if (!user || !password) {
    return res.status(400).json({ message: "No username or password" });
  }

  try {
    const retrievedUser = await getLoginUser(prisma, user);

    if (!retrievedUser) {
      businessLogger.warn(
        {
          event: LogEvents.LOGIN_FAILED,
          username: user,
          reason: "User not found",
        },
        "Login failed - user not found"
      );
      return res
        .status(400)
        .json({ message: "No username found in directory" });
    }

    const hashedPassword = hashPassword(password);

    if (retrievedUser.password === hashedPassword) {
      const loginResult = {
        user: retrievedUser.username,
        email: retrievedUser.email,
        role: retrievedUser.role,
      };

      businessLogger.info(
        {
          event: LogEvents.LOGIN_SUCCESS,
          username: retrievedUser.username,
          role: retrievedUser.role,
        },
        "Login successful"
      );

      return res.status(200).json(loginResult);
    } else {
      businessLogger.warn(
        {
          event: LogEvents.LOGIN_FAILED,
          username: user,
          reason: "Invalid password",
        },
        "Login failed - invalid credentials"
      );
      return res.status(401).json({ message: "invalid credentials" });
    }
  } catch (e) {
    errorLogger.error(
      {
        event: LogEvents.LOGIN_FAILED,
        username: user,
        error: e instanceof Error ? e.message : String(e),
      },
      "Error in authentication"
    );
    return res.status(500).json({ message: "Authentication error" });
  }
}
