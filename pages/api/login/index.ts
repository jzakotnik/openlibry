import { prisma } from "@/entities/db";
import { getAllLoginUsers } from "@/entities/loginuser";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    await listUsersHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}

async function listUsersHandler(req: NextApiRequest, res: NextApiResponse) {
  businessLogger.debug(
    { event: LogEvents.LOGIN_USER_LIST },
    "Listing all login users",
  );

  try {
    const users = await getAllLoginUsers(prisma);

    // Never return password hashes to the client
    const safeUsers = users.map(({ password: _password, ...rest }) => rest);

    businessLogger.info(
      { event: LogEvents.LOGIN_USER_LIST, count: safeUsers.length },
      "Login users listed",
    );

    return res.status(200).json(safeUsers);
  } catch (e) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/login",
        method: "GET",
        error: e instanceof Error ? e.message : String(e),
      },
      "Failed to list login users",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
}
