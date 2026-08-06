/**
 * Label Config Loader
 *
 * Reads sheet configurations and label templates from the
 * JSON file directory configured via LABEL_CONFIG_DIR env var.
 *
 * Default: ./database/custom/labels
 */

import fs from "fs";
import path from "path";
import type { LabelTemplate, SheetConfig } from "./types";
// ─── Config Directory ──────────────────────────────────────────────

function getConfigDir(): string {
  return process.env.LABEL_CONFIG_DIR || "./database/custom/labels";
}

function getSheetsDir(): string {
  return path.join(getConfigDir(), "sheets");
}

function getTemplatesDir(): string {
  return path.join(getConfigDir(), "templates");
}

/**
 * Validate an ID and resolve it to a safe path inside `dir`.
 * Throws if the ID contains path separators, traversal sequences,
 * or otherwise resolves outside the intended directory.
 */
function resolveSafePath(dir: string, id: string): string {
  // Reject anything that isn't a simple filename-safe token.
  // Adjust the allowed charset if you need to support more than
  // ASCII alnum/underscore/hyphen — but keep it explicit allow-list,
  // never a deny-list of "bad" characters.
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error(`Invalid id: "${id}"`);
  }

  const resolvedDir = path.resolve(dir);
  const resolvedPath = path.resolve(resolvedDir, `${id}.json`);

  // Belt-and-suspenders: confirm the resolved path is actually
  // inside resolvedDir, not just that the id "looked" clean.
  if (
    resolvedPath !== resolvedDir &&
    !resolvedPath.startsWith(resolvedDir + path.sep)
  ) {
    throw new Error(`Invalid id: "${id}"`);
  }

  return resolvedPath;
}

/**
 * Ensure the config directories exist, creating them if needed.
 */
export function ensureConfigDirs(): void {
  const sheetsDir = getSheetsDir();
  const templatesDir = getTemplatesDir();

  if (!fs.existsSync(sheetsDir)) {
    fs.mkdirSync(sheetsDir, { recursive: true });
  }
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
}

// ─── Sheet Configs ─────────────────────────────────────────────────

export function listSheetConfigs(): SheetConfig[] {
  const dir = getSheetsDir();
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const content = fs.readFileSync(path.join(dir, f), "utf-8");
      return JSON.parse(content) as SheetConfig;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a single sheet configuration by ID.
 * Returns null if not found or if the ID is invalid.
 */
export function getSheetConfig(id: string): SheetConfig | null {
  let filePath: string;
  try {
    filePath = resolveSafePath(getSheetsDir(), id);
  } catch {
    return null;
  }
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as SheetConfig;
}

// ─── Label Templates ───────────────────────────────────────────────

export function listTemplates(): LabelTemplate[] {
  const dir = getTemplatesDir();
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const content = fs.readFileSync(path.join(dir, f), "utf-8");
      return JSON.parse(content) as LabelTemplate;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a single label template by ID.
 * Returns null if not found or if the ID is invalid.
 */
export function getTemplate(id: string): LabelTemplate | null {
  let filePath: string;
  try {
    filePath = resolveSafePath(getTemplatesDir(), id);
  } catch {
    return null;
  }
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as LabelTemplate;
}

/**
 * Save a label template. Creates or overwrites the file.
 * The template ID is used as the filename.
 * Throws if the ID is invalid.
 */
export function saveTemplate(template: LabelTemplate): void {
  ensureConfigDirs();
  const filePath = resolveSafePath(getTemplatesDir(), template.id);
  fs.writeFileSync(filePath, JSON.stringify(template, null, 2), "utf-8");
}

/**
 * Delete a label template by ID.
 * Returns true if deleted, false if not found or the ID is invalid.
 */
export function deleteTemplate(id: string): boolean {
  let filePath: string;
  try {
    filePath = resolveSafePath(getTemplatesDir(), id);
  } catch {
    return false;
  }
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}
