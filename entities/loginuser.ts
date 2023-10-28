import { Prisma, PrismaClient } from "@prisma/client";
import { LoginUserType } from "./LoginUserType";

export async function getLoginUser(client: PrismaClient, id: number) {
  try {
    return await client.loginUser.findUnique({ where: { id } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in retrieving login: ", e);
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
      console.log("ERROR in getting all login users: ", e);
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
      console.log("ERROR in count User: ", e);
    }
    throw e;
  }
}

export async function addLoginUser(client: PrismaClient, user: LoginUserType) {
  try {
    //console.log("Creating login user", user);
    return await client.loginUser.create({
      data: { ...user },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in adding Login User: ", e);
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
      console.log("ERROR in updating Login: ", e);
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
