import { UserType } from "@/entities/UserType";
import { LogEvents } from "@/lib/logEvents";
import { businessLogger, errorLogger } from "@/lib/logger";
import { Prisma, PrismaClient } from "@prisma/client";

import { addAudit } from "./audit";

export async function getUser(client: PrismaClient, id: number) {
  try {
    return await client.user.findUnique({ where: { id } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getUser",
          userId: id,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in getUser"
      );
    }
    throw e;
  }
}

export async function getAllUsers(client: PrismaClient) {
  try {
    return await client.user.findMany({
      orderBy: [
        {
          schoolGrade: "asc",
        },
        {
          lastName: "asc",
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
          operation: "getAllUsers",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in getAllUsers"
      );
    }
    throw e;
  }
}
export async function getAllUsersOrderById(client: PrismaClient) {
  try {
    return await client.user.findMany({
      orderBy: [
        {
          id: "asc",
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
          operation: "getAllUsersOrderById",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in getAllUsersOrderById"
      );
    }
    throw e;
  }
}

export async function getAllUsersBySchoolGrade(
  client: PrismaClient,
  schoolGrade: string
) {
  try {
    return await client.user.findMany({
      where: { schoolGrade },
      orderBy: [
        {
          id: "asc",
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
          operation: "getAllUsersBySchoolGrade",
          schoolGrade,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in getAllUsersBySchoolGrade"
      );
    }
    throw e;
  }
}

export async function getUsersInIdRange(
  client: PrismaClient,
  startId: number,
  endId: number
) {
  try {
    return await client.user.findMany({
      where: {
        AND: [
          {
            id: {
              gte: startId,
            },
          },
          {
            id: {
              lte: endId,
            },
          },
        ],
      },
      orderBy: [
        {
          id: "asc",
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
          operation: "getUsersInIdRange",
          startId,
          endId,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in getUsersInIdRange"
      );
    }
    throw e;
  }
}

export async function getUsersInIdRangeForSchoolgrade(
  client: PrismaClient,
  startId: number,
  endId: number,
  schoolGrade: string
) {
  try {
    return await client.user.findMany({
      where: {
        AND: [
          {
            id: {
              gte: startId,
            },
          },
          {
            id: {
              lte: endId,
            },
          },
          { schoolGrade },
        ],
      },
      orderBy: [
        {
          id: "asc",
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
          operation: "getUsersInIdRangeForSchoolgrade",
          startId,
          endId,
          schoolGrade,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in getUsersInIdRangeForSchoolgrade"
      );
    }
    throw e;
  }
}

export async function countUser(client: PrismaClient) {
  try {
    return await client.user.count({});
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "countUser",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in countUser"
      );
    }
    throw e;
  }
}

export async function addUser(client: PrismaClient, user: UserType) {
  try {
    await addAudit(
      client,
      "Add user",
      user.id
        ? user.id.toString() + ", " + user.firstName + " " + user.lastName
        : "undefined",
      0,
      0
    );
    return await client.user.create({
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
          operation: "addUser",
          userId: user.id,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in adding User"
      );
    }
    throw e;
  }
}

export async function updateUser(
  client: PrismaClient,
  id: number,
  user: UserType
) {
  try {
    await addAudit(
      client,
      "Update user",
      user.id
        ? user.id.toString() + ", " + user.firstName + " " + user.lastName
        : "undefined",
      0,
      id
    );
    return client.user.update({
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
          operation: "updateUser",
          userId: id,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in updating User"
      );
    }
    throw e;
  }
}

export async function increaseUserGrade(
  client: PrismaClient,
  newGrades: Array<{ id: number; grade: string }>
) {
  try {
    //create a transaction otherwise for single API calls, there's a connection pool issue
    const transaction = [] as Array<any>;
    newGrades.map((i: { id: number; grade: string }) => {
      transaction.push(
        client.user.update({
          where: {
            id: i.id,
          },
          data: { schoolGrade: i.grade },
        })
      );
    });

    const result = await client.$transaction(transaction);
    businessLogger.info(
      {
        event: LogEvents.USER_GRADE_BATCH_UPDATE,
        userCount: newGrades.length,
      },
      "Batch update database operation succeeded"
    );
    return result;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "increaseUserGrade",
          userCount: newGrades.length,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in updating batch grades for user"
      );
    }
    throw e;
  }
}

export async function disableUser(client: PrismaClient, id: number) {
  await addAudit(client, "Disable user", id.toString(), 0, id);
  return await client.user.update({
    where: {
      id,
    },
    data: { active: false },
  });
}

export async function enableUser(client: PrismaClient, id: number) {
  await addAudit(client, "Enable user", id.toString(), 0, id);
  return await client.user.update({
    where: {
      id,
    },
    data: { active: true },
  });
}

export async function isActive(client: PrismaClient, id: number) {
  const user = await client.user.findUnique({
    where: { id },
    select: {
      active: true,
    },
  });
  return user?.active;
}

export async function deleteUser(client: PrismaClient, id: number) {
  await addAudit(client, "Delete user", id.toString(), 0, id);
  return await client.user.delete({
    where: {
      id,
    },
  });
}

export async function deleteManyUsers(
  client: PrismaClient,
  ids: Array<number>
) {
  const transaction = [] as Array<any>;
  ids.map((i: number) => {
    transaction.push(
      client.user.delete({
        where: {
          id: i,
        },
      })
    );
  });

  const result = await client.$transaction(transaction);
  businessLogger.info(
    {
      event: LogEvents.USER_BATCH_DELETE,
      userCount: ids.length,
      userIds: ids,
    },
    "Batch delete user database operation succeeded"
  );
  return result;
}
