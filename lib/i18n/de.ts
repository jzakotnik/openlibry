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
    searchBookPlaceholder: "Suche Buch",
    searchUserPlaceholder: "Nutzer suchen",
    clearSearch: "Suche löschen",
    searchBooksAria: "search books",
    searchUsersAria: "search users",

    extend: "Verlängern",
    extendAria: "extend",
    maxExtensionReached: "Maximale Ausleihzeit erreicht",
    return: "Zurückgeben",
    returnAria: "zurückgeben",
    rent: "Ausleihen",
    rentAria: "ausleihen",

    noUsersFound: "Keine NutzerInnen gefunden",
    cancelSelection: "Auswahl aufheben",
    searchSettings: "Sucheinstellungen",
    searchSettingsAria: "search-settings",

    bookSingular: "Buch",
    bookPlural: "Bücher",

    userMetaPrefix: "Nr.",
    userMetaGrade: "Klasse",

    noBorrowedBooks: "Keine ausgeliehenen Bücher",

    bookNumberPrefix: "Nr.",
    bookRentedUntil: "ausgeliehen bis",
    bookRentedTo: "an",
    rentalUntilPrefix: "bis",
    renewalCountSuffix: "x verlängert",

    toastAlreadyRented: "Buch {bookId} ist bereits ausgeliehen",
    toastBookNotFound: "Buch {bookId} nicht gefunden",
  },
  rentSearchParams: {
    overdue: "Überfällig",
    grade: "Klasse",
  },
  rentalPage: {
    serverReachableButFailed:
      "Leider hat es nicht geklappt, der Server ist aber erreichbar",
    serverUnreachable:
      "Server ist leider nicht erreichbar. Alles OK mit dem Internet?",

    bookReturned: "Buch - {title} - zurückgegeben",
    bookAlreadyMaxExtended:
      "Buch - {title} - ist bereits bis zum maximalen Ende ausgeliehen",
    bookExtended: "Buch - {title} - verlängert",
    bookRented: "Buch {title} ausgeliehen",
  },

  // ── Phase 4b additions ────────────────────────────────────────────────
  bookSearchBar: {
    placeholder: "Buch suchen…",
    ariaLabel: "search books",
    toggleView: "Ansicht wechseln",
    newBook: "Neues Buch erzeugen",
    importMany: "Viele Bücher importieren",
  },
  userSearchBar: {
    placeholder: "Suche nach Name oder ID...",
    ariaLabel: "search users",
    searchSettings: "Sucheinstellungen",
    cancelSelection: "Auswahl aufheben",
    selectAll: "Alle auswählen",
    newUser: "Neue Nutzerin erzeugen",
    selected: "ausgewählt",
    deselect: "Aufheben",
    actions: "Aktionen",
    increaseGrade: "Klasse erhöhen",
    deleteUsers: "Nutzer löschen",
    confirmDelete: "Wirklich löschen?",
  },
  userSearchFilters: {
    filter: "Filter",
    active: "Aktiv",
    reset: "Zurücksetzen",
    resetTooltip: "Filter zurücksetzen",
    status: "Status",
    onlyOverdue: "Nur überfällige",
    grade: "Klasse",
    allGrades: "Alle Klassen",
    overdueChip: "Überfällig",
    gradeChipPrefix: "Klasse",
  },
  userAdminList: {
    noUsersSearch: "Keine Benutzer gefunden",
    noUsersEmpty: "Noch keine Benutzer vorhanden",
    tryDifferentSearch: "Versuche einen anderen Suchbegriff",
    createNewToBegin: "Erstelle einen neuen Benutzer um zu beginnen",
    booksRentedSingular: "Buch ausgeliehen",
    booksRentedPlural: "Bücher ausgeliehen",
    hasOverdue: "Hat überfällige Bücher",
    metaPrefix: "Nr.",
    gradePrefix: "Klasse",
    rentalSection: "Ausgeliehene Bücher",
    noBorrowedBooks: "Keine ausgeliehenen Bücher",
    edit: "Editieren",
    printUserLabel: "Benutzerlabel drucken",
  },
  newUserDialog: {
    title: "Neue Nutzerin erstellen",
    subtitle: "Benutzer zur Bibliothek hinzufügen",
    autoBadge: "Auto",
    autoIdLabel: "Automatische ID",
    autoIdHint: "Nächste verfügbare Nummer wird automatisch vergeben",
    userIdLabel: "Nutzer-ID",
    cancel: "Abbrechen",
    create: "Erstellen",
  },
  userEditForm: {
    bookSingular: "Buch",
    bookPlural: "Bücher",
    overdue: "überfällig",
    metaPrefix: "Nr.",
    gradePrefix: "Klasse",
    sectionPersonalData: "Daten",
    fieldFirstName: "Vorname",
    fieldLastName: "Nachname",
    fieldGrade: "Klasse",
    fieldTeacher: "Lehrkraft",
    fieldCreatedAt: "Erzeugt am",
    fieldLastUpdated: "Letztes Update",
    createdAtValue: "User erstellt am {date} mit Ausweisnummer {id}",
    activeLabel: "Aktiv",
    activeHintActive: "Benutzer kann Bücher ausleihen",
    activeHintInactive: "Benutzer ist deaktiviert",
    sectionBorrowedBooks: "Geliehene Bücher",
    noBorrowedBooks: "Keine ausgeliehenen Bücher",
    idNotFound: "ID nicht gefunden",
    alreadyReturned: "Bereits zurückgegeben",
    return: "Zurückgeben",
    extend: "Verlängern",
    edit: "Editieren",
    cancel: "Abbrechen",
    save: "Speichern",
    print: "Drucken",
    delete: "Löschen",
  },
  bookEditForm: {
    save: "Speichern",
    saving: "Speichert...",
    saveTitleNew: "Buch erstellen und speichern",
    saveTitleExisting: "Speichern",
    cancel: "Abbrechen",
    cancelTitle: "Abbrechen und zurück zur Übersicht",
    delete: "Löschen",
    sectionIsbn: "ISBN & Stammdaten",
    sectionBookData: "Stammdaten des Buchs",
    sectionPublisher: "Verlag & Ausgabe",
    sectionRentalStatus: "Ausleih-Status",
    sectionMore: "Weitere Angaben",
    autofill: "Ausfüllen",
    autofillSearching: "Sucht...",
    autofillTitle:
      "Stammdaten und Cover mit ISBN suchen (DNB, Google Books, OpenLibrary)",
    fetchCover: "Cover",
    fetchCoverLoading: "Lädt...",
    fetchCoverTitle: "Cover von ISBN laden (OpenLibrary)",
    statusLabel: "Status",
    renewalsLabel: "Verlängerungen",
    coverPreviewAlt: "Cover Vorschau",
    coverImageAlt: "cover image",
    coverPlaceholderInitial: "ISBN eingeben und 'Ausfüllen' klicken",
    coverSearching: "Cover wird gesucht...",
    coverNotFound: "Kein Cover gefunden",
    coverWillUpload: "✓ Cover wird beim Speichern hochgeladen",
    coverUploadAfterSave: "Cover kann nach Speichern manuell hochgeladen werden",
    antolinLabel: "Antolin:",
    antolinPlaceholder: "...",
    antolinManyFound: " {count} ähnliche Bücher",
    antolinNoneFound: " Kein Buch gefunden",
    antolinOneFound: " Ein Buch gefunden",
    toastEnterIsbn: "Bitte geben Sie eine ISBN ein.",
    toastIsbnInvalid: "Die ISBN ist ungültig (keine Zahlen gefunden).",
    toastIsbnInvalidShort: "Die ISBN ist ungültig.",
    toastNoIsbn: "Keine ISBN im Buch hinterlegt.",
    toastSaveFirst: "Buch muss zuerst gespeichert werden.",
    toastIsbnNotFound: "Stammdaten wurden leider nicht gefunden mit dieser ISBN.",
    toastDataAndCoverLoaded: "Stammdaten und Cover wurden erfolgreich geladen.",
    toastDataLoaded: "Stammdaten wurden erfolgreich ausgefüllt.",
    toastDataLoadError: "Fehler beim Laden der Buchdaten.",
    toastCoverLoaded: "Cover wurde erfolgreich von {source} geladen.",
    toastCoverSourceUnknown: "unbekannt",
    toastCoverNotFound: "Cover konnte nicht gefunden werden.",
    toastCoverLoadError: "Fehler beim Laden des Covers.",
  },
  bookSelect: {
    renewalNone: "Nicht verlängert",
    renewalCountFormat: "{n}x verlängert",
  },
  userPage: {
    toastUserCreateFailed:
      "Neuer User konnte nicht erzeugt werden. Ist die Nutzer ID schon vorhanden?",
    toastGradeIncreased: "Klassenstufe für Schüler erhöht",
    toastUsersDeleted: "Schüler erfolgreich gelöscht",
  },
  userDetailPage: {
    idNotFound: "ID nicht gefunden",
    toastUserSaved: "Nutzer {firstName} {lastName} gespeichert",
    toastBookReturned: "Buch zurückgegeben, super!",
    toastBookAlreadyMaxExtended:
      "Buch - {title} - ist bereits bis zum maximalen Ende ausgeliehen",
    toastServerReachableButFailed:
      "Leider hat es nicht geklappt, der Server ist aber erreichbar",
    toastBookExtended: "Buch verlängert, super!",
    toastUserDeleted: "Nutzer gelöscht!",
  },
  bookPage: {
    toastCreateNewBook: "Neues Buch erstellen - bitte Daten eingeben oder ISBN scannen",
    toastBookReturned: "Buch zurückgegeben",
    toastReturnError: "Fehler beim Zurückgeben des Buches",
    loadMore: "Weitere Bücher...",
  },
};

/**
 * Structural type derived from the German dictionary. All other locale
 * files import and satisfy this type.
 */
export type Dictionary = typeof de;
