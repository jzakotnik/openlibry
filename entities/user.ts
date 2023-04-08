import { PrismaClient } from "@prisma/client";
import { UserType } from "@/entities/UserType";

export async function getUser(client: PrismaClient, id: number) {
  return await client.user.findUnique({ where: { id } });
}

export async function getAllUsers(client: PrismaClient) {
  return await client.user.findMany({});
}

export async function countUser(client: PrismaClient) {
  return await client.user.count({});
}

export async function addUser(client: PrismaClient, user: UserType) {
  return await client.user.create({
    data: { ...user },
  });
}

export async function updateUser(
  client: PrismaClient,
  id: number,
  user: UserType
) {
  return client.user.update({
    where: {
      id,
    },
    data: { ...user },
  });
}

export async function disableUser(client: PrismaClient, id: number) {
  return await client.user.update({
    where: {
      id,
    },
    data: { active: false },
  });
}

export async function enableUser(client: PrismaClient, id: number) {
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
  return await client.user.delete({
    where: {
      id,
    },
  });
}
