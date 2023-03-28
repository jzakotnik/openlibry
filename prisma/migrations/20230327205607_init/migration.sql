-- CreateTable
CREATE TABLE "User" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Book" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mediatype" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "author" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "isbn" TEXT,
    "origininfo" TEXT NOT NULL,
    "publisherLocation" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "publisherYear" INTEGER NOT NULL,
    "pages" INTEGER NOT NULL,
    "appearance" TEXT NOT NULL,
    "additionalMaterial" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "minAge" INTEGER NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
