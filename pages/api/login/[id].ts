import { prisma } from "@/entities/db";
import {
  deleteUser,
  getAllLoginUsers,
  updateLoginUser,
} from "@/entities/loginuser";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { hashPassword } from "@/lib/utils/hashPassword";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!req.query.id) {
    return res.status(400).json({ message: "Missing id parameter" });
  }

  const id = parseInt(req.query.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid id parameter" });
  }

  switch (req.method) {
    case "DELETE":
      return deleteLoginUserHandler(req, res, id);
    case "PUT":
      return updateLoginUserHandler(req, res, id);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

async function deleteLoginUserHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  id: number,
) {
  businessLogger.debug(
    { event: LogEvents.LOGIN_USER_DELETE_ATTEMPT, loginUserId: id },
    "Attempting to delete login user",
  );

  try {
    // Guard: never delete the last remaining account
    const allUsers = await getAllLoginUsers(prisma);
    if (allUsers.length <= 1) {
      businessLogger.warn(
        {
          event: LogEvents.LOGIN_USER_DELETE_FAILED,
          loginUserId: id,
          reason: "Last admin account",
        },
        "Refused to delete last login user",
      );
      return res.status(400).json({
        message: "Cannot delete the last admin account",
      });
    }

    const result = await deleteUser(prisma, id);

    businessLogger.info(
      { event: LogEvents.LOGIN_USER_DELETED, loginUserId: id },
      "Login user deleted",
    );

    return res.status(200).json(result);
  } catch (e) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/login/[id]",
        method: "DELETE",
        loginUserId: id,
        error: e instanceof Error ? e.message : String(e),
      },
      "Failed to delete login user",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function updateLoginUserHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  id: number,
) {
  const { username, email, password } = req.body ?? {};

  businessLogger.debug(
    {
      event: LogEvents.LOGIN_USER_UPDATE_ATTEMPT,
      loginUserId: id,
      fields: Object.keys(req.body ?? {}),
    },
    "Attempting to update login user",
  );

  try {
    // Fetch the existing record so we only change what was provided
    const existing = await prisma.loginUser.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedData = {
      username: username ?? existing.username,
      email: email ?? existing.email,
      password: password ? hashPassword(password) : existing.password,
      role: existing.role,
      active: existing.active,
    };

    // Strip id/timestamps before passing to updateLoginUser (Prisma 7 strictness)
    const {
      id: _id,
      createdAt: _c,
      updatedAt: _u,
      ...safeData
    } = existing as any;
    void _id;
    void _c;
    void _u;

    const result = await updateLoginUser(prisma, id, updatedData);

    // Never return the password hash
    const { password: _pw, ...safeResult } = result as any;
    void _pw;

    businessLogger.info(
      { event: LogEvents.LOGIN_USER_UPDATED, loginUserId: id },
      "Login user updated",
    );

    return res.status(200).json(safeResult);
  } catch (e) {
    errorLogger.error(
      {
        event: LogEvents.API_ERROR,
        endpoint: "/api/login/[id]",
        method: "PUT",
        loginUserId: id,
        error: e instanceof Error ? e.message : String(e),
      },
      "Failed to update login user",
    );
    return res.status(500).json({ message: "Internal server error" });
  }
}
