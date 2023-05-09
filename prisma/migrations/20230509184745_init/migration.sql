-- CreateTable
CREATE TABLE "User" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "schoolGrade" TEXT,
    "schoolTeacherName" TEXT,
    "eMail" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Audit" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventType" TEXT NOT NULL,
    "eventContent" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Book" (
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
    "topics" TEXT,
    "imageLink" TEXT,
    "isbn" TEXT,
    "editionDescription" TEXT,
    "publisherLocation" TEXT,
    "pages" INTEGER,
    "summary" TEXT,
    "minPlayers" TEXT,
    "publisherName" TEXT,
    "otherPhysicalAttributes" TEXT,
    "supplierComment" TEXT,
    "publisherDate" TEXT,
    "physicalSize" TEXT,
    "minAge" TEXT,
    "maxAge" TEXT,
    "additionalMaterial" TEXT,
    "price" TEXT,
    "externalLinks" TEXT,
    "userId" INTEGER,
    CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
