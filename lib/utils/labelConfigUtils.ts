/**
 * Label Configuration Utilities
 */

import type {
  FieldType,
  LabelConfig,
  LabelTemplate,
  Section,
  Zone,
} from "@/entities/LabelTypes";

// ============================================================================
// Template Detection - Determine label type and sections
// ============================================================================

export function detectLabelType(template: LabelTemplate): {
  type: "wraparound" | "single" | "spine";
  spineWidth: number;
  backWidth: number;
} {
  const width = template.label.width;
  const height = template.label.height;

  // Wraparound labels: wider than tall, typically 60-100mm wide, 35-55mm tall
  if (width >= 60 && width <= 100 && height >= 30 && height <= 60) {
    // Split: ~28-30% for spine, rest for back
    const spineWidth = Math.round(width * 0.28);
    const backWidth = width - spineWidth;
    return { type: "wraparound", spineWidth, backWidth };
  }

  // Spine-only labels: very tall and narrow
  if (height > width * 2) {
    return { type: "spine", spineWidth: width, backWidth: 0 };
  }

  // Single/back-only labels: everything else
  return { type: "single", spineWidth: 0, backWidth: width };
}

// ============================================================================
// Default Configuration Generators
// ============================================================================

function createDefaultZones(
  count: number,
  fields: (FieldType | null)[]
): Zone[] {
  const heightPercent = Math.floor(100 / count);

  return Array.from({ length: count }, (_, i) => {
    const field = fields[i] || null;
    let fontSize = 10;

    // Set appropriate font sizes based on field type
    if (field === "barcode") fontSize = 8;
    else if (field === "author") fontSize = 9;
    else if (field === "title") fontSize = 10;
    else if (field === "publisherDate" || field === "isbn") fontSize = 8;

    return {
      id: `zone-${i + 1}`,
      heightPercent:
        i === count - 1 ? 100 - heightPercent * (count - 1) : heightPercent,
      field: field,
      fontSize: fontSize,
      alignment:
        field === "barcode" || field === "libraryName"
          ? ("center" as const)
          : ("left" as const),
      maxLength: field === "title" ? 50 : undefined,
    };
  });
}

export function createDefaultConfig(template: LabelTemplate): LabelConfig {
  const detection = detectLabelType(template);
  const config: LabelConfig = {
    templateId: template.id,
    name: "Standardkonfiguration",
    type: detection.type,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    sections: {},
  };

  if (detection.type === "wraparound") {
    // Spine section: vertical, narrow
    config.sections.spine = {
      widthMm: detection.spineWidth,
      orientation: "vertical",
      zones: createDefaultZones(3, ["author", "title", null]),
    };

    // Back section: horizontal, wider
    config.sections.back = {
      widthMm: detection.backWidth,
      orientation: "horizontal",
      zones: createDefaultZones(3, ["libraryName", "barcode", "publisherDate"]),
    };
  } else if (detection.type === "spine") {
    // Spine-only: tall vertical
    config.sections.spine = {
      widthMm: detection.spineWidth,
      orientation: "vertical",
      zones: createDefaultZones(3, ["author", "title", "barcode"]),
    };
  } else {
    // Single/back-only: horizontal
    config.sections.back = {
      widthMm: detection.backWidth,
      orientation: "horizontal",
      zones: createDefaultZones(5, [
        "libraryName",
        "title",
        "author",
        "barcode",
        "publisherDate",
      ]),
    };
  }

  return config;
}

// ============================================================================
// Configuration File Management
// ============================================================================

export function generateConfigFileName(
  templateId: string,
  configName: string = "default"
): string {
  const safeName = configName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `label-config-${templateId}-${safeName}.json`;
}

export function serializeConfig(config: LabelConfig): string {
  return JSON.stringify(config, null, 2);
}

export function parseConfig(jsonString: string): LabelConfig {
  return JSON.parse(jsonString);
}

// ============================================================================
// Validation
// ============================================================================

export function validateConfig(config: LabelConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!config.templateId) {
    errors.push("Template-ID fehlt");
  }
  if (!config.name) {
    errors.push("Konfigurationsname fehlt");
  }
  if (!config.type) {
    errors.push("Label-Typ fehlt");
  }

  // Check sections exist
  if (!config.sections.spine && !config.sections.back) {
    errors.push(
      "Mindestens eine Sektion (Rücken oder Rückseite) muss definiert sein"
    );
  }

  // Check zone percentages add up to ~100%
  const checkZonePercentages = (section: Section, name: string) => {
    const total = section.zones.reduce(
      (sum, zone) => sum + zone.heightPercent,
      0
    );
    if (Math.abs(total - 100) > 1) {
      errors.push(`${name}: Zonenhöhen ergeben ${total}% statt 100%`);
    }
  };

  if (config.sections.spine) {
    checkZonePercentages(config.sections.spine, "Rücken");
  }
  if (config.sections.back) {
    checkZonePercentages(config.sections.back, "Rückseite");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Sample Data for Preview
// ============================================================================

export interface SampleBookData {
  id: number; // Book.id (used for barcode)
  title: string; // Book.title
  subtitle?: string; // Book.subtitle
  author: string; // Book.author
  isbn?: string; // Book.isbn
  topics?: string; // Book.topics
  publisherName?: string; // Book.publisherName
  publisherDate?: string; // Book.publisherDate
  publisherLocation?: string; // Book.publisherLocation
  editionDescription?: string; // Book.editionDescription
  libraryName: string; // From settings (SCHOOL_NAME env var)
}

export const SAMPLE_BOOKS: SampleBookData[] = [
  {
    id: 1234,
    title: "Harry Potter und der Stein der Weisen",
    subtitle: "Band 1",
    author: "Rowling, J.K.",
    isbn: "9783551551672",
    topics: "Fantasy;Magie;Abenteuer",
    publisherName: "Carlsen Verlag",
    publisherDate: "1998",
    publisherLocation: "Hamburg",
    editionDescription: "1. Auflage",
    libraryName: "Grundschule Mammolshain",
  },
  {
    id: 5678,
    title: "Die unendliche Geschichte",
    author: "Ende, Michael",
    isbn: "9783522128001",
    topics: "Fantasy;Abenteuer",
    publisherName: "Thienemann Verlag",
    publisherDate: "1979",
    publisherLocation: "Stuttgart",
    libraryName: "Grundschule Mammolshain",
  },
  {
    id: 9012,
    title: "Das magische Baumhaus - Im Tal der Dinosaurier",
    subtitle: "Band 1",
    author: "Osborne, Mary Pope",
    isbn: "9783785555026",
    topics: "Abenteuer;Geschichte",
    publisherName: "Loewe Verlag",
    publisherDate: "2000",
    publisherLocation: "Bindlach",
    libraryName: "Grundschule Mammolshain",
  },
];

export function getFieldValue(
  book: SampleBookData,
  field: FieldType | null
): string {
  if (!field || field === "none") return "";

  switch (field) {
    case "libraryName":
      return book.libraryName;
    case "title":
      return book.title;
    case "subtitle":
      return book.subtitle || "";
    case "author":
      return book.author;
    case "barcode":
      // Format book ID with leading zeros for barcode
      return book.id.toString().padStart(8, "0");
    case "isbn":
      return book.isbn || "";
    case "topics":
      // Return first topic only
      return book.topics ? book.topics.split(";")[0] : "";
    case "publisherName":
      return book.publisherName || "";
    case "publisherDate":
      return book.publisherDate || "";
    case "publisherLocation":
      return book.publisherLocation || "";
    case "editionDescription":
      return book.editionDescription || "";
    case "customText":
      return "Eigener Text";
    default:
      return "";
  }
}
