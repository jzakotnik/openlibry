/**
 * German dictionary (source of truth).
 *
 * The shape of this object defines the `Dictionary` type that all other
 * locales must conform to. Keep keys stable once used; renames cascade
 * into every component.
 *
 * Strings here must match the currently-hardcoded German text in the
 * components, so setting OPENLIBRY_LOCALE=de produces identical output
 * to the pre-i18n codebase.
 */
export const de = {
  topbar: {
    brand: "OpenLibry",
    tagline: "Bibliotheksverwaltung",
    openMenu: "Navigation öffnen",
    closeMenu: "Menü schließen",
    admin: "Administration",
    logout: "Abmelden",
  },
  nav: {
    rental: {
      title: "Leihe",
      subtitle: "Entleihe und Rückgabe",
    },
    user: {
      title: "Nutzer",
      subtitle: "Verwaltung der User",
    },
    book: {
      title: "Bücher",
      subtitle: "Bestand aller Medien",
    },
    reports: {
      title: "Reports",
      subtitle: "Überblick über Bestand",
    },
  },
};

/**
 * Structural type derived from the German dictionary. All other locale
 * files import and satisfy this type.
 */
export type Dictionary = typeof de;
