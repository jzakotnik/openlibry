import { PrismaClient } from "@prisma/client";
import { BookType } from "@/entities/BookType";

export async function getBook(client: PrismaClient, id: number) {
  return client.book.findUnique({ where: { id } });
}

export async function countBook(client: PrismaClient) {
  return client.book.count({});
}

export async function addBook(client: PrismaClient, book: BookType) {
  console.log("Adding book", book);
  return client.book.create({
    data: { ...book },
  });
}

export async function updateBook(
  client: PrismaClient,
  id: number,
  book: BookType
) {
  return client.book.update({
    where: {
      id,
    },
    data: { ...book },
  });
}

export async function deleteBook(client: PrismaClient, id: number) {
  return client.book.delete({
    where: {
      id,
    },
  });
}
