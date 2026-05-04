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

  // ── Phase 5 additions: authentication pages ──────────────────────────
  authError: {
    pageTitle: "Anmeldefehler | OpenLibry",
    heading: "Anmeldung fehlgeschlagen",
    errorCodePrefix: "Fehlercode:",
    backToLogin: "Zurück zur Anmeldung",
    codes: {
      Signin: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
      OAuthSignin: "Fehler beim Aufbau der OAuth-Verbindung.",
      OAuthCallback: "Fehler bei der OAuth-Rückgabe.",
      OAuthCreateAccount: "OAuth-Konto konnte nicht erstellt werden.",
      EmailCreateAccount: "E-Mail-Konto konnte nicht erstellt werden.",
      Callback: "Fehler bei der Rückrufverarbeitung.",
      OAuthAccountNotLinked:
        "Diese E-Mail ist bereits mit einem anderen Konto verknüpft.",
      CredentialsSignin: "Benutzername oder Passwort ist falsch.",
      SessionRequired: "Bitte melden Sie sich an, um fortzufahren.",
      Default: "Ein unbekannter Fehler ist aufgetreten.",
    },
  },
  login: {
    pageTitle: "Login | OpenLibry",
    heading: "Login zu OpenLibry",
    subtitle: "Bitte melden Sie sich an",
    labelUsername: "Benutzername",
    labelPassword: "Passwort",
    placeholderUsername: "Benutzername eingeben",
    placeholderPassword: "Passwort eingeben",
    submitting: "Wird angemeldet…",
    submit: "Einloggen",
    errorFailed: "Login fehlgeschlagen. Bitte Eingaben prüfen.",
    errorConnection: "Verbindungsfehler. Bitte erneut versuchen.",
  },
  register: {
    pageTitle: "Registrieren | OpenLibry",
    heading: "Neuen Benutzer erzeugen",
    subtitle: "Admin-Zugang für OpenLibry erstellen",
    labelUsername: "Benutzername",
    labelEmail: "E-Mail",
    labelPassword: "Passwort",
    labelPasswordConfirm: "Passwort wiederholen",
    placeholderUsername: "Benutzername eingeben",
    placeholderEmail: "E-Mail eingeben",
    placeholderPassword: "Mindestens 3 Zeichen",
    placeholderPasswordConfirm: "Passwort bestätigen",
    passwordTooShort: "Passwort muss mindestens 3 Zeichen lang sein",
    passwordMismatch: "Passwörter stimmen nicht überein",
    submitting: "Wird erstellt…",
    submit: "Benutzer erzeugen",
    errorCreate: "Fehler beim Erstellen ({status})",
    errorUnknown: "Unbekannter Fehler. Bitte erneut versuchen.",
  },

  // ─── Phase 6: admin settings page ─────────────────────────────────────
  admin: {
    pageTitle: "Konfiguration | OpenLibry",
    backToAdmin: "Zurück zur Administration",
    heading: "Konfiguration",
    subheading:
      "Einstellungen für die .env-Datei zusammenstellen und herunterladen",

    infoBanner: {
      title: "Wie diese Seite funktioniert",
      bodyP1: "Hier kannst du eine ",
      bodyCode: ".env",
      bodyP2:
        "-Datei zusammenstellen. Alle Eingaben bleiben lokal im Browser — es wird ",
      bodyStrong: "nichts gespeichert oder gesendet",
      bodyP3:
        ". Lade die fertige Datei herunter und lege sie im OpenLibry-Verzeichnis ab. Danach OpenLibry neu starten.",
      bareMetalCmd: "Bare Metal: pm2 restart openlibry",
      dockerCmd: "Docker: docker restart openlibry",
    },

    preview: {
      title: "Vorschau: .env",
      copyDone: "Kopiert!",
      copyAction: "In Zwischenablage",
    },

    stickyBar: {
      varCount: "{count} Variablen konfiguriert",
      reset: "Zurücksetzen",
      download: ".env herunterladen",
    },

    sectionCard: {
      hintTooltip: "Hinweis anzeigen",
      showAdvancedSingular: "{n} erweiterte Einstellung anzeigen",
      showAdvancedPlural: "{n} erweiterte Einstellungen anzeigen",
      hideAdvanced: "Erweiterte Einstellungen ausblenden",
    },

    passwordField: {
      placeholder: "Zufälligen Wert eingeben oder generieren...",
      hide: "Verbergen",
      show: "Anzeigen",
      copy: "Kopieren",
      copied: "Kopiert!",
      copyTitle: "In Zwischenablage kopieren",
      generate: "Generieren",
      generateTitle: "Sicheren Zufallswert erzeugen",
      strength: "✓ {chars} Zeichen — stark genug",
    },

    envHeaders: {
      technical: "🔧 TECHNISCHE KONFIGURATION",
      school: "🏫 SCHULKONFIGURATION",
      reminder: "📧 MAHNWESEN",
      userlabels: "🆔 BENUTZERAUSWEISE",
    },

    units: {
      days: "Tage",
      seconds: "Sekunden",
    },

    placeholders: {
      schoolName: "Mustermann Schule",
      reminderName: "Schulbücherei",
    },

    sections: {
      technical: {
        title: "Technische Konfiguration",
        description: "Datenbankverbindung, Authentifizierung und Serverpfade",
        fields: {
          DATABASE_URL: {
            label: "Datenbankpfad",
            description:
              "Pfad zur SQLite-Datenbankdatei. Relativ zum Anwendungsverzeichnis.",
            hint: "Beispiel: file:./database/dev.db — der Ordner muss existieren und beschreibbar sein.",
          },
          NEXTAUTH_URL: {
            label: "Anwendungs-URL",
            description:
              "Vollständige URL der Anwendung, wie sie im Browser aufgerufen wird. Wird für Login-Weiterleitungen benötigt.",
            hint: "Für lokale Installation: http://localhost:3000. Mit nginx: https://bibliothek.schule.de",
          },
          NEXTAUTH_SECRET: {
            label: "Sicherheitsschlüssel (Secret)",
            description:
              "Zufälliger geheimer Schlüssel für die Verschlüsselung von Sessions und Tokens.",
            hint: "Mindestens 32 Zeichen. Einmal gesetzt nicht mehr ändern — alle Nutzer werden sonst ausgeloggt. Tipp: pwgen 32 1",
          },
          AUTH_ENABLED: {
            label: "Authentifizierung aktiviert",
            description:
              "Legt fest, ob ein Login erforderlich ist. Nur während der Einrichtung deaktivieren.",
            hint: "⚠️ Im Schulbetrieb immer auf true setzen!",
          },
          COVERIMAGE_FILESTORAGE_PATH: {
            label: "Pfad für Cover-Bilder",
            description:
              "Verzeichnis, in dem hochgeladene Buchcover gespeichert werden.",
            hint: "In Docker: /app/images (im Container). Ohne Docker: z.B. ./images",
          },
          LOGIN_SESSION_TIMEOUT: {
            label: "Session-Timeout",
            description:
              "Zeit in Sekunden bis zur automatischen Abmeldung bei Inaktivität.",
          },
          MAX_MIGRATION_SIZE: {
            label: "Max. Import-Dateigröße",
            description:
              "Maximale Dateigröße für JSON-Importe (z.B. OpenBiblio-Migration).",
          },
          SECURITY_HEADERS: {
            label: "Sicherheits-Header",
            description:
              "Steuert Content-Security-Policy-Header. Im Produktionsbetrieb leer lassen.",
            hint: 'Nur "insecure" setzen wenn CSP-Header deaktiviert werden sollen (nicht empfohlen).',
            options: {
              active: "Aktiv (Standard, empfohlen)",
              insecure: "Deaktiviert (nur Entwicklung)",
            },
          },
          DELETE_SAFETY_SECONDS: {
            label: "Lösch-Verzögerung",
            description:
              "Wartezeit in Sekunden bevor ein Buch/Nutzer endgültig gelöscht wird. Gibt Zeit zum Abbrechen.",
          },
          RENTAL_SORT_BOOKS: {
            label: "Sortierung Ausleihansicht",
            description:
              "Standardmäßige Sortierreihenfolge der Bücher in der Ausleih-Ansicht.",
            options: {
              title_asc: "Titel A–Z",
              title_desc: "Titel Z–A",
              id_asc: "ID aufsteigend",
              id_desc: "ID absteigend",
            },
          },
          BARCODE_MINCODELENGTH: {
            label: "Minimale Barcode-Länge",
            description:
              "Kürzere Barcodes werden mit Leerzeichen aufgefüllt bis diese Länge erreicht ist.",
          },
          ADMIN_BUTTON_SWITCH: {
            label: "Admin-Schaltfläche anzeigen",
            description: "Zeigt den Backup-Button in der Navigationsleiste an.",
            options: {
              show: "Anzeigen",
              hide: "Ausblenden",
            },
          },
          NUMBER_BOOKS_OVERVIEW: {
            label: "Bücher pro Seite",
            description: "Anzahl der Bücher pro Seite in der Übersichtsliste.",
          },
          NUMBER_BOOKS_MAX: {
            label: "Maximale Buchanzahl",
            description:
              "Erwartete maximale Anzahl Bücher in der Bibliothek. Beeinflusst Suche und Paginierung.",
          },
        },
      },
      school: {
        title: "Schulkonfiguration",
        description: "Name, Logo, Ausleihfristen und Etiketten",
        fields: {
          SCHOOL_NAME: {
            label: "Schulname",
            description:
              "Vollständiger Name der Schule — wird in der Oberfläche, auf Ausweisen, Etiketten und in Berichten angezeigt.",
            hint: 'Beispiel: "Grundschule Mammolshain"',
          },
          LOGO_LABEL: {
            label: "Schul-Logo (Dateiname)",
            description:
              "Dateiname des Schullogos im public/-Verzeichnis. Wird auf Benutzerausweisen und in der UI verwendet.",
            hint: "Datei muss in /public liegen (Bare Metal) oder in database/custom/ (Docker).",
          },
          RENTAL_DURATION_DAYS: {
            label: "Leihfrist",
            description:
              "Standardmäßige Ausleihdauer in Tagen ab dem Ausleihzeitpunkt.",
          },
          EXTENSION_DURATION_DAYS: {
            label: "Verlängerungsdauer",
            description:
              "Anzahl der Tage, um die eine Ausleihe verlängert werden kann.",
          },
          MAX_EXTENSIONS: {
            label: "Maximale Verlängerungen",
            description: "Wie oft ein Buch maximal verlängert werden darf.",
          },
          LABEL_CONFIG_DIR: {
            label: "Etiketten-Konfigurationsverzeichnis",
            description:
              "Verzeichnis für Etikettenbögen (sheets/) und Vorlagen (templates/). Etikettenbögen und Vorlagen werden als JSON-Dateien in Unterordnern gespeichert.",
            hint: "Standard: ./database/custom/labels — in Docker wird database/custom/ als Volume gemountet, sodass eigene Konfigurationen bei Updates erhalten bleiben.",
          },
        },
      },
      reminder: {
        title: "Mahnwesen",
        description: "Einstellungen für automatische Mahnschreiben",
        fields: {
          REMINDER_TEMPLATE_DOC: {
            label: "Mahnungs-Vorlage",
            description: "Dateiname der Word-Vorlage (.docx) für Mahnschreiben.",
            hint: "Datei muss in database/custom/ (Docker) oder im Anwendungsverzeichnis liegen.",
          },
          REMINDER_RESPONSIBLE_NAME: {
            label: "Verantwortliche Stelle",
            description:
              "Name der verantwortlichen Person oder Abteilung, der in Mahnschreiben erscheint.",
          },
          REMINDER_RESPONSIBLE_EMAIL: {
            label: "Kontakt-E-Mail",
            description:
              "E-Mail-Adresse die in Mahnschreiben als Rückfrage-Kontakt angegeben wird.",
          },
          REMINDER_RENEWAL_COUNT: {
            label: "Maximale Mahnungswiederholungen",
            description:
              "Wie oft eine Mahnung verlängert werden kann, bevor eine Eskalation erfolgt.",
          },
        },
      },
      userlabels: {
        title: "Benutzerausweise",
        description: "Layout und Inhalt der gedruckten Schülerausweise",
        fields: {
          USERID_LABEL_IMAGE: {
            label: "Hintergrundbild",
            description:
              "Dateiname des Hintergrundbilds für Benutzerausweise. In database/custom/ (Docker) oder public/ (Bare Metal).",
          },
          USERLABEL_WIDTH: {
            label: "Ausweis-Breite",
            description:
              "Breite eines Benutzerausweises in CSS-Einheiten. Beeinflusst die Darstellung im Browser.",
            hint: "Typische Werte: 42vw, 9cm, 400px",
          },
          USERLABEL_PER_PAGE: {
            label: "Ausweise pro Seite",
            description: "Anzahl der Benutzerausweise pro Druckseite.",
          },
          USERLABEL_SEPARATE_COLORBAR: {
            label: "Farbbalken",
            description:
              'Optionaler Farbbalken unter dem Bild. Format: [Breite, Höhe, "Farbe"]',
            hint: "CSS-Farbnamen oder Hex-Werte, z.B. lightgreen, #4caf50",
          },
          USERLABEL_LINE_1: {
            label: "Textzeile 1",
            description:
              'Erste Textzeile auf dem Ausweis. Format: ["Inhalt","top","left","Breite","margin","Farbe",Schriftgröße]',
            hint: "Platzhalter: User.firstName, User.lastName, User.schoolGrade",
          },
          USERLABEL_LINE_2: {
            label: "Textzeile 2",
            description:
              "Zweite Textzeile auf dem Ausweis (gleiche Syntax wie Zeile 1).",
          },
          USERLABEL_LINE_3: {
            label: "Textzeile 3",
            description:
              "Dritte Textzeile auf dem Ausweis (gleiche Syntax wie Zeile 1).",
          },
          USERLABEL_BARCODE: {
            label: "Barcode-Position",
            description:
              'Position und Größe des Barcodes auf dem Ausweis. Format: ["top","left","Breite","Höhe","Typ"]',
          },
        },
      },
    },
  },

  // ─── Phase 7a: reports dashboard + cards ─────────────────────────────
  formats: {
    // BCP-47 locale tag used for numeric formatting (toLocaleString).
    // German uses dot-thousands (1.000), English uses comma-thousands (1,000).
    numberLocale: "de-DE",
  },
  reportsPage: {
    cardUsers: {
      title: "Nutzerinnen",
      subtitle: "Übersicht aller NutzerInnen",
      unit: "NutzerInnen",
    },
    cardBooks: {
      title: "Bücher",
      subtitle: "Übersicht aller Bücher",
      unit: "Bücher",
    },
    cardRentals: {
      title: "Leihen",
      subtitle: "Übersicht aller Leihen",
      unit: "Leihen",
    },
    cardUserHistory: {
      title: "Ausleih-Historie",
      subtitle: "Verlauf aller Leihen nach Nutzer",
      unit: "Leihen",
    },
    cardAudit: {
      title: "Historie",
      subtitle: "Aktivitäten Bücher/User",
      unit: "Einträge",
    },
    cardUserLabels: {
      title: "Ausweise",
      subtitle: "Liste aller Ausweise",
    },
    cardReminder: {
      title: "Mahnungen",
      subtitle: "Ausdruck der Mahnungen als Word-Dokument",
    },
  },
  reportCard: {
    generateTable: "Erzeuge Tabelle",
  },
  excelCard: {
    title: "Excel",
    subtitle: "Import und Export der Daten",
    exportButton: "Export herunterladen",
    importButton: "Import hochladen",
  },
  reminderCard: {
    reminderSingular: "Mahnung",
    reminderPlural: "Mahnungen",
    modeAll: "Alle Mahnungen",
    modeNonExtendable: "Nur nicht verlängerbare",
    generate: "Erzeuge Word",
    toastNoneAll: "Keine überfälligen Ausleihen vorhanden.",
    toastNoneNonExtendable:
      "Keine nicht verlängerbaren überfälligen Ausleihen vorhanden.",
  },
  userLabelsCard: {
    countLabel: "Anzahl Etiketten",
    countTooMany: "So viele gibt es nicht?",
    idRangeHeading: "ID-Bereich",
    fromId: "Von ID",
    toId: "Bis ID",
    filtersHeading: "Filter",
    singleIdLabel: "Etikett für UserID",
    classFilterLabel: "Klassen Filter",
    classSelectPlaceholder: "Klasse auswählen…",
    classSearchPlaceholder: "Suche Klasse…",
    classNotFound: "Keine Klasse gefunden.",
    filterClear: "Filter zurücksetzen",
    generatePdf: "Erzeuge PDF",
  },
  bookLabelPrintCard: {
    title: "Buchetiketten drucken",
    description:
      "Etiketten als PDF erzeugen. Vorlage und Bogen wählen, Bücher filtern, Startposition festlegen.",
    button: "Etiketten drucken",
  },
  bookLabelEditorCard: {
    title: "Etiketten-Vorlage bearbeiten",
    description:
      "Felder zuordnen, Schriftgrößen anpassen, Buchrücken-Breite einstellen. Vorschau direkt im Browser.",
    button: "Vorlage bearbeiten",
  },

  // ─── Phase 7b1: report table pages ───────────────────────────────────
  reportTable: {
    loadError: "Fehler beim Laden der Daten: {error}",
    noData: "Keine Daten verfügbar",
    excelExport: "Excel Export",
    pdfExport: "PDF Export",
    rowsPerPage: "Zeilen pro Seite:",
    pageOfTotal: "Seite {page} von {total}",
    back: "Zurück",
  },
  reportBooksPage: {
    statusOne: "📚 {total} Buch • {rented} ausgeliehen • {available} verfügbar",
    statusMany:
      "📚 {total} Bücher • {rented} ausgeliehen • {available} verfügbar",
  },
  reportUsersPage: {
    // Two-part composition:
    //   statusBase always shown
    //   statusInactiveSuffix appended (parenthesized) when inactiveCount > 0
    statusBaseOne: "👥 {totalCount} Nutzer • {grades} Klassen",
    statusBaseMany: "👥 {totalCount} Nutzer • {grades} Klassen",
    statusInactiveSuffix: "({inactiveCount} inaktiv)",
  },
  reportRentalsPage: {
    overdueOne: "⚠ {count} Buch überfällig",
    overdueMany: "⚠ {count} Bücher überfällig",
    overdueNone: "✓ Keine überfälligen Bücher",
  },
  reportHistoryPage: {
    title: "Verlauf der Leihen",
    titleCountSuffix: "({count} Nutzer)",
    activeOnly: "Nur aktive Nutzer",
    exportError: "{action}-Export fehlgeschlagen. Bitte erneut versuchen.",
    exportScopeHint: "Export umfasst die aktuelle gefilterte Ansicht ({count} Nutzer).",
    colKlasse: "Klasse",
    colName: "Name (Suche)",
    colTotal: "Gesamt",
    colHistory: "Ausleih-Historie",
    filterAllGrades: "Alle",
    filterNamePlaceholder: "Name tippen...",
    mobileNamePlaceholder: "Name suchen…",
    mobileGradeAll: "Alle Klassen",
    noResults: "Keine Ergebnisse für diesen Filter",
    cardBooksSuffix: "Bücher",
    cardEmpty: "Keine Ausleihen",
    pdfActionExcel: "Excel",
    pdfActionPdf: "PDF",
    serverErrorLoad: "Fehler beim Laden der Ausleih-Historie",
  },
  reportAuditPage: {
    searchPlaceholder: "Suche nach Büchern, Aktionen oder Datum...",
    countSuffix: "{filtered} von {total} Einträgen",
    emptySearch: "Keine Ergebnisse gefunden",
    emptyAll: "Keine Aktivitäten verfügbar",
    // Event sentence templates — all support {bookTitle}, {bookId}, {userName}, {userId}
    sentenceRentBookFull:
      'Buch "{bookTitle}" wurde an {userName} ({userId}) ausgeliehen',
    sentenceRentBookUserId:
      'Buch "{bookTitle}" wurde an Benutzer #{userId} ausgeliehen',
    sentenceRentBookTitle: 'Buch "{bookTitle}" wurde ausgeliehen',
    sentenceRentBookId: "Buch #{bookId} wurde ausgeliehen",
    sentenceReturnBookTitle: 'Buch "{bookTitle}" wurde zurückgegeben',
    sentenceReturnBookId: "Buch #{bookId} wurde zurückgegeben",
    sentenceExtendBookTitle: 'Ausleihe von "{bookTitle}" wurde verlängert',
    sentenceExtendBookId: "Ausleihe von Buch #{bookId} wurde verlängert",
    sentenceAddBook: 'Neues Buch "{bookTitle}" wurde hinzugefügt',
    sentenceUpdateBookTitle: 'Buch "{bookTitle}" wurde aktualisiert',
    sentenceUpdateBookId: "Buch #{bookId} wurde aktualisiert",
    sentenceDeleteBook: "Buch #{bookId} wurde gelöscht",
    sentenceAddUserNamed: 'Neuer Benutzer "{userName}" wurde angelegt',
    sentenceAddUserAnon: "Neuer Benutzer wurde angelegt",
    sentenceUpdateUserNamed: 'Benutzer "{userName}" wurde aktualisiert',
    sentenceUpdateUserId: "Benutzer #{userId} wurde aktualisiert",
    sentenceDeleteUser: "Benutzer #{userId} wurde gelöscht",
    sentenceDisableUser: "Benutzer #{userId} wurde deaktiviert",
    sentenceEnableUser: "Benutzer #{userId} wurde aktiviert",
    sentenceUnknownIdMissing: "?",
  },
};

/**
 * Structural type derived from the German dictionary. All other locale
 * files import and satisfy this type.
 */
export type Dictionary = typeof de;
