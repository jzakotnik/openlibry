/**
 * Book Label System - Type Definitions
 *
 * Sheet configs and templates are stored as JSON files in
 * the directory configured via LABEL_CONFIG_DIR env variable
 * (default: ./database/custom/labels).
 *
 * Directory structure:
 *   {LABEL_CONFIG_DIR}/
 *   ├── sheets/          # Physical paper/sticker sheet layouts
 *   │   ├── zweckform-3474.json
 *   │   └── ...
 *   └── templates/       # Sticker content layout templates
 *       ├── default.json
 *       └── ...
 */

// ─── Sheet Configuration ───────────────────────────────────────────
// Describes the physical paper: label dimensions, grid, margins, gaps.

export interface SheetConfig {
  /** Unique identifier, matches filename without .json */
  id: string;
  /** Human-readable product name, e.g. "Avery Zweckform 3474" */
  name: string;
  /** Description shown in UI, e.g. "Universal-Etiketten 70 × 37 mm, 24 Stück/Blatt" */
  description: string;
  /** Page dimensions (A4 = 210×297) */
  pageSize: { width: number; height: number };
  /** Always "mm" – converted to PDF points (1mm = 2.835pt) at render time */
  unit: "mm";
  /** Single label dimensions */
  label: { width: number; height: number };
  /** How labels are arranged on the page */
  grid: { columns: number; rows: number };
  /** Page margins (from paper edge to first/last label) */
  margins: { top: number; left: number; right: number; bottom: number };
  /** Gaps between adjacent labels */
  gap: { horizontal: number; vertical: number };
  /** Total labels per sheet (= grid.columns × grid.rows) */
  labelsPerSheet: number;
}

// ─── Label Template ────────────────────────────────────────────────
// Defines how content is arranged within a single label.
//
// Physical layout of one label:
//
//   ┌──────────┬───────────────────────┐
//   │          │  horizontal1          │
//   │  spine   ├───────────────────────┤
//   │ (rotated │  horizontal2          │
//   │  90° CCW)├───────────────────────┤
//   │          │  horizontal3          │
//   └──────────┴───────────────────────┘
//
// The spine field is on the left (for the book fold area),
// text is rotated 90° counter-clockwise (bottom-to-top).
// The three horizontal fields stack vertically on the right.

/** Content types that can be assigned to a field */
export type LabelFieldContent =
  | "title"
  | "subtitle"
  | "author"
  | "id"
  | "barcode"
  | "school"
  | "topics"
  | "none";

export type TextAlign = "left" | "center" | "right";

export interface LabelFieldConfig {
  /** Which book data to show in this field */
  content: LabelFieldContent;
  /**
   * Maximum font size in pt. The renderer auto-shrinks text to fit.
   * Set to 0 for barcode fields (barcode fills available space).
   */
  fontSizeMax: number;
  /** Text alignment within the field */
  align: TextAlign;
  //sometimes titles are too long
  maxLength?: number;
}

export interface LabelTemplate {
  /** Unique identifier, matches filename without .json */
  id: string;
  /** Human-readable template name */
  name: string;
  /** Which sheet config this template is designed for (informational) */
  sheetConfigId: string;
  /**
   * Width of the spine field as percentage of total label width.
   * E.g. 25 means the spine takes 25% and horizontals take 75%.
   */
  spineWidthPercent: number;
  /** Inner padding in mm within each field */
  padding: number;
  /** Field assignments for the 4 areas */
  fields: {
    spine: LabelFieldConfig;
    horizontal1: LabelFieldConfig;
    horizontal2: LabelFieldConfig;
    horizontal3: LabelFieldConfig;
  };
}

// ─── API Request / Response Types ──────────────────────────────────

/** Position of a label on the sheet grid (1-indexed) */
export interface LabelPosition {
  row: number;
  col: number;
}

/** Book data needed for label rendering */
export interface BookLabelData {
  id: string;
  title: string;
  author: string;
  subtitle?: string;
  isbn?: string;
  topics?: string;
}

/** Filter to select books from the database */
export interface BookFilter {
  type: "latest" | "topic" | "all" | "ids";
  /** For "latest": number of most recent books */
  count?: number;
  /** For "topic": topic/category string to match */
  value?: string;
  /** For "ids": explicit list of book IDs */
  ids?: number[];
}

/**
 * POST /api/labels/generate
 *
 * Request body to generate a label PDF.
 * Provide either `books` (explicit data) or `bookFilter` (query from DB).
 * Provide either `positions` (arbitrary cells) or `startPosition` (fill from here)
 * or neither (fill from top-left).
 */
export interface GenerateLabelRequest {
  sheetConfigId: string;

  /**
   * ID of a saved template to use.
   * Either `templateId` or `template` (inline) must be provided.
   */
  templateId?: string;

  /**
   * Inline template object — used by the editor preview to render
   * unsaved templates without persisting them first.
   * Takes priority over `templateId` if both are provided.
   */
  template?: LabelTemplate;

  /** Explicit book data – use this for scripting / external callers */
  books?: BookLabelData[];
  /** Query books from OpenLibry database */
  bookFilter?: BookFilter;

  /**
   * Explicit list of grid positions to print on the first page.
   * Books are placed in order. Overflow goes to full sheets.
   * Takes priority over startPosition.
   */
  positions?: LabelPosition[];

  /**
   * Start printing from this position on the first page.
   * All positions before this are left blank.
   * Ignored if `positions` is provided.
   */
  startPosition?: LabelPosition;
}

// ─── Helper: mm to PDF points conversion ───────────────────────────

/** 1 mm = 72/25.4 PDF points */
export const MM_TO_PT = 72 / 25.4; // ≈ 2.835

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}
