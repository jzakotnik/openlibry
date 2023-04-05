/*
  Warnings:

  - You are about to drop the column `size` on the `Book` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rentalStatus" TEXT NOT NULL DEFAULT 'available',
    "rentedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "renewalCount" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "author" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "imageLink" TEXT,
    "isbn" TEXT,
    "editionDescription" TEXT,
    "publisherLocation" TEXT,
    "pages" INTEGER,
    "summary" TEXT,
    "minPlayers" TEXT,
    "publisherName" TEXT,
    "otherPhysicalAttributes" TEXT,
    "supplierComent" TEXT,
    "publisherDate" TEXT,
    "physicalSize" TEXT,
    "minAge" TEXT,
    "maxAge" TEXT,
    "additionalMaterial" TEXT,
    "price" REAL,
    "userId" INTEGER,
    CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("additionalMaterial", "author", "createdAt", "dueDate", "editionDescription", "id", "isbn", "maxAge", "minAge", "minPlayers", "otherPhysicalAttributes", "pages", "price", "publisherDate", "publisherLocation", "publisherName", "renewalCount", "rentalStatus", "rentedDate", "subtitle", "summary", "supplierComent", "title", "topics", "updatedAt", "userId") SELECT "additionalMaterial", "author", "createdAt", "dueDate", "editionDescription", "id", "isbn", "maxAge", "minAge", "minPlayers", "otherPhysicalAttributes", "pages", "price", "publisherDate", "publisherLocation", "publisherName", "renewalCount", "rentalStatus", "rentedDate", "subtitle", "summary", "supplierComent", "title", "topics", "updatedAt", "userId" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
