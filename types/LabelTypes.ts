/**
 * Label Configuration Types for OpenLibry
 */

// ============================================================================
// Template Types (from label-templates.json)
// ============================================================================

export interface SheetLayout {
  width: number;
  height: number;
  marginTop: number;
  marginLeft: number;
  rows: number;
  columns: number;
  spacingHorizontal: number;
  spacingVertical: number;
}

export interface LabelDimensions {
  width: number;
  height: number;
}

export interface LabelTemplate {
  id: string;
  name: string;
  productCode: string;
  description: string;
  sheet: SheetLayout;
  label: LabelDimensions;
  labelType?: 'wraparound' | 'single' | 'spine';
  sections?: {
    spine?: {
      widthMm: number;
      orientation: 'vertical';
    };
    back?: {
      widthMm: number;
      orientation: 'horizontal';
    };
  };
}

export interface LabelTemplatesConfig {
  version: string;
  description: string;
  templates: LabelTemplate[];
}

// ============================================================================
// Configuration Types (user's saved configuration)
// ============================================================================

export type FieldType =
  | 'none'
  | 'libraryName'          // From environment/settings, not Book model
  | 'title'                // Book.title
  | 'subtitle'             // Book.subtitle
  | 'author'               // Book.author
  | 'barcode'              // Book.id (formatted as barcode)
  | 'isbn'                 // Book.isbn
  | 'topics'               // Book.topics (first topic)
  | 'publisherName'        // Book.publisherName
  | 'publisherDate'        // Book.publisherDate
  | 'publisherLocation'    // Book.publisherLocation
  | 'editionDescription'   // Book.editionDescription
  | 'customText';

export type Alignment = 'left' | 'center' | 'right' | 'top' | 'bottom';

export interface Zone {
  id: string;
  heightPercent: number;
  field: FieldType | null;
  fontSize?: number;
  alignment?: Alignment;
  maxLength?: number;
}

export interface Section {
  widthMm: number;
  orientation: 'vertical' | 'horizontal';
  zones: Zone[];
}

export interface LabelConfig {
  templateId: string;
  name: string;
  type: 'wraparound' | 'single' | 'spine';
  created?: string;
  modified?: string;
  sections: {
    spine?: Section;
    back?: Section;
  };
}

// ============================================================================
// Field Definitions
// ============================================================================

export interface FieldDefinition {
  id: FieldType;
  label: string;
  description: string;
  defaultFontSize: number;
  minFontSize: number;
  maxFontSize: number;
  recommendedFor: ('spine' | 'back' | 'single')[];
}

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    id: 'none',
    label: '(Leer)',
    description: 'Keine Anzeige',
    defaultFontSize: 10,
    minFontSize: 6,
    maxFontSize: 18,
    recommendedFor: ['spine', 'back', 'single']
  },
  {
    id: 'libraryName',
    label: 'Bibliotheksname',
    description: 'Name der Schulbibliothek (aus Einstellungen)',
    defaultFontSize: 10,
    minFontSize: 8,
    maxFontSize: 14,
    recommendedFor: ['back', 'single']
  },
  {
    id: 'title',
    label: 'Titel',
    description: 'Buchtitel',
    defaultFontSize: 10,
    minFontSize: 7,
    maxFontSize: 14,
    recommendedFor: ['spine', 'back', 'single']
  },
  {
    id: 'subtitle',
    label: 'Untertitel',
    description: 'Buch-Untertitel',
    defaultFontSize: 9,
    minFontSize: 7,
    maxFontSize: 12,
    recommendedFor: ['back', 'single']
  },
  {
    id: 'author',
    label: 'Autor',
    description: 'Autor/Verfasser',
    defaultFontSize: 9,
    minFontSize: 7,
    maxFontSize: 12,
    recommendedFor: ['spine', 'back', 'single']
  },
  {
    id: 'barcode',
    label: 'Barcode',
    description: 'Scannbarer Barcode (Buch-ID)',
    defaultFontSize: 8,
    minFontSize: 6,
    maxFontSize: 10,
    recommendedFor: ['back', 'single']
  },
  {
    id: 'isbn',
    label: 'ISBN',
    description: 'ISBN-Nummer',
    defaultFontSize: 8,
    minFontSize: 6,
    maxFontSize: 10,
    recommendedFor: ['back', 'single']
  },
  {
    id: 'topics',
    label: 'Thema',
    description: 'Erstes Thema/Kategorie',
    defaultFontSize: 9,
    minFontSize: 7,
    maxFontSize: 12,
    recommendedFor: ['spine', 'back', 'single']
  },
  {
    id: 'publisherName',
    label: 'Verlag',
    description: 'Name des Verlags',
    defaultFontSize: 8,
    minFontSize: 6,
    maxFontSize: 10,
    recommendedFor: ['back', 'single']
  },
  {
    id: 'publisherDate',
    label: 'Erscheinungsjahr',
    description: 'Erscheinungsdatum/Jahr',
    defaultFontSize: 8,
    minFontSize: 6,
    maxFontSize: 10,
    recommendedFor: ['spine', 'back', 'single']
  },
  {
    id: 'publisherLocation',
    label: 'Erscheinungsort',
    description: 'Ort der Veröffentlichung',
    defaultFontSize: 8,
    minFontSize: 6,
    maxFontSize: 10,
    recommendedFor: ['back', 'single']
  },
  {
    id: 'editionDescription',
    label: 'Ausgabe',
    description: 'Ausgabebezeichnung',
    defaultFontSize: 8,
    minFontSize: 6,
    maxFontSize: 10,
    recommendedFor: ['back', 'single']
  },
  {
    id: 'customText',
    label: 'Eigener Text',
    description: 'Benutzerdefinierter Text',
    defaultFontSize: 9,
    minFontSize: 6,
    maxFontSize: 14,
    recommendedFor: ['spine', 'back', 'single']
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getFieldDefinition(fieldId: FieldType): FieldDefinition {
  return FIELD_DEFINITIONS.find(f => f.id === fieldId) || FIELD_DEFINITIONS[0];
}

export function calculateLabelPosition(
  template: LabelTemplate,
  index: number
): { top: number; left: number; row: number; column: number } {
  const row = Math.floor(index / template.sheet.columns);
  const column = index % template.sheet.columns;

  const top =
    template.sheet.marginTop +
    row * template.label.height +
    row * template.sheet.spacingVertical;

  const left =
    template.sheet.marginLeft +
    column * template.label.width +
    column * template.sheet.spacingHorizontal;

  return { top, left, row, column };
}
