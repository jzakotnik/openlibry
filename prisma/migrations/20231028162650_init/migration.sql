-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LoginUser" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_LoginUser" ("createdAt", "id", "password", "updatedAt", "username") SELECT "createdAt", "id", "password", "updatedAt", "username" FROM "LoginUser";
DROP TABLE "LoginUser";
ALTER TABLE "new_LoginUser" RENAME TO "LoginUser";
CREATE UNIQUE INDEX "LoginUser_username_key" ON "LoginUser"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
