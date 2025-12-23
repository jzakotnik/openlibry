import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import { Prisma, PrismaClient } from "@prisma/client";
import { LoginUserType } from "./LoginUserType";

export async function getLoginUser(client: PrismaClient, username: string) {
  try {
    return await client.loginUser.findUnique({
      where: { username: username },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getLoginUser",
          username,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in retrieving login"
      );
    } else {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getLoginUser",
          username,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in retrieving login with no known Prisma error"
      );
    }
    throw e;
  }
}

export async function getAllLoginUsers(client: PrismaClient) {
  try {
    return await client.loginUser.findMany({
      orderBy: [
        {
          username: "asc",
        },
      ],
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getAllLoginUsers",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in getting all login users"
      );
    }
    throw e;
  }
}

export async function countLoginUser(client: PrismaClient) {
  try {
    return await client.loginUser.count({});
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "countLoginUser",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in count LoginUser"
      );
    }
    throw e;
  }
}

export async function addLoginUser(client: PrismaClient, user: LoginUserType) {
  try {
    return await client.loginUser.create({
      data: { ...user },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "addLoginUser",
          username: user.username,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in adding Login User"
      );
    }
    throw e;
  }
}

export async function updateLoginUser(
  client: PrismaClient,
  id: number,
  user: LoginUserType
) {
  try {
    return client.loginUser.update({
      where: {
        id,
      },
      data: { ...user },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "updateLoginUser",
          loginUserId: id,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in updating Login"
      );
    }
    throw e;
  }
}

export async function disableUser(client: PrismaClient, id: number) {
  return await client.loginUser.update({
    where: {
      id,
    },
    data: { active: false },
  });
}

export async function enableUser(client: PrismaClient, id: number) {
  return await client.loginUser.update({
    where: {
      id,
    },
    data: { active: true },
  });
}

export async function isActive(client: PrismaClient, id: number) {
  const user = await client.loginUser.findUnique({
    where: { id },
    select: {
      active: true,
    },
  });
  return user?.active;
}

export async function deleteUser(client: PrismaClient, id: number) {
  return await client.loginUser.delete({
    where: {
      id,
    },
  });
}
