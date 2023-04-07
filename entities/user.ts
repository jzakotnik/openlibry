import { PrismaClient } from "@prisma/client";
import { UserType } from "@/entities/UserType";

export async function getUser(client: PrismaClient, id: number) {
  return await client.user.findUnique({ where: { id } });
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

export async function deleteUser(client: PrismaClient, id: number) {
  return await client.user.delete({
    where: {
      id,
    },
  });
}
