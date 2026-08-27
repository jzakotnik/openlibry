import { LOCALE } from "@/lib/i18n";

/**
 * Field translations for DB-level labels — user, book, rental, and audit
 * column names plus rental status values.
 *
 * This module exports a single `translations` object whose structure
 * matches the pre-i18n version exactly. The only difference is that the
 * values are chosen at module load time based on OPENLIBRY_LOCALE.
 *
 * Keeping the export shape identical means consumers
 * (BookField, BookDateField, UserField, StatusBadge, BookSelect,
 * pages/reports/*) need no changes:
 *
 *   translations["books"][fieldType]        — still works
 *   translations.rentalStatus.available     — still works
 *   keyof typeof translations.rentalStatus  — still produces the same union
 *
 * To add new locales, add a sibling dictionary object and extend the
 * selector at the bottom.
 */

// ─────────────────────────────────────────────────────────────────────────────
// German (source of truth)
// ─────────────────────────────────────────────────────────────────────────────
const fieldTranslationsDe = {
  users: {
    createdAt: "Erstellt",
    updatedAt: "Geändert",
    id: "id",
    lastName: "Nachname",
    firstName: "Vorname",
    schoolGrade: "Klasse",
    schoolTeacherName: "Lehrende",
    eMail: "eMail",
    active: "Aktiv",
    books: "Bücher",
  },
  books: {
    createdAt: "Erstellt",
    updatedAt: "Geändert",
    id: "id",
    rentalStatus: "Ausleihstatus",
    rentedDate: "Ausleihdatum",
    dueDate: "Rückgabedatum",
    renewalCount: "Verlängert",
    title: "Titel",
    subtitle: "Untertitel",
    author: "Autor",
    topics: "Schlagworte",
    imageLink: "Bild",
    isbn: "ISBN",
    editionDescription: "Edition",
    publisherLocation: "Verlagsort",
    pages: "Seiten",
    summary: "Zusammenfassung",
    minPlayers: "Min. Spieler",
    publisherName: "Verlag",
    otherPhysicalAttributes: "Sonstige",
    supplierComment: "Beschaffung",
    publisherDate: "Publikationsdatum",
    physicalSize: "Abmessungen",
    minAge: "Min. Alter",
    maxAge: "Max. Alter",
    additionalMaterial: "Material",
    price: "Preis",
    externalLinks: "Externe Links",
  },
  rentals: {
    id: "id",
    lastName: "Nachname",
    firstName: "Vorname",
    schoolGrade: "Klasse",
    title: "Titel",
    renewalCount: "Verlängert",
    dueDate: "Rückgabe",
    remainingDays: "Verzug",
    userid: "Nutzer ID",
  },
  audits: {
    id: "Nr",
    eventType: "Aktivität",
    eventContent: "Details",
    bookid: "Mediennummer",
    userid: "Ausweisnummer",
  },
  rentalStatus: {
    available: "Verfügbar",
    rented: "Ausgeliehen",
    broken: "Beschädigt",
    presentation: "Vorführung",
    ordered: "Bestellt",
    lost: "Verloren",
    remote: "Andere Bibliothek",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// English
//
// Typed against the German object's shape so missing or extra keys fail
// the build. Note that "id", "ISBN", and "eMail" are kept as-is —
// identifiers/abbreviations that are the same across both languages.
// ─────────────────────────────────────────────────────────────────────────────
const fieldTranslationsEn: typeof fieldTranslationsDe = {
  users: {
    createdAt: "Created",
    updatedAt: "Modified",
    id: "id",
    lastName: "Last name",
    firstName: "First name",
    schoolGrade: "Grade",
    schoolTeacherName: "Teacher",
    eMail: "eMail",
    active: "Active",
    books: "Books",
  },
  books: {
    createdAt: "Created",
    updatedAt: "Modified",
    id: "id",
    rentalStatus: "Status",
    rentedDate: "Rented on",
    dueDate: "Due date",
    renewalCount: "Renewed",
    title: "Title",
    subtitle: "Subtitle",
    author: "Author",
    topics: "Topics",
    imageLink: "Image",
    isbn: "ISBN",
    editionDescription: "Edition",
    publisherLocation: "Publisher location",
    pages: "Pages",
    summary: "Summary",
    minPlayers: "Min. players",
    publisherName: "Publisher",
    otherPhysicalAttributes: "Other",
    supplierComment: "Supplier",
    publisherDate: "Publication date",
    physicalSize: "Dimensions",
    minAge: "Min. age",
    maxAge: "Max. age",
    additionalMaterial: "Accompanying material",
    price: "Price",
    externalLinks: "External links",
  },
  rentals: {
    id: "id",
    lastName: "Last name",
    firstName: "First name",
    schoolGrade: "Grade",
    title: "Title",
    renewalCount: "Renewed",
    dueDate: "Due date",
    remainingDays: "Days overdue",
    userid: "User ID",
  },
  audits: {
    id: "No.",
    eventType: "Activity",
    eventContent: "Details",
    bookid: "Media number",
    userid: "User ID",
  },
  rentalStatus: {
    available: "Available",
    rented: "Lent out",
    broken: "Damaged",
    presentation: "On display",
    ordered: "Ordered",
    lost: "Lost",
    remote: "Other library",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Locale selection
//
// Picks the active dictionary at module load. The export name and shape
// match the pre-i18n version exactly so every existing import and access
// pattern continues to work:
//
//   import { translations } from "@/entities/fieldTranslations";
//   translations["books"][fieldType]
//   translations.rentalStatus.available
//   keyof typeof translations.rentalStatus
// ─────────────────────────────────────────────────────────────────────────────
const dictionaries = {
  de: fieldTranslationsDe,
  en: fieldTranslationsEn,
};

export const translations = dictionaries[LOCALE] ?? fieldTranslationsDe;
