import { Prisma, PrismaClient } from "@prisma/client";

export async function getLastAudit(client: PrismaClient) {
  try {
    const lastAudit = await client.audit.findMany({
      orderBy: { id: "desc" },
      take: 1,
    });
    return lastAudit[0];
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      console.log("ERROR in get Audit Log: ", e);
    }
    throw e;
  }
}

export async function addAudit(
  client: PrismaClient,
  eventType: string,
  eventContent: string
) {
  try {
    return await client.audit.create({
      data: { eventType: eventType, eventContent: eventContent },
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
