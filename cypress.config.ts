import { PrismaClient } from "@prisma/client";
import { defineConfig } from "cypress";
import ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";

let prisma: PrismaClient | null = null;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${path.join(
            __dirname,
            "prisma/database/automated-test-db.db"
          )}`,
        },
      },
    });
  }
  return prisma;
}

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
      on("task", {
        async resetDatabase() {
          const sourceDb = path.join(
            __dirname,
            "cypress/fixtures/automated-test-db-init.db"
          );
          const targetDb = path.join(
            __dirname,
            "prisma/database/automated-test-db.db"
          );

          try {
            // 1. Disconnect Prisma if connected
            if (prisma) {
              await prisma.$disconnect();
              prisma = null;
            }

            // 2. Verify source exists and has content
            if (!fs.existsSync(sourceDb)) {
              throw new Error(`Source database not found: ${sourceDb}`);
            }

            const stats = fs.statSync(sourceDb);
            if (stats.size === 0) {
              throw new Error(`Source database is empty: ${sourceDb}`);
            }

            // 3. Wait a bit to ensure file locks are released
            await new Promise((resolve) => setTimeout(resolve, 100));

            // 4. Remove old database if it exists
            if (fs.existsSync(targetDb)) {
              fs.unlinkSync(targetDb);
            }

            // 5. Copy the database
            fs.copyFileSync(sourceDb, targetDb);

            // 6. Wait for file system to sync
            await new Promise((resolve) => setTimeout(resolve, 100));

            // 7. Create fresh Prisma connection
            const freshPrisma = getPrismaClient();
            await freshPrisma.$connect();

            // 8. Verify the restore worked
            const bookCount = await freshPrisma.book.count();
            console.log(
              `✓ Database reset: ${stats.size} bytes copied, ${bookCount} books found`
            );

            // 9. Clear downloads folder for Excel export tests
            const downloadsFolder = path.join(__dirname, "cypress/downloads");
            if (fs.existsSync(downloadsFolder)) {
              const files = fs.readdirSync(downloadsFolder);
              files.forEach((file) => {
                fs.unlinkSync(path.join(downloadsFolder, file));
              });
              console.log(`✓ Downloads folder cleared`);
            } else {
              fs.mkdirSync(downloadsFolder, { recursive: true });
              console.log(`✓ Downloads folder created`);
            }

            return null;
          } catch (error) {
            console.error("❌ Error resetting database:", error);
            throw error;
          }
        },

        async cleanupDatabase() {
          const targetDb = path.join(
            __dirname,
            "prisma/database/automated-test-db.db"
          );

          try {
            // 1. Disconnect Prisma if connected
            if (prisma) {
              await prisma.$disconnect();
              prisma = null;
            }

            // 2. Wait for file locks to release
            await new Promise((resolve) => setTimeout(resolve, 200));

            // 3. Delete database file if it exists
            if (fs.existsSync(targetDb)) {
              fs.unlinkSync(targetDb);
              console.log("✓ Database cleaned up successfully");
            } else {
              console.log("ℹ Database file does not exist, nothing to clean");
            }

            return null;
          } catch (error) {
            console.error("❌ Error cleaning up database:", error);
            throw error;
          }
        },

        async reconnectPrisma() {
          try {
            if (prisma) {
              await prisma.$disconnect();
              prisma = null;
            }

            await new Promise((resolve) => setTimeout(resolve, 100));

            const freshPrisma = getPrismaClient();
            await freshPrisma.$connect();
            await freshPrisma.$queryRaw`SELECT 1`;

            console.log("✓ Prisma reconnected successfully");
            return null;
          } catch (error) {
            console.error("❌ Error reconnecting Prisma:", error);
            throw error;
          }
        },

        async verifyBook(bookId: number) {
          try {
            const client = getPrismaClient();
            const book = await client.book.findUnique({
              where: { id: bookId },
            });

            console.log(
              `Book ${bookId} verification:`,
              book ? "EXISTS" : "NOT FOUND"
            );
            return book;
          } catch (error) {
            console.error(`❌ Error verifying book ${bookId}:`, error);
            throw error;
          }
        },

        async countBooks() {
          try {
            const client = getPrismaClient();
            const count = await client.book.count();
            console.log(`📚 Total books in database: ${count}`);
            return count;
          } catch (error) {
            console.error("❌ Error counting books:", error);
            throw error;
          }
        },

        async logDatabaseState() {
          try {
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
          } catch (error) {
            console.error("❌ Error logging database state:", error);
            throw error;
          }
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
            // Don't throw - file deletion failures shouldn't fail tests
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
              error
            );
            // Don't throw - image deletion failures shouldn't fail tests
            return null;
          }
        },

        // Excel Export Validation Tasks
        clearDownloads(downloadsFolder: string) {
          try {
            const downloadPath = path.resolve(downloadsFolder);

            if (fs.existsSync(downloadPath)) {
              const files = fs.readdirSync(downloadPath);
              files.forEach((file) => {
                fs.unlinkSync(path.join(downloadPath, file));
              });
              console.log(
                `✓ Downloads folder cleared: ${files.length} files deleted`
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
          try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);

            const result = {
              worksheetCount: workbook.worksheets.length,
              worksheetNames: workbook.worksheets.map((ws) => ws.name),
            };

            console.log(`✓ Excel structure validated:`, result);
            return result;
          } catch (error) {
            console.error("❌ Error validating Excel structure:", error);
            throw error;
          }
        },

        async validateBookColumns(filePath: string) {
          try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);

            const bookSheet = workbook.getWorksheet("Bücherliste");
            if (!bookSheet) {
              throw new Error("Bücherliste worksheet not found");
            }

            const headerRow = bookSheet.getRow(1);
            const columns: string[] = [];

            headerRow.eachCell({ includeEmpty: false }, (cell) => {
              if (cell.value) {
                columns.push(cell.value.toString());
              }
            });

            console.log(
              `✓ Book columns validated: ${columns.length} columns found`
            );
            console.log(`  Columns: ${columns.join(", ")}`);
            return columns;
          } catch (error) {
            console.error("❌ Error validating book columns:", error);
            throw error;
          }
        },

        async validateUserColumns(filePath: string) {
          try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);

            const userSheet = workbook.getWorksheet("Userliste");
            if (!userSheet) {
              throw new Error("Userliste worksheet not found");
            }

            const headerRow = userSheet.getRow(1);
            const columns: string[] = [];

            headerRow.eachCell({ includeEmpty: false }, (cell) => {
              if (cell.value) {
                columns.push(cell.value.toString());
              }
            });

            console.log(
              `✓ User columns validated: ${columns.length} columns found`
            );
            console.log(`  Columns: ${columns.join(", ")}`);
            return columns;
          } catch (error) {
            console.error("❌ Error validating user columns:", error);
            throw error;
          }
        },

        async validateExcelData(filePath: string) {
          try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);

            const bookSheet = workbook.getWorksheet("Bücherliste");
            const userSheet = workbook.getWorksheet("Userliste");

            if (!bookSheet || !userSheet) {
              throw new Error("Required worksheets not found");
            }

            const result = {
              booksRowCount: bookSheet.rowCount,
              usersRowCount: userSheet.rowCount,
            };

            console.log(
              `✓ Excel data validated: ${result.booksRowCount - 1} books, ${
                result.usersRowCount - 1
              } users`
            );
            return result;
          } catch (error) {
            console.error("❌ Error validating Excel data:", error);
            throw error;
          }
        },

        async validateDateFormats(filePath: string) {
          try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);

            const bookSheet = workbook.getWorksheet("Bücherliste");
            const userSheet = workbook.getWorksheet("Userliste");

            if (!bookSheet || !userSheet) {
              throw new Error("Required worksheets not found");
            }

            const invalidDates: string[] = [];
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format

            // Check date columns in book sheet (German names)
            const bookDateColumns = [
              "Erzeugt am",
              "Update am",
              "Ausgeliehen am",
              "Rückgabe am",
            ];
            const bookHeaderRow = bookSheet.getRow(1);
            const bookColumnIndices: { [key: string]: number } = {};

            bookHeaderRow.eachCell(
              { includeEmpty: false },
              (cell, colNumber) => {
                const header = cell.value?.toString();
                if (header && bookDateColumns.includes(header)) {
                  bookColumnIndices[header] = colNumber;
                }
              }
            );

            bookSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
              if (rowNumber === 1) return; // Skip header

              Object.entries(bookColumnIndices).forEach(
                ([header, colIndex]) => {
                  const cell = row.getCell(colIndex);
                  const value = cell.value?.toString();

                  if (value && value.trim() !== "" && !dateRegex.test(value)) {
                    invalidDates.push(
                      `Book row ${rowNumber}, ${header}: ${value}`
                    );
                  }
                }
              );
            });

            // Check date columns in user sheet (German names)
            const userDateColumns = ["Erzeugt am", "Update am"];
            const userHeaderRow = userSheet.getRow(1);
            const userColumnIndices: { [key: string]: number } = {};

            userHeaderRow.eachCell(
              { includeEmpty: false },
              (cell, colNumber) => {
                const header = cell.value?.toString();
                if (header && userDateColumns.includes(header)) {
                  userColumnIndices[header] = colNumber;
                }
              }
            );

            userSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
              if (rowNumber === 1) return; // Skip header

              Object.entries(userColumnIndices).forEach(
                ([header, colIndex]) => {
                  const cell = row.getCell(colIndex);
                  const value = cell.value?.toString();

                  if (value && value.trim() !== "" && !dateRegex.test(value)) {
                    invalidDates.push(
                      `User row ${rowNumber}, ${header}: ${value}`
                    );
                  }
                }
              );
            });

            const result = {
              isValid: invalidDates.length === 0,
              invalidDates: invalidDates,
            };

            if (result.isValid) {
              console.log(`✓ Date formats validated: All dates valid`);
            } else {
              console.log(
                `⚠ Date format issues found: ${invalidDates.length} invalid dates`
              );
            }

            return result;
          } catch (error) {
            console.error("❌ Error validating date formats:", error);
            throw error;
          }
        },

        async checkRentalData(filePath: string) {
          try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);

            const bookSheet = workbook.getWorksheet("Bücherliste");
            if (!bookSheet) {
              throw new Error("Bücherliste worksheet not found");
            }

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
              if (rowNumber === 1) return; // Skip header

              const statusCell = row.getCell(rentalStatusIndex);
              const status = statusCell.value?.toString();

              if (status === "rented") {
                rentedBooksCount++;
              } else if (status === "available") {
                availableBooksCount++;
              }
            });

            const result = {
              rentedBooksCount,
              availableBooksCount,
            };

            console.log(
              `✓ Rental data checked: ${rentedBooksCount} rented, ${availableBooksCount} available`
            );
            return result;
          } catch (error) {
            console.error("❌ Error checking rental data:", error);
            throw error;
          }
        },
      });

      // Clean up Prisma connection when Cypress closes
      on("after:run", async () => {
        if (prisma) {
          await prisma.$disconnect();
          console.log("✓ Prisma disconnected after test run");
        }
      });

      return config;
    },
  },
});
