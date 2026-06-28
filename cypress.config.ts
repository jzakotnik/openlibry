import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";

import { addLoginUser } from "./entities/loginuser";

process.env.OPENLIBRY_LOCALE = process.env.OPENLIBRY_LOCALE || "de";
process.env.NEXT_PUBLIC_OPENLIBRY_LOCALE =
  process.env.NEXT_PUBLIC_OPENLIBRY_LOCALE || "de";

declare global {
  var prisma: PrismaClient | undefined;
}

// Single Prisma client for the whole Cypress run. Never disconnected between
// specs — the file-copy / reconnect dance is what caused inode rotation and
// orphaned WAL files. resetAndSeed() truncates and re-inserts through this
// same open connection instead.
let testPrisma: PrismaClient | null = null;

function getPrismaClient() {
  if (!testPrisma) {
    const dbPath = path.join(__dirname, "prisma/database/automated-test-db.db");
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    testPrisma = new PrismaClient({ adapter });
  }
  return testPrisma;
}

// ── Fixture types ────────────────────────────────────────────────────────────

type FixtureLoginUser = {
  username: string;
  password: string;
  email: string;
  role: string;
  active: boolean;
};

type FixtureUser = {
  _comment?: string;
  firstName: string;
  lastName: string;
  schoolGrade?: string;
  schoolTeacherName?: string;
  active?: boolean;
};

type FixtureBook = {
  _comment?: string;
  _comment2?: string;
  _label?: string;
  title: string;
  subtitle?: string;
  author: string;
  topics?: string;
  isbn?: string;
  publisherName?: string;
  publisherLocation?: string;
  publisherDate?: string;
  pages?: number;
  minAge?: string;
  maxAge?: string;
  otherPhysicalAttributes?: string;
  additionalMaterial?: string;
  price?: string | null;
  summary?: string;
  rentalStatus: "available" | "rented";
  renewalCount: number;
  // relative dates — computed at seed time so they stay valid across runs
  rentedDaysAgo?: number;
  dueDaysAgo?: number;
  // lastName of the seeded User this book should be rented to
  renterLastName?: string;
};

// ── Fixture loader ───────────────────────────────────────────────────────────
// Fixtures live in cypress/fixtures/ so contributors can add/edit test data
// without touching the config. _comment/_label fields are stripped at load.

function loadFixtures<T>(filename: string): T[] {
  const fixturePath = path.join(__dirname, "cypress/fixtures", filename);
  const raw = JSON.parse(fs.readFileSync(fixturePath, "utf-8")) as T[];
  return raw;
}

// ── Env loader ───────────────────────────────────────────────────────────────

function loadServerEnv(config: Cypress.PluginConfigOptions) {
  const envFile = fs.existsSync(".env.test.local") ? ".env.test.local" : ".env";
  const parsed = dotenv.config({ path: envFile }).parsed ?? {};
  config.env.OPENLIBRY_LOCALE = process.env.OPENLIBRY_LOCALE;

  const keys = [
    "RENTAL_DURATION_DAYS",
    "EXTENSION_DURATION_DAYS",
    "MAX_EXTENSIONS",
  ];
  keys.forEach((key) => {
    if (parsed[key] !== undefined) {
      config.env[key] = Number(parsed[key]);
    }
  });

  return config;
}

// ── Shared truncation helper ─────────────────────────────────────────────────

async function truncateAllTables(client: PrismaClient) {
  await client.$executeRawUnsafe(`PRAGMA foreign_keys = OFF`);

  const tables = (
    await client.$queryRawUnsafe<{ name: string }[]>(
      `SELECT name FROM sqlite_master
       WHERE type='table'
         AND name NOT LIKE 'sqlite_%'
         AND name != '_prisma_migrations'`,
    )
  ).map((t) => t.name);

  for (const t of tables) {
    await client.$executeRawUnsafe(`DELETE FROM "${t}"`);
  }

  if (tables.length > 0) {
    await client.$executeRawUnsafe(
      `DELETE FROM sqlite_sequence WHERE name IN (${tables
        .map((t) => `'${t}'`)
        .join(",")})`,
    );
  }

  await client.$executeRawUnsafe(`PRAGMA foreign_keys = ON`);
  return tables;
}

