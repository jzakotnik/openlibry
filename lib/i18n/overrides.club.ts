/**
 * Terminology overrides applied on top of the base dictionaries when
 * `USAGE_CONTEXT=club` (see `lib/config/usageContext.ts`).
 *
 * Only keys that stay VISIBLE in club mode but reference school-specific
 * wording belong here (e.g. "Schulkonfiguration" → "Organisationskonfiguration").
 * Keys whose UI is hidden entirely in club mode (fieldGrade, colKlasse, ...)
 * need no override.
 *
 * Flat dot-path map, not a nested partial dictionary: the base dictionary
 * nests up to five levels deep, and a deep merge at the wrong depth would
 * silently drop sibling keys. A flat map has no such failure mode.
 */

import type { Locale } from "./types";

export const clubOverrides: Record<Locale, Record<string, string>> = {
  de: {
    "reportUsersPage.statusBaseOne": "👥 {totalCount} Nutzer",
    "reportUsersPage.statusBaseMany": "👥 {totalCount} Nutzer",
    "admin.sections.school.title": "Organisationskonfiguration",
    "admin.sections.school.fields.SCHOOL_NAME.label":
      "Name der Organisation",
    "admin.sections.school.fields.SCHOOL_NAME.description":
      "Vollständiger Name der Organisation — wird in der Oberfläche, auf Ausweisen, Etiketten und in Berichten angezeigt.",
    "admin.sections.school.fields.LOGO_LABEL.label": "Logo (Dateiname)",
    "admin.sections.userlabels.description":
      "Layout und Inhalt der gedruckten Ausweise",
    "admin.placeholders.schoolName": "Musterverein e.V.",
    "admin.placeholders.reminderName": "Vereinsbibliothek",
    "fieldAssigner.contentOptions.school": "Vereinsname",
  },
  en: {
    "reportUsersPage.statusBaseOne": "👥 {totalCount} user",
    "reportUsersPage.statusBaseMany": "👥 {totalCount} users",
    "admin.sections.school.title": "Organization Configuration",
    "admin.sections.school.fields.SCHOOL_NAME.label": "Organization name",
    "admin.sections.school.fields.SCHOOL_NAME.description":
      "Full name of the organization — shown in the UI, on cards, labels, and reports.",
    "admin.sections.school.fields.LOGO_LABEL.label": "Logo (filename)",
    "admin.sections.userlabels.description":
      "Layout and content of printed ID cards",
    "admin.placeholders.schoolName": "Sample Club e.V.",
    "admin.placeholders.reminderName": "Club Library",
    "fieldAssigner.contentOptions.school": "Club name",
  },
};
