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
  app: {
    title: "OpenLibry Bibliothek",
  },
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
  home: {
    chooseSection: "Wähle einen Bereich um zu starten",
  },
  rental: {
    // ── Search fields ───────────────────────────────────────────────────
    searchBookPlaceholder: "Suche Buch",
    searchUserPlaceholder: "Nutzer suchen",
    clearSearch: "Suche löschen",
    searchBooksAria: "search books",
    searchUsersAria: "search users",

    // ── Actions (tooltips + aria-labels) ────────────────────────────────
    extend: "Verlängern",
    extendAria: "extend",
    maxExtensionReached: "Maximale Ausleihzeit erreicht",
    return: "Zurückgeben",
    returnAria: "zurückgeben",
    rent: "Ausleihen",
    rentAria: "ausleihen",

    // ── User list ──────────────────────────────────────────────────────
    noUsersFound: "Keine NutzerInnen gefunden",
    cancelSelection: "Auswahl aufheben",
    searchSettings: "Sucheinstellungen",
    searchSettingsAria: "search-settings",

    // Book counts shown after a user name (singular/plural)
    bookSingular: "Buch",
    bookPlural: "Bücher",

    // User meta row: "Nr. {id}, Klasse {grade}"
    userMetaPrefix: "Nr.",
    userMetaGrade: "Klasse",

    // ── Book list ──────────────────────────────────────────────────────
    noBorrowedBooks: "Keine ausgeliehenen Bücher",

    // Book item details row:
    //   "Nr. {id} — ausgeliehen bis {date} an {name}"
    //   "bis {date}, {n}x verlängert"
    bookNumberPrefix: "Nr.",
    bookRentedUntil: "ausgeliehen bis",
    bookRentedTo: "an",
    rentalUntilPrefix: "bis",
    renewalCountSuffix: "x verlängert",

    // ── Toasts (BookRentalList inline) ─────────────────────────────────
    toastAlreadyRented: "Buch {bookId} ist bereits ausgeliehen",
    toastBookNotFound: "Buch {bookId} nicht gefunden",
  },
  rentSearchParams: {
    overdue: "Überfällig",
    grade: "Klasse",
  },
  rentalPage: {
    // ── Server / network errors ─────────────────────────────────────────
    serverReachableButFailed:
      "Leider hat es nicht geklappt, der Server ist aber erreichbar",
    serverUnreachable:
      "Server ist leider nicht erreichbar. Alles OK mit dem Internet?",

    // ── Action result toasts ────────────────────────────────────────────
    bookReturned: "Buch - {title} - zurückgegeben",
    bookAlreadyMaxExtended:
      "Buch - {title} - ist bereits bis zum maximalen Ende ausgeliehen",
    bookExtended: "Buch - {title} - verlängert",
    bookRented: "Buch {title} ausgeliehen",
  },
};

/**
 * Structural type derived from the German dictionary. All other locale
 * files import and satisfy this type.
 */
export type Dictionary = typeof de;