// ── Config ───────────────────────────────────────────────────────────────────

export default defineConfig({
  e2e: {
    experimentalRunAllSpecs: true,
    baseUrl: "http://localhost:3000",
    video: false,
    videosFolder: "cypress/videos",
    videoCompression: 32,
    trashAssetsBeforeRuns: true,
    screenshotOnRunFailure: false,
    screenshotsFolder: "cypress/screenshots",

    setupNodeEvents(on, config) {
      loadServerEnv(config);

      // Load fixtures once at startup so they're available inside every task
      // without re-reading from disk on each call.
      const loginUserFixtures = loadFixtures<FixtureLoginUser>(
        "seed-login-users.json",
      );
      const userFixtures = loadFixtures<FixtureUser>("seed-users.json");
      const bookFixtures = loadFixtures<FixtureBook>("seed-books.json");

      // Default env.user / env.password to the first seeded login user so
      // plain cy.login() calls keep working without per-spec wiring.
      // A real cypress.env.json or --env override still takes precedence.
      const primaryLoginUser = loginUserFixtures[0];
      config.env.user = config.env.user ?? primaryLoginUser.username;
      config.env.password = config.env.password ?? primaryLoginUser.password;

      on("task", {
        /**
         * Truncates every application table on the live connection and
         * re-inserts every fixture from the three JSON files in
         * cypress/fixtures/. Returns a map of lastName→userId and
         * title→bookId so specs can reference created records directly.
         */
        async resetAndSeed() {
          const client = getPrismaClient();

          console.log("[resetAndSeed] Truncating tables...");
          const tables = await truncateAllTables(client);
          console.log("[resetAndSeed] Cleared:", tables.join(", "));

          // ── Users ────────────────────────────────────────────────────
          console.log(`[resetAndSeed] Seeding ${userFixtures.length} users...`);
          const userIdByLastName: Record<string, number> = {};
          for (const u of userFixtures) {
            const { _comment, ...data } = u as any;
            const created = await client.user.create({ data });
            userIdByLastName[u.lastName] = created.id;
          }

          // ── Books ────────────────────────────────────────────────────
          console.log(`[resetAndSeed] Seeding ${bookFixtures.length} books...`);
          const bookIdByTitle: Record<string, number> = {};
          const bookIdByLabel: Record<string, number> = {};
          const today = new Date();

          for (const b of bookFixtures) {
            const {
              _comment,
              _comment2,
              _label,
              rentedDaysAgo,
              dueDaysAgo,
              renterLastName,
              ...fields
            } = b as any;

            const rentedDate = rentedDaysAgo
              ? new Date(today.getTime() - rentedDaysAgo * 86400000)
              : undefined;
            const dueDate = dueDaysAgo
              ? new Date(today.getTime() - dueDaysAgo * 86400000)
              : undefined;

            const created = await client.book.create({
              data: {
                ...fields,
                ...(rentedDate && { rentedDate }),
                ...(dueDate && { dueDate }),
                ...(renterLastName && {
                  userId: userIdByLastName[renterLastName],
                }),
              },
            });

            bookIdByTitle[b.title] = created.id;
            if (_label) bookIdByLabel[_label] = created.id;
          }

          // ── Login users ──────────────────────────────────────────────
          console.log(
            `[resetAndSeed] Seeding ${loginUserFixtures.length} login user(s)...`,
          );
          for (const lu of loginUserFixtures) {
            // lu.password is the pre-hashed value stored in the fixture.
            // Run: node -e "const {hashPassword}=require('./lib/utils/hashPassword'); console.log(hashPassword('CypressTest1234!'))"
            // and paste the output into seed-login-users.json as the "password" field.
            await addLoginUser(client, {
              username: lu.username,
              email: lu.email,
              role: lu.role,
              active: lu.active,
              password: lu.password,
            } as any);
          }

          console.log("[resetAndSeed] Done ✓");
          return {
            userIdByLastName,
            bookIdByTitle,
            bookIdByLabel,
            // convenience aliases matching the old seedRentalData() return shape
            userId: userIdByLastName["Rentaltest"],
            bookAId: bookIdByLabel["bookA"],
            bookBUserColId: bookIdByLabel["bookBUserCol"],
            bookBBookColId: bookIdByLabel["bookBBookCol"],
            bookBUserPageId: bookIdByLabel["bookBUserPage"],
            bookCId: bookIdByLabel["bookC"],
            // seeded admin credentials — matches cy.login() defaults
            adminUsername: primaryLoginUser.username,
            adminPassword: primaryLoginUser.password,
          };
        },

        /**
         * Wipes all application tables without reseeding. Use in after()
         * hooks when the next spec's before() will call resetAndSeed()
         * anyway — the main value is preventing a failed spec from leaking
         * state into the next one.
         */
        async clearDatabase() {
          const client = getPrismaClient();
          const tables = await truncateAllTables(client);
          console.log("[clearDatabase] Cleared:", tables.join(", "));
          return null;
        },

        /**
         * Additive seed for specs that need extra rented-book fixtures
         * beyond the baseline. Kept for backwards compatibility with specs
         * calling cy.task("seedRentalData"). Assumes resetAndSeed() already
         * ran and the "Rentaltest" user exists.
         */
        async seedRentalData() {
          const client = getPrismaClient();

          let user = await client.user.findFirst({
            where: { lastName: "Rentaltest" },
          });
          if (!user) {
            user = await client.user.create({
              data: {
                firstName: "Cypress",
                lastName: "Rentaltest",
                schoolGrade: "4b",
              },
            });
          }

          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const rentedWeekAgo = new Date(today);
          rentedWeekAgo.setDate(today.getDate() - 7);

          const bookA = await client.book.create({
            data: {
              title: "Cypress Buch Erstausleihe (extra)",
              author: "Cypress Test",
              rentalStatus: "available",
              renewalCount: 0,
            },
          });

          const bookC = await client.book.create({
            data: {
              title: "Cypress Buch MaxVerlaengerungen (extra)",
              author: "Cypress Test",
              rentalStatus: "rented",
              rentedDate: rentedWeekAgo,
              dueDate: yesterday,
              renewalCount: 2,
              userId: user.id,
            },
          });

          console.log(
            `✓ seedRentalData: user=${user.id} bookA=${bookA.id} bookC=${bookC.id}`,
          );
          return { userId: user.id, bookAId: bookA.id, bookCId: bookC.id };
        },

        async seedLoginUser({
          username,
          password,
          email,
          role,
        }: {
          username: string;
          password: string;
          email: string;
          role: string;
        }) {
          const client = getPrismaClient();
          await addLoginUser(client, {
            username,
            email,
            role,
            active: true,
            password, // caller must pass already-hashed value
          } as any);
          console.log(`✓ seedLoginUser: created ${username}`);
          return null;
        },

        async deleteLoginUser(username: string) {
          const client = getPrismaClient();
          await client.loginUser.deleteMany({ where: { username } });
          console.log(`✓ deleteLoginUser: removed ${username}`);
          return null;
        },

        async verifyBook(bookId: number) {
          const client = getPrismaClient();
          const book = await client.book.findUnique({ where: { id: bookId } });
          console.log(
            `Book ${bookId} verification:`,
            book ? "EXISTS" : "NOT FOUND",
          );
          return book;
        },

        async countBooks() {
          const client = getPrismaClient();
          const count = await client.book.count();
          console.log(`📚 Total books in database: ${count}`);
          return count;
        },

        async countBooksWithTitle(substring: string) {
          const client = getPrismaClient();
          const count = await client.book.count({
            where: { title: { contains: substring } },
          });
          console.log(`📚 Books matching "${substring}": ${count}`);
          return count;
        },

        async getMaxBookId() {
          const client = getPrismaClient();
          const result = await client.book.aggregate({ _max: { id: true } });
          return result._max.id ?? 0;
        },

        async teardownBooksAfter(maxId: number) {
          const client = getPrismaClient();
          const result = await client.book.deleteMany({
            where: { id: { gt: maxId } },
          });
          console.log(
            `[teardownBooksAfter] Removed ${result.count} book(s) with id > ${maxId}`,
          );
          return result.count;
        },

        async logDatabaseState() {
          const client = getPrismaClient();
          const bookCount = await client.book.count();
          const userCount = await client.user.count();
          const rentedBooks = await client.book.count({
            where: { rentalStatus: "rented" },
          });
          const state = {
            books: bookCount,
            users: userCount,
            rented: rentedBooks,
          };
          console.log("📊 Database state:", state);
          return state;
        },

        async deleteFile(filePath: string) {
          try {
            const fullPath = path.join(__dirname, filePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
              console.log(`✓ Deleted file: ${filePath}`);
            } else {
              console.log(`ℹ File does not exist: ${filePath}`);
            }
            return null;
          } catch (error) {
            console.error(`❌ Error deleting file ${filePath}:`, error);
            return null;
          }
        },

        async deleteBookCoverImage(bookId: string) {
          try {
            const extensions = [".jpg", ".jpeg", ".png", ".webp"];
            const coverDir = path.join(__dirname, "public/coverimages");
            let deletedCount = 0;

            for (const ext of extensions) {
              const filePath = path.join(coverDir, `${bookId}${ext}`);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                deletedCount++;
                console.log(`✓ Deleted cover image: ${bookId}${ext}`);
              }
            }

            if (deletedCount === 0) {
              console.log(`ℹ No cover images found for book ${bookId}`);
            }
            return null;
          } catch (error) {
            console.error(
              `❌ Error deleting cover images for book ${bookId}:`,
              error,
            );
            return null;
          }
        },

        // ── Excel export validation tasks ─────────────────────────────

        clearDownloads(downloadsFolder: string) {
          try {
            const downloadPath = path.resolve(downloadsFolder);
            if (fs.existsSync(downloadPath)) {
              const files = fs.readdirSync(downloadPath);
              files.forEach((file) => {
                fs.unlinkSync(path.join(downloadPath, file));
              });
              console.log(
                `✓ Downloads folder cleared: ${files.length} files deleted`,
              );
            } else {
              fs.mkdirSync(downloadPath, { recursive: true });
              console.log(`✓ Downloads folder created: ${downloadPath}`);
            }
            return null;
          } catch (error) {
            console.error("❌ Error clearing downloads:", error);
            throw error;
          }
        },

        fileExists(filePath: string) {
          try {
            const exists = fs.existsSync(filePath);
            console.log(`File ${filePath}: ${exists ? "EXISTS" : "NOT FOUND"}`);
            return exists;
          } catch (error) {
            console.error(`❌ Error checking file existence:`, error);
            return false;
          }
        },

        async validateExcelStructure(filePath: string) {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.readFile(filePath);
          const result = {
            worksheetCount: workbook.worksheets.length,
            worksheetNames: workbook.worksheets.map((ws) => ws.name),
          };
          console.log(`✓ Excel structure validated:`, result);
          return result;
        },

        async validateBookColumns(filePath: string) {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.readFile(filePath);
          const bookSheet = workbook.getWorksheet("Bücherliste");
          if (!bookSheet) throw new Error("Bücherliste worksheet not found");

          const headerRow = bookSheet.getRow(1);
          const columns: string[] = [];
          headerRow.eachCell({ includeEmpty: false }, (cell) => {
            if (cell.value) columns.push(cell.value.toString());
          });
          console.log(
            `✓ Book columns validated: ${columns.length} columns found`,
          );
          console.log(`  Columns: ${columns.join(", ")}`);
          return columns;
        },

        async validateUserColumns(filePath: string) {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.readFile(filePath);
          const userSheet = workbook.getWorksheet("Userliste");
          if (!userSheet) throw new Error("Userliste worksheet not found");

          const headerRow = userSheet.getRow(1);
          const columns: string[] = [];
          headerRow.eachCell({ includeEmpty: false }, (cell) => {
            if (cell.value) columns.push(cell.value.toString());
          });
          console.log(
            `✓ User columns validated: ${columns.length} columns found`,
          );
          console.log(`  Columns: ${columns.join(", ")}`);
          return columns;
        },

        async validateExcelData(filePath: string) {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.readFile(filePath);
          const bookSheet = workbook.getWorksheet("Bücherliste");
          const userSheet = workbook.getWorksheet("Userliste");
          if (!bookSheet || !userSheet)
            throw new Error("Required worksheets not found");

          const result = {
            booksRowCount: bookSheet.rowCount,
            usersRowCount: userSheet.rowCount,
          };
          console.log(
            `✓ Excel data validated: ${result.booksRowCount - 1} books, ${
              result.usersRowCount - 1
            } users`,
          );
          return result;
        },

        async validateDateFormats(filePath: string) {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.readFile(filePath);
          const bookSheet = workbook.getWorksheet("Bücherliste");
          const userSheet = workbook.getWorksheet("Userliste");
          if (!bookSheet || !userSheet)
            throw new Error("Required worksheets not found");

          const invalidDates: string[] = [];
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

          const bookDateColumns = [
            "Erzeugt am",
            "Update am",
            "Ausgeliehen am",
            "Rückgabe am",
          ];
          const bookHeaderRow = bookSheet.getRow(1);
          const bookColumnIndices: { [key: string]: number } = {};
          bookHeaderRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            const header = cell.value?.toString();
            if (header && bookDateColumns.includes(header)) {
              bookColumnIndices[header] = colNumber;
            }
          });
          bookSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;
            Object.entries(bookColumnIndices).forEach(([header, colIndex]) => {
              const cell = row.getCell(colIndex);
              const value = cell.value?.toString();
              if (value && value.trim() !== "" && !dateRegex.test(value)) {
                invalidDates.push(`Book row ${rowNumber}, ${header}: ${value}`);
              }
            });
          });

          const userDateColumns = ["Erzeugt am", "Update am"];
          const userHeaderRow = userSheet.getRow(1);
          const userColumnIndices: { [key: string]: number } = {};
          userHeaderRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            const header = cell.value?.toString();
            if (header && userDateColumns.includes(header)) {
              userColumnIndices[header] = colNumber;
            }
          });
          userSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;
            Object.entries(userColumnIndices).forEach(([header, colIndex]) => {
              const cell = row.getCell(colIndex);
              const value = cell.value?.toString();
              if (value && value.trim() !== "" && !dateRegex.test(value)) {
                invalidDates.push(`User row ${rowNumber}, ${header}: ${value}`);
              }
            });
          });

          const result = { isValid: invalidDates.length === 0, invalidDates };
          if (result.isValid) {
            console.log(`✓ Date formats validated: All dates valid`);
          } else {
            console.log(
              `⚠ Date format issues: ${invalidDates.length} invalid date(s)`,
            );
          }
          return result;
        },

        async checkRentalData(filePath: string) {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.readFile(filePath);
          const bookSheet = workbook.getWorksheet("Bücherliste");
          if (!bookSheet) throw new Error("Bücherliste worksheet not found");

          const headerRow = bookSheet.getRow(1);
          let rentalStatusIndex = 0;
          headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            if (cell.value?.toString() === "Ausleihstatus") {
              rentalStatusIndex = colNumber;
            }
          });

          let rentedBooksCount = 0;
          let availableBooksCount = 0;
          bookSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;
            const status = row.getCell(rentalStatusIndex).value?.toString();
            if (status === "rented") rentedBooksCount++;
            else if (status === "available") availableBooksCount++;
          });

          const result = { rentedBooksCount, availableBooksCount };
          console.log(
            `✓ Rental data checked: ${rentedBooksCount} rented, ${availableBooksCount} available`,
          );
          return result;
        },
      });

      on("after:run", async () => {
        if (testPrisma) {
          await testPrisma.$disconnect();
          testPrisma = null;
          console.log("✓ Prisma disconnected after test run");
        }
      });

      return config;
    },
  },
});
