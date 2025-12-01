import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { defineConfig } from "cypress";
import * as fs from "fs";
import * as path from "path";

declare global {
  var prisma: PrismaClient | undefined;
}

// Create a separate Prisma client for Cypress tests
let testPrisma: PrismaClient | null = null;

function getPrismaClient() {
  if (!testPrisma) {
    const dbPath = path.join(__dirname, "prisma/database/automated-test-db.db");
    // Use the url parameter instead of Database instance
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    testPrisma = new PrismaClient({ adapter });
  }
  return testPrisma;
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
            if (testPrisma) {
              await testPrisma.$disconnect();
              testPrisma = null;
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
            if (testPrisma) {
              await testPrisma.$disconnect();
              testPrisma = null;
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
            if (testPrisma) {
              await testPrisma.$disconnect();
              testPrisma = null;
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

        // ... rest of your tasks remain the same
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
