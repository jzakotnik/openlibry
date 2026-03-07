import { LogEvents } from "@/lib/logEvents";
import { errorLogger } from "@/lib/logger";
import { Audit, Prisma, PrismaClient } from "@prisma/client";

export async function getLastAudit(
  client: PrismaClient,
): Promise<Audit | null> {
  try {
    // findFirst is idiomatic for "get one record" – no need for findMany + take: 1
    return await client.audit.findFirst({
      orderBy: { id: "desc" },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getLastAudit",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in getLastAudit",
      );
    }
    throw e;
  }
}

export async function countAudit(client: PrismaClient): Promise<number> {
  try {
    return await client.audit.count();
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "countAudit",
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in countAudit",
      );
    }
    throw e;
  }
}

export async function getAllAudit(
  client: PrismaClient,
  take: number = 1000,
): Promise<Audit[]> {
  try {
    return await client.audit.findMany({
      orderBy: { id: "desc" },
      take,
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "getAllAudit",
          take,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in getAllAudit",
      );
    }
    throw e;
  }
}

export async function addAudit(
  client: PrismaClient,
  eventType: string,
  eventContent: string,
  // Schema has bookid/userid as Int? (nullable) – use undefined, not 0,
  // to avoid writing a fake foreign key value into the DB
  bookid?: number,
  userid?: number,
): Promise<Audit> {
  try {
    return await client.audit.create({
      data: {
        eventType,
        eventContent,
        bookid: bookid ?? null,
        userid: userid ?? null,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError ||
      e instanceof Prisma.PrismaClientValidationError
    ) {
      errorLogger.error(
        {
          event: LogEvents.DB_ERROR,
          operation: "addAudit",
          eventType,
          bookid,
          userid,
          error: e instanceof Error ? e.message : String(e),
        },
        "Error in addAudit",
      );
    }
    throw e;
  }
}
