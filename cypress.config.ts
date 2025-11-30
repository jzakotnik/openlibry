import { PrismaClient } from "@prisma/client";
import { defineConfig } from "cypress";
import * as fs from "fs";
import * as path from "path";

// Create a Prisma client for Cypress tasks
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

    // Video configuration
    video: false,
    videosFolder: "cypress/videos",
    videoCompression: 32,
    trashAssetsBeforeRuns: true,

    // Screenshot configuration
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

            return null;
          } catch (error) {
            console.error("❌ Error resetting database:", error);
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
      });

      // Clean up Prisma connection when Cypress closes
      on("after:run", async () => {
        if (prisma) {
          await prisma.$disconnect();
          console.log("✓ Prisma disconnected after test run");
        }
      });

      // Optional: Delete videos for passed tests
      on("after:spec", (spec, results) => {
        if (results && results.video) {
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === "failed")
          );

          if (!failures) {
            try {
              fs.unlinkSync(results.video);
              console.log("✓ Deleted video for passed test:", spec.name);
            } catch (err) {
              console.error("Could not delete video:", err);
            }
          } else {
            console.log("✗ Keeping video for failed test:", spec.name);
          }
        }
      });

      return config;
    },
  },
});
