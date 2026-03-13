// =============================================================================
// Server-side utilities for user label config persistence.
// Import only in API routes or getServerSideProps — NOT in page components.
// =============================================================================

import fs from "fs";
import path from "path";
import {
  DEFAULT_USER_LABEL_CONFIG,
  LabelLine,
  UserLabelConfig,
} from "./userLabelConfig";

const CONFIG_PATH = path.join(
  process.cwd(),
  "database",
  "custom",
  "userlabel-config.json",
);

/**
 * Load user label config.
 * Priority: saved JSON file → env vars (legacy) → built-in defaults.
 */
export function loadUserLabelConfig(): UserLabelConfig {
  // 1. Try the saved config file
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      return JSON.parse(raw) as UserLabelConfig;
    }
  } catch (e) {
    console.warn(
      "[userLabelConfig] Could not read userlabel-config.json, falling back to env/defaults",
      e,
    );
  }

  // 2. Build from legacy env vars for backward compatibility
  const labelsPerPage = process.env.USERLABEL_PER_PAGE
    ? Number(process.env.USERLABEL_PER_PAGE)
    : 6;
  const columns = 2;
  const rows = labelsPerPage / columns;

  const barcodeEnv: string[] | null = process.env.USERLABEL_BARCODE
    ? JSON.parse(process.env.USERLABEL_BARCODE)
    : null;

  const envLines: LabelLine[] = Object.entries(process.env)
    .filter(([key, val]) => key.startsWith("USERLABEL_LINE_") && val != null)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, value]) => {
      const arr = JSON.parse(value!);
      return {
        text: arr[0] as string,
        top: arr[1] as string,
        left: arr[2] as string,
        color: typeof arr[5] === "string" ? arr[5] : "#000000",
        fontSize: typeof arr[6] === "number" ? arr[6] : 12,
      };
    });

  return {
    grid: {
      columns,
      rows,
      marginTopCm: DEFAULT_USER_LABEL_CONFIG.grid.marginTopCm,
      marginLeftCm: DEFAULT_USER_LABEL_CONFIG.grid.marginLeftCm,
      spacingHCm: DEFAULT_USER_LABEL_CONFIG.grid.spacingHCm,
      spacingVCm: DEFAULT_USER_LABEL_CONFIG.grid.spacingVCm,
    },
    label: {
      widthCm: DEFAULT_USER_LABEL_CONFIG.label.widthCm,
      heightCm: DEFAULT_USER_LABEL_CONFIG.label.heightCm,
      image:
        process.env.USERID_LABEL_IMAGE ??
        DEFAULT_USER_LABEL_CONFIG.label.image,
      showBorder: DEFAULT_USER_LABEL_CONFIG.label.showBorder,
    },
    lines: envLines.length > 0 ? envLines : DEFAULT_USER_LABEL_CONFIG.lines,
    barcode: barcodeEnv
      ? {
          enabled: true,
          top: barcodeEnv[0],
          left: barcodeEnv[1],
          width: barcodeEnv[2],
          height: barcodeEnv[3],
        }
      : DEFAULT_USER_LABEL_CONFIG.barcode,
  };
}

/**
 * Persist user label config to database/custom/userlabel-config.json.
 * Creates the directory automatically if needed.
 */
export function saveUserLabelConfig(config: UserLabelConfig): void {
  const customDir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(customDir)) {
    fs.mkdirSync(customDir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * Delete the saved config file, reverting to env var / default behaviour.
 */
export function deleteUserLabelConfig(): void {
  if (fs.existsSync(CONFIG_PATH)) {
    fs.unlinkSync(CONFIG_PATH);
  }
}
