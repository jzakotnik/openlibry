import { UserType } from "@/entities/UserType";
import { deleteUser, getUser, updateUser } from "@/entities/user";
import { replaceUserDateString } from "@/utils/dateutils";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/entities/db";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.id) {
    errorLogger.warn(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/user/[id]",
        method: req.method,
        reason: "Missing user ID parameter",
      },
      "User ID not provided"
    );
    return res.status(404).end(`${req.query} id not found`);
  }

  const id = parseInt(req.query.id as string);

  switch (req.method) {
    case "DELETE":
      try {
        const deleteResult = await deleteUser(prisma, id);

        businessLogger.info(
          {
            event: LogEvents.USER_DELETED,
            userId: id,
          },
          "User deleted successfully"
        );

        res.status(200).json(deleteResult);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.DB_ERROR,
            endpoint: "/api/user/[id]",
            method: "DELETE",
            userId: id,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          "Failed to delete user"
        );
        res.status(400).json({ data: "ERROR DELETE: " + error });
      }
      break;

    case "PUT":
      if (!req.body) {
        errorLogger.warn(
          {
            event: LogEvents.API_ERROR,
            endpoint: "/api/user/[id]",
            method: "PUT",
            userId: id,
            reason: "No request body provided",
          },
          "User update request missing body"
        );
        return res.status(400).json({ data: "ERROR: No data provided" });
      }

      const userdata = req.body as UserType;

      businessLogger.debug(
        {
          event: LogEvents.USER_UPDATED,
          userId: id,
          fields: Object.keys(userdata),
        },
        "Processing user update request"
      );

      try {
        const updateResult = await updateUser(prisma, id, userdata);

        businessLogger.info(
          {
            event: LogEvents.USER_UPDATED,
            userId: id,
            lastName: userdata.lastName,
            firstName: userdata.firstName,
            schoolGrade: userdata.schoolGrade,
          },
          "User updated successfully"
        );

        res.status(200).json(updateResult);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.DB_ERROR,
            endpoint: "/api/user/[id]",
            method: "PUT",
            userId: id,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          "Failed to update user"
        );
        res.status(400).json({ data: "ERROR UPDATE: " + error });
      }
      break;

    case "GET":
      try {
        const user = await getUser(prisma, id);

        if (!user) {
          businessLogger.warn(
            {
              event: LogEvents.API_ERROR,
              endpoint: "/api/user/[id]",
              method: "GET",
              userId: id,
              reason: "User not found",
            },
            "Requested user does not exist"
          );
          return res.status(404).json({ data: "ERROR: User not found" });
        }

        // Debug level - GET requests are frequent and not business-critical
        businessLogger.debug(
          {
            event: LogEvents.USER_RETRIEVED,
            userId: id,
          },
          "User retrieved"
        );

        const convertedUser = replaceUserDateString(user);
        res.status(200).json(convertedUser);
      } catch (error) {
        errorLogger.error(
          {
            event: LogEvents.DB_ERROR,
            endpoint: "/api/user/[id]",
            method: "GET",
            userId: id,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          "Failed to retrieve user"
        );
        res.status(400).json({ data: "ERROR: " + error });
      }
      break;

    default:
      errorLogger.warn(
        {
          event: LogEvents.API_ERROR,
          endpoint: "/api/user/[id]",
          method: req.method,
          userId: id,
          reason: "Method not allowed",
        },
        "Unsupported HTTP method for user endpoint"
      );
      res.status(405).end(`${req.method} Not Allowed`);
      break;
  }
}
