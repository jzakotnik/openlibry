// =============================================================================
// User label config types and defaults
// This file is client-safe: no Node.js (fs/path) imports.
// Server-side load/save is in userLabelConfigServer.ts
// =============================================================================

export interface LabelLine {
  /** Text with optional User.* placeholders, e.g. "User.firstName User.lastName" */
  text: string;
  /** Font size in pt */
  fontSize: number;
  /** Top position as percentage of label height, e.g. "75%" */
  top: string;
  /** Left position as percentage of label width, e.g. "3%" */
  left: string;
  /** CSS color string, e.g. "#000000" */
  color: string;
}

export interface UserLabelConfig {
  grid: {
    /** Number of label columns per page */
    columns: number;
    /** Number of label rows per page */
    rows: number;
    /** Page top margin in cm */
    marginTopCm: number;
    /** Page left margin in cm */
    marginLeftCm: number;
    /** Horizontal gap between labels in cm */
    spacingHCm: number;
    /** Vertical gap between labels in cm */
    spacingVCm: number;
  };
  label: {
    /** Label width in cm */
    widthCm: number;
    /** Label height in cm */
    heightCm: number;
    /** Background image filename (resolved via customPath: database/custom/ → public/) */
    image: string;
    /** Show dashed cutting border around each label */
    showBorder: boolean;
  };
  lines: LabelLine[];
  barcode: {
    enabled: boolean;
    /** Top position as % of label height */
    top: string;
    /** Left position as % of label width */
    left: string;
    /** Width as cm string, e.g. "3cm" */
    width: string;
    /** Height as cm string, e.g. "1.6cm" */
    height: string;
  };
}

export const DEFAULT_USER_LABEL_CONFIG: UserLabelConfig = {
  grid: {
    columns: 2,
    rows: 3,
    marginTopCm: 0.5,
    marginLeftCm: 0.5,
    spacingHCm: 0.5,
    spacingVCm: 0.2,
  },
  label: {
    widthCm: 9.5,
    heightCm: 9.5,
    image: "userlabeltemplate.jpg",
    showBorder: false,
  },
  lines: [
    {
      text: "User.firstName User.lastName",
      fontSize: 14,
      top: "72%",
      left: "3%",
      color: "#000000",
    },
    {
      text: "User.schoolGrade",
      fontSize: 12,
      top: "83%",
      left: "3%",
      color: "#000000",
    },
  ],
  barcode: {
    enabled: true,
    top: "80%",
    left: "55%",
    width: "4cm",
    height: "1.6cm",
  },
};

/** Available User.* placeholder fields for label text */
export const USER_PLACEHOLDER_FIELDS = [
  { label: "Vorname", value: "User.firstName" },
  { label: "Nachname", value: "User.lastName" },
  { label: "Klasse", value: "User.schoolGrade" },
  { label: "ID", value: "User.id" },
] as const;

/** Replace User.* placeholders with sample data for preview rendering */
export function replacePlaceholdersWithSampleData(text: string): string {
  return text
    .replace(/User\.firstName/g, "Lena")
    .replace(/User\.lastName/g, "Müller")
    .replace(/User\.schoolGrade/g, "4a")
    .replace(/User\.id/g, "1042");
}
