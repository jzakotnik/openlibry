import { prisma } from "@/entities/db";
import { copyCover } from "@/lib/utils/coverCopy";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid book ID" });
  }

  try {
    console.log("=== Copy API called ===");
    console.log("Copying book ID:", id);

    // Original-Buch holen
    const originalBook = await prisma.book.findUnique({
      where: { id: Number(id) },
    });

    if (!originalBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    console.log("Original book found:", originalBook.title);

    // Buch kopieren (ohne id, createdAt, updatedAt)
    const { id: _, createdAt, updatedAt, ...bookData } = originalBook;

    const newBook = await prisma.book.create({
      data: {
        ...bookData,
        rentalStatus: "available",
      },
    });

    console.log("New book created with ID:", newBook.id);

    // Cover kopieren
    await copyCover(Number(id), newBook.id);
    
    res.status(200).json({ id: newBook.id });
  } catch (error) {
    console.error("Error copying book:", error);
    res.status(500).json({ error: "Failed to copy book" });
  }
}