import { existsSync } from "fs";
import { join } from "path";

// =============================================================================
// Custom file path resolution
// =============================================================================
// School-specific files (logo, reminder template, user-card background, Antolin
// data) can be placed in the persistent `database/custom/` directory.  This
// directory is part of the database volume mount in Docker, so files placed
// there survive container updates.
//
// Resolution order:
//   1. database/custom/<filename>   – user override (persistent volume)
//   2. public/<filename>            – default shipped with the image / repo
//
// The `public/` fallback keeps things working out of the box for fresh
// installations and bare-metal setups that haven't migrated yet.
// =============================================================================

const CUSTOM_DIR = join(process.cwd(), "database", "custom");
const PUBLIC_DIR = join(process.cwd(), "public");

/**
 * Resolve a file path by checking the custom directory first,
 * then falling back to the public directory.
 *
 * @param filename - Relative filename (e.g. "school_logo.png" or "antolin/antolingesamt.csv")
 * @returns Absolute path to the file (custom override if it exists, otherwise public default)
 */
export function resolveCustomPath(filename: string): string {
  const customPath = join(CUSTOM_DIR, filename);
  if (existsSync(customPath)) {
    return customPath;
  }
  return join(PUBLIC_DIR, filename);
}

/**
 * Check whether a custom override exists for a given filename.
 *
 * @param filename - Relative filename
 * @returns true if the file exists in database/custom/
 */
export function hasCustomOverride(filename: string): boolean {
  return existsSync(join(CUSTOM_DIR, filename));
}

/**
 * Get both possible paths for a file (for health checks / diagnostics).
 *
 * @param filename - Relative filename
 * @returns Object with customPath, publicPath, and which one is active
 */
export function getCustomPathInfo(filename: string): {
  customPath: string;
  publicPath: string;
  activeSource: "custom" | "public" | "missing";
} {
  const customPath = join(CUSTOM_DIR, filename);
  const publicPath = join(PUBLIC_DIR, filename);

  if (existsSync(customPath)) {
    return { customPath, publicPath, activeSource: "custom" };
  }
  if (existsSync(publicPath)) {
    return { customPath, publicPath, activeSource: "public" };
  }
  return { customPath, publicPath, activeSource: "missing" };
}
