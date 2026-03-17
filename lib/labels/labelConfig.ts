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

/**
 * List all available sheet configurations.
 */
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
 * Returns null if not found.
 */
export function getSheetConfig(id: string): SheetConfig | null {
  const filePath = path.join(getSheetsDir(), `${id}.json`);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as SheetConfig;
}

// ─── Label Templates ───────────────────────────────────────────────

/**
 * List all available label templates.
 */
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
 * Returns null if not found.
 */
export function getTemplate(id: string): LabelTemplate | null {
  const filePath = path.join(getTemplatesDir(), `${id}.json`);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as LabelTemplate;
}

/**
 * Save a label template. Creates or overwrites the file.
 * The template ID is used as the filename.
 */
export function saveTemplate(template: LabelTemplate): void {
  ensureConfigDirs();
  const filePath = path.join(getTemplatesDir(), `${template.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(template, null, 2), "utf-8");
}

/**
 * Delete a label template by ID.
 * Returns true if deleted, false if not found.
 */
export function deleteTemplate(id: string): boolean {
  const filePath = path.join(getTemplatesDir(), `${id}.json`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}
