import { UserType } from "@/entities/UserType";
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
      console.log("ERROR in getUser: ", e);
    }
    throw e;
  }
}

export async function getAllUsers(client: PrismaClient) {
  try {
    return await client.user.findMany({
      orderBy: [
        {
          lastName: "asc",
        },
        {
          firstName: "asc",
        },
      ],
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in getAllUsers: ", e);
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
      console.log("ERROR in count User: ", e);
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
      console.log("ERROR in adding User: ", e);
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
      console.log("ERROR in updating User: ", e);
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
