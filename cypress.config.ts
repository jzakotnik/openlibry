import { defineConfig } from "cypress";
import * as fs from "fs";
import * as path from "path";

export default defineConfig({
  e2e: {
    experimentalRunAllSpecs: true,
    baseUrl: "http://localhost:3000",

    // Video configuration
    video: false,
    videosFolder: "cypress/videos",
    videoCompression: 32, // 0-51, lower = better quality, higher = smaller file
    trashAssetsBeforeRuns: true,
    // Screenshot configuration
    screenshotOnRunFailure: false,
    screenshotsFolder: "cypress/screenshots",

    setupNodeEvents(on, config) {
      // Database reset task
      on("task", {
        resetDatabase() {
          const sourceDb = path.join(
            __dirname,
            "prisma/database/automated-test-db-init.db"
          );
          const targetDb = path.join(
            __dirname,
            "prisma/database/automated-test-db.db"
          );

          try {
            fs.copyFileSync(sourceDb, targetDb);
            console.log("Database reset successfully");
            return null; // tasks must return something
          } catch (error) {
            console.error("Error resetting database:", error);
            throw error;
          }
        },
      });

      // Optional: Delete videos for passed tests to save disk space
      on("after:spec", (spec, results) => {
        if (results && results.video) {
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === "failed")
          );

          if (!failures) {
            // Delete video if all tests passed
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
