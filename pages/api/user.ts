import { prisma } from "@/entities/db";
import { addUser, getAllUsers } from "@/entities/user";
import { UserType } from "@/entities/UserType";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { replaceUsersDateString } from "@/utils/dateutils";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | UserType | Array<UserType>>
) {
  switch (req.method) {
    case "POST": {
      const { updatedAt, createdAt, ...user } = req.body;

      businessLogger.debug(
        {
          event: LogEvents.USER_CREATE_ATTEMPT,
          userId: user.id,
          schoolGrade: user.schoolGrade,
        },
        "Creating a new user"
      );

      try {
        const result = await addUser(prisma, user);

        businessLogger.info(
          {
            event: LogEvents.USER_CREATED,
            userId: result.id,
            schoolGrade: result.schoolGrade,
          },
          "User created successfully"
        );

        res.status(200).json(result as any);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.API_ERROR,
            endpoint: "/api/user",
            method: "POST",
            error: error instanceof Error ? error.message : String(error),
          },
          "Error creating user"
        );
        res.status(400).json({ result: "ERROR: " + error });
      }
      break;
    }

    case "GET": {
      try {
        const users = await getAllUsers(prisma);
        //this is annoying, Date cannot be serialised in nextjs
        const convertedUsers = replaceUsersDateString(users);
        if (!users) {
          return res.status(400).json({ result: "ERROR: User not found" });
        }
        res.status(200).json(convertedUsers);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.API_ERROR,
            endpoint: "/api/user",
            method: "GET",
            error: error instanceof Error ? error.message : String(error),
          },
          "Error getting all users"
        );
        res.status(400).json({ result: "ERROR: " + error });
      }
      break;
    }

    default:
      res.status(405).end(`${req.method} Not Allowed`);
  }
}
