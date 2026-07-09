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
  holdButton: {
    deleteLabel: "Löschen",
    tooltip: "Zum Ausführen gedrückt halten",
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
    showingFirst: "Mehr Ergebnisse vorhanden",

    // Status badge shown in the rental list for books that are neither
    // "available" nor "rented" (no valid rental to extend/return).
    // Wording mirrors pdfBooks.status* so labels stay consistent between
    // the rental screen and the printed stock report.
    statusBroken: "Beschädigt",
    statusPresentation: "Vorführung",
    statusOrdered: "Bestellt",
    statusLost: "Verloren",
    statusRemote: "Andere Bibliothek",
    statusUnknown: "Unbekannter Status ({status})",
    statusBadgeAria: "Status: {status}",
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
    showingFirst: "Mehr Ergebnisse vorhanden",
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
    coverUploadAfterSave:
      "Cover kann nach Speichern manuell hochgeladen werden",
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
    toastIsbnNotFound:
      "Stammdaten wurden leider nicht gefunden mit dieser ISBN.",
    toastDataAndCoverLoaded: "Stammdaten und Cover wurden erfolgreich geladen.",
    toastDataLoaded: "Stammdaten wurden erfolgreich ausgefüllt.",
    toastDataLoadError: "Fehler beim Laden der Buchdaten.",
    toastCoverLoaded: "Cover wurde erfolgreich von {source} geladen.",
    toastCoverSourceUnknown: "unbekannt",
    toastCoverNotFound: "Cover konnte nicht gefunden werden.",
    toastCoverLoadError: "Fehler beim Laden des Covers.",
    openCameraScanner: "Kamera-Scanner öffnen",
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
    toastCreateNewBook:
      "Neues Buch erstellen - bitte Daten eingeben oder ISBN scannen",
    toastBookReturned: "Buch zurückgegeben",
    toastReturnError: "Fehler beim Zurückgeben des Buches",
    loadMore: "Weitere Bücher...",
    isbnCopies: "{{count}} Exemplare mit dieser ISBN",
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
          OPENLIBRY_LOCALE: {
            label: "Sprache (Server)",
            description:
              "Sprache für serverseitige Texte, Berichte und Fehlermeldungen.",
            hint: "Muss mit NEXT_PUBLIC_OPENLIBRY_LOCALE übereinstimmen.",
            options: { de: "Deutsch", en: "English" },
          },
          NEXT_PUBLIC_OPENLIBRY_LOCALE: {
            label: "Sprache (Browser)",
            description: "Sprache für die Benutzeroberfläche im Browser.",
            hint: "Muss mit OPENLIBRY_LOCALE übereinstimmen. Beide Variablen müssen immer denselben Wert haben.",
            options: { de: "Deutsch", en: "English" },
          },
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
          LOGIN_IMAGE: {
            label: "Hintergrundbild der Login-Seite",
            description:
              "Dateiname eines Bildes im /public-Verzeichnis, das als Hintergrund der Login-Seite verwendet wird. Leer lassen für das mitgelieferte Standardbild.",
            hint: "z.B. schule_login.jpg (die Datei muss im /public-Verzeichnis der App liegen).",
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
            description:
              "Dateiname der Word-Vorlage (.docx) für Mahnschreiben.",
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
    // BCP-47 locale tag used for time formatting (toLocaleTimeString).
    // Drives 24h vs 12h clock and separator characters.
    timeLocale: "de-DE",
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
    exportScopeHint:
      "Export umfasst die aktuelle gefilterte Ansicht ({count} Nutzer).",
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

  // ─── Phase 7b2: PDF Document content (rendered downloads) ────────────
  // Date format used for "Erstellt am" line in PDF subtitles.
  // dayjs format string — DD.MM.YYYY for German, MM/DD/YYYY for English etc.
  pdfDocs: {
    dateFormat: "DD.MM.YYYY",
    createdOn: "Erstellt am {date}",
  },
  pdfBooks: {
    titleStock: "Bestandsübersicht",
    subtitleTotal: "{total} Bücher gesamt",
    subtitleRented: " • davon {rented} ausgeliehen",
    sectionRented: "Ausgeliehene Bücher ({count})",
    sectionAvailable: "Verfügbare Bücher ({count})",
    emptyRented: "Keine Bücher ausgeliehen",
    emptyAvailable: "Keine verfügbaren Bücher",
    footer: "OpenLibry - Bestandsbericht vom {date}",

    statusRented: "Ausgeliehen",
    statusAvailable: "Verfügbar",
    statusBroken: "Beschädigt",
    statusPresentation: "Vorführung",
    statusOrdered: "Bestellt",
    statusLost: "Verloren",
    statusRemote: "Andere Bibliothek",
  },
  pdfUsers: {
    titleUsers: "Nutzerübersicht",
    subtitleTotal: "{total} Nutzer gesamt",
    subtitleInactive: " - davon {inactive} inaktiv",
    sectionActive: "Aktive Nutzer ({count})",
    sectionInactive: "Inaktive Nutzer ({count})",
    emptyActive: "Keine aktiven Nutzer",
    footer: "OpenLibry - Nutzerbericht vom {date}",
  },
  pdfRentals: {
    titleRentals: "Ausleihübersicht",
    subtitleTotal: "{total} Ausleihen gesamt",
    subtitleOverdue: " - davon {overdue} überfällig",
    sectionOverdue: "Überfällige Ausleihen ({count})",
    sectionCurrent: "Aktuelle Ausleihen ({count})",
    emptyOverdue: "Keine überfälligen Ausleihen",
    emptyCurrent: "Keine aktuellen Ausleihen",
    footer: "OpenLibry - Ausleihbericht vom {date}",
    colName: "Name",
    colDelay: "Verzug",
    // Day-count rendering inside rentals PDF.
    daysOverdueOne: "{count} Tag überfällig",
    daysOverdueMany: "{count} Tage überfällig",
    daysDueToday: "Heute fällig",
    daysRemainingOne: "noch {count} Tag",
    daysRemainingMany: "noch {count} Tage",
  },
  pdfHistory: {
    titleHistory: "Ausleih-Historie Bericht",
    subtitleTotal: "{count} Nutzer",
    colKlasse: "Klasse",
    colName: "Name",
    colTotal: "Gesamt",
    colBooks: "Bücher (Datum | ID | Titel)",
    overflowSuffix: "… und {count} weitere",
    emptyData: "Keine Daten vorhanden",
    footer: "OpenLibry • Verlauf der Leihen vom {date}",
    bookEntryIdLabel: "ID",
  },
  // Server-side error returned by /api/report/userlabels when a user-label
  // line config has invalid placeholders (e.g. missing User.firstName).
  // Visible to librarians who customize USERLABEL_LINE_* in their .env.
  userLabelsApi: {
    placeholderError: "Konfigurationsfehler in der Umgebung",
  },

  // ─── Phase 8: Excel import wizard + POST API ──────────────────────────
  // Note on wire protocol:
  //   The Excel export sheet names ("Bücherliste", "Userliste") and
  //   column header names defined in lib/utils/xlsColumnsMapping.ts are
  //   pinned to German across all locales because the import path and
  //   downstream tooling read these identifiers verbatim. Only the
  //   wizard chrome and POST-handler log messages move into i18n.
  xlsImport: {
    pageTitle: "Excel-Import | OpenLibry",
    headerTitle: "Excel-Import",
    headerSubtitle:
      "Bücher und Nutzer aus einer Excel-Datei in die Datenbank importieren",
    // Step indicators
    step1Label: "Datei laden",
    step2Label: "Prüfen & Konfigurieren",
    step3Label: "Importieren",
    // File upload card
    uploadButton: "Excel-Datei auswählen",
    uploadButtonLoading: "Laden…",
    uploadFormatHint:
      "Erwartetes Format: Excel-Datei (.xlsx) mit Blatt 1 = Bücher, Blatt 2 = User",
    uploadFormatTip:
      "Tipp: Verwenden Sie den Excel-Export als Vorlage für das korrekte Spaltenformat",
    // Data summary cards (under upload card after file is loaded)
    summaryCardBooks: "Bücher",
    summaryCardUsers: "Nutzer",
    summaryCardColumnsSuffix: "{count} Spalten",
    // Step 2 card heading
    importOptionsHeader: "Import-Optionen",
    // Import options card
    importBooksLabelWithCount: "Bücher importieren ({count} Einträge)",
    importBooksLabelEmpty: "Bücher importieren (keine Daten vorhanden)",
    importUsersLabelWithCount: "User importieren ({count} Einträge)",
    importUsersLabelEmpty: "User importieren (keine Daten vorhanden)",
    dropBeforeImportLabel: "Alle vorhandenen Daten vor Import löschen",
    // Drop warning combinations
    dropWarningPrefix: "Achtung:",
    dropWarningEntitiesBoth: "Bücher und User",
    dropWarningEntitiesBooks: "Bücher",
    dropWarningEntitiesUsers: "User",
    dropWarningSuffix:
      "in der Datenbank werden unwiderruflich gelöscht, bevor die neuen Daten eingespielt werden. Erstellen Sie vorher ein Backup!",
    selectAtLeastOneOption:
      "Bitte wählen Sie mindestens eine Import-Option mit verfügbaren Daten.",
    // Import button
    importButton: "In die Datenbank importieren",
    importButtonLoading: "Importiert…",
    // Status line under import button
    statusEntityBooks: "{count} Bücher",
    statusEntityUsers: "{count} User",
    statusEntityJoiner: " und ",
    statusSuffixWillImport: " werden importiert",
    statusSuffixWithDrop: " (mit Löschung)",
    // Result banners
    successBanner:
      "Import erfolgreich abgeschlossen! Die Daten stehen jetzt in der Bibliothek zur Verfügung.",
    errorBanner: "Import fehlgeschlagen. Prüfen Sie die Details im Log unten.",
    // Log panel
    logPanelHeader: "Import-Log",
    logEntryCount: "{count} Einträge",
    // Data preview
    previewBooksHeader: "Vorschau: Bücher",
    previewUsersHeader: "Vorschau: User",
    previewCountHint: "({total} Einträge, erste {shown} angezeigt)",
    previewEmptyBooks:
      "Keine Bücher-Daten im Excel gefunden. Stellen Sie sicher, dass das erste Arbeitsblatt die Bücherliste enthält.",
    previewEmptyUsers:
      "Keine User-Daten im Excel gefunden. Stellen Sie sicher, dass das zweite Arbeitsblatt die Userliste enthält.",
    // Preview table expand/collapse
    previewExpandLess: "Weniger anzeigen",
    previewExpandMore: "{count} weitere Zeilen",
    // Reset button
    resetButton: "Zurücksetzen",
    // Initial log message
    logInitial: "Bereit für den Import.",
    // Log messages — file load phase
    logFileInfo: "Datei: {name} ({sizeKB} KB)",
    logExcelReading: "Excel wird eingelesen…",
    logSheetsFound: "{count} Arbeitsblätter gefunden: {names}",
    logBooksRecognized:
      '{rows} Bücher mit {cols} Spalten erkannt (Blatt: "{sheetName}")',
    logUsersRecognized:
      '{rows} User mit {cols} Spalten erkannt (Blatt: "{sheetName}")',
    logSheetNoData: 'Blatt "{sheetName}" enthält keine Datenzeilen',
    logNoBooksSheet: "Kein erstes Arbeitsblatt für Bücher gefunden",
    logNoUsersSheet: "Kein zweites Arbeitsblatt für User gefunden",
    logFileLoaded: "Datei erfolgreich geladen — bereit zum Import",
    logLoadError: "Fehler beim Laden: {message}",
    // Log messages — import phase
    logImportStarted: "Datenbank-Import gestartet…",
    logDropAnnouncement: "Bestehende Daten werden vorher gelöscht",
    logImportComplete:
      "Import abgeschlossen: {books} Bücher, {users} User importiert",
    logImportUnknownError: "Unbekannter Fehler beim Import",
    logNetworkError: "Netzwerk-Fehler: {message}",
  },
  excelApi: {
    // Initial log seed (sent back to the wizard)
    logTransferStarted: "Starte den Transfer in die Datenbank",
    // Validation errors (returned in 400 responses, shown in wizard banner)
    errNoOptionSelected:
      "ERROR: Mindestens eine Import-Option (Bücher oder User) muss aktiviert sein",
    errNoBookData:
      "ERROR: Bücher-Import aktiviert, aber keine Bücher-Daten vorhanden",
    errNoUserData:
      "ERROR: User-Import aktiviert, aber keine User-Daten vorhanden",
    // Log entries from successful POST flow (shown in wizard log panel)
    logImportSettings:
      "Import-Einstellungen: Bücher={importBooks}, User={importUsers}, Vorher löschen={dropBeforeImport}",
    logHeaderRowsRemoved:
      "Header Zeilen aus Excel entfernt, damit bleiben {bookCount} Bücher und {userCount} User",
    logDropAllBooks: "Alle Bücher werden vor dem Import gelöscht",
    logDropAllUsers: "Alle User werden vor dem Import gelöscht",
    logUsersImporting: "{count} User werden importiert",
    logUsersSkipped: "User-Import übersprungen (Flag nicht gesetzt)",
    logBooksImporting: "{count} Bücher werden importiert",
    logBooksSkipped: "Bücher-Import übersprungen (Flag nicht gesetzt)",
    logTransactionCreated:
      "Transaction für alle Daten erzeugt, importiere jetzt",
    logTransactionDone: "Daten erfolgreich importiert",
    logNoData: "Keine Daten zum Importieren",
    logImportFailed: "Fehler beim Import: {error}",
  },

  // ─── Phase 9: Reminder API (docxtemplater letter generation) ──────────
  // Note on docx templates:
  //   The `mahnung-template.docx` itself remains a per-deployment file
  //   (mounted from database/custom/). The placeholders {school_name},
  //   {firstName}, {book_list}, etc. are wire-protocol identifiers and
  //   must NEVER be translated. Only the validation/error messages and
  //   status responses returned by the API endpoint move into i18n.
  //
  //   Where messages reference docxtemplater tag names like {book_list}
  //   or {firstName}, the source code passes those names brace-wrapped
  //   into the interpolation (e.g. tag: "{book_list}") so the literal
  //   braces appear in the user-visible output.
  reminderApi: {
    // Validation messages (validateTemplate())
    errUnknownTagWithSuggestion:
      "Unbekannter Platzhalter: {tag} — meinten Sie {suggestion}?",
    errUnknownTagNoSuggestion:
      "Unbekannter Platzhalter: {tag} — wird nicht ersetzt und erscheint als Text im Dokument.",
    errLoopOpenedNotClosed:
      "Schleife {loopStart} wurde geöffnet aber nicht mit {loopEnd} geschlossen.",
    errLoopEndWithoutStart:
      "Schleifenende {loopEnd} gefunden, aber kein {loopStart} davor.",
    warnNoBookListLoop:
      "Keine Bücherliste ({loopStart}...{loopEnd}) im Template gefunden. Die Mahnung wird keine Buchliste enthalten.",
    warnPlaceholderUnused:
      "Platzhalter {placeholder} ist verfügbar, wird aber nicht im Template verwendet.",
    errDryRunFailed: "Dry-Run fehlgeschlagen: {error}",
    // HTTP error responses
    errTemplateNotFound: 'Mahnungs-Vorlage "{file}" nicht gefunden.',
    errTemplateNotFoundWithHint:
      'Mahnungs-Vorlage "{file}" nicht gefunden. Bitte legen Sie die Datei unter database/custom/ oder public/ ab.',
    errTemplateValidationFailed: "Template-Validierung fehlgeschlagen.",
    errBooksNotFound: "Keine Bücher mit den angegebenen IDs gefunden.",
    errGenerationFailed: "Fehler beim Erstellen der Mahnungen.",
    errBodyMustContainBookIds:
      "Request-Body muss bookIds: number[] (nicht leer) enthalten.",
    errNoValidNumericBookIds: "Keine gültigen numerischen Buch-IDs übergeben.",
    // Status data responses (200 OK with informational message)
    statusNoRentedBooks: "Keine ausgeliehenen Bücher gefunden.",
    statusNoOverdueBooksAll:
      "Keine überfällige Bücher gefunden, die eine Mahnung erfordern.",
    statusNoOverdueBooksNonExtendable:
      "Keine nicht-verlängerbare überfällige Bücher gefunden, die eine Mahnung erfordern.",
    statusNoUsersAssigned:
      "Keine Mahnungen zu erstellen — keines der Bücher ist einem Benutzer zugeordnet.",
  },

  adminPage: {
    pageTitle: "Administration | OpenLibry",
    // Section headers
    quickActionsHeading: "Schnellaktionen",
    statisticsHeading: "Statistiken",
    systemInfoHeading: "Systeminfo",
    // Action cards
    excelBackupTitle: "Excel-Backup",
    excelBackupDescription: "Alle Daten als Excel herunterladen",
    systemHealthTitle: "System-Health",
    systemHealthDescription: "Detaillierte Systemdiagnose",
    settingsTitle: "Einstellungen",
    settingsDescription: "Konfiguration anzeigen",
    // Status banner — main "Alles in Ordnung" / "Warnungen" / "Fehler" labels
    statusOk: "Alles in Ordnung",
    statusWarning: "Warnungen vorhanden",
    statusError: "Fehler erkannt",
    // Loading / error states
    loadingSystemStatus: "Lade Systemstatus...",
    errorLoading: "Fehler beim Laden",
    // Status banner contents
    versionLine: "Version {version} · Aktualisiert: {time}",
    versionUnknown: "unbekannt",
    detailsButton: "Details anzeigen",
    // Statistics cards (4)
    statBooks: "Bücher",
    statUsers: "Nutzer",
    statActiveRentals: "Aktive Ausleihen",
    statOverdue: "Überfällig",
    // System info card — left side (memory + uptime)
    memoryUsage: "Speichernutzung",
    uptime: "Uptime",
    // System info card — right side (info rows)
    infoEnvironment: "Umgebung",
    infoNodeJs: "Node.js",
    infoPlatform: "Plattform",
    infoAuthentication: "Authentifizierung",
    badgeEnabled: "Aktiviert",
    badgeDisabled: "Deaktiviert",
    // Last activity line
    lastActivity: "Letzte Aktivität: {time}",
    // Backup error fallback
    backupErrorCreating: "Fehler beim Erstellen des Backups!",
    backupErrorDownload: "Fehler beim Backup-Download!",
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Keys to add inside the German translation dictionary (lib/i18n/de.ts)
  // Add as a top-level sibling of the existing keys, e.g. after `adminPage`.
  // ─────────────────────────────────────────────────────────────────────────────
  healthPage: {
    pageTitle: "System Health | OpenLibry",
    loading: "Lade Systemstatus...",
    errorLoading: "Fehler beim Laden",
    backButton: "Zurück zur Administration",
    refreshButton: "Aktualisieren",
    statusOk: "OK",
    statusWarning: "Warnung",
    statusError: "Fehler",
    allOk: "Alles in Ordnung",
    hasWarnings: "Warnungen vorhanden",
    hasErrors: "Fehler erkannt",
    timestamp: "Stand",
    versionUnknown: "unbekannt",
    authEnabled: "Aktiviert",
    authDisabled: "Deaktiviert",
    envLabels: {
      version: "Version",
      environment: "Umgebung",
      auth: "Authentifizierung",
      node: "Node.js",
    },
    stat: {
      memory: "Speicher belegt",
      memoryTooltip:
        "Node.js-Prozessspeicher (RSS) des Servers – nicht der gesamte Arbeitsspeicher des Betriebssystems",
      uptime: "Uptime",
      uptimeTooltip: "Laufzeit des Node.js-Prozesses seit dem letzten Neustart",
      activeRentals: "Aktive Ausleihen",
      activeRentalsTooltip: "Aktuell ausgeliehene Bücher",
      overdue: "Überfällig",
      overdueTooltip:
        "Bücher, die über das Rückgabedatum hinaus ausgeliehen sind",
    },
    memoryUsage: "Speichernutzung",
    check: {
      database: "Datenbank",
      data: "Datenbestand",
      folders: "Verzeichnisse",
      files: "Dateien",
    },
    detail: {
      exists: "✓ vorhanden",
      missing: "✗ fehlt",
      writable: ", beschreibbar",
      configured: "(konfiguriert)",
      standard: "(Standard)",
      yes: "Ja",
      no: "Nein",
      files: "Files",
    },
    detailKey: {
      path: "Pfad",
      books: "Bücher",
      users: "Nutzer",
      loginUsers: "Login-Benutzer",
      error: "Fehler",
      databaseUrl: "Datenbank-URL",
      database: "Datenbank-Ordner",
      public: "Public-Ordner",
      prisma: "Prisma-Ordner",
      covers: "Cover-Bilder",
      size: "Größe",
      sizeFormatted: "Dateigröße",
    },
    footer: {
      jsonApi: "JSON-API",
    },
  },
  // Admin account management:
  accounts: {
    pageTitle: "Admin-Konten – OpenLibry",
    heading: "Admin-Konten",
    subtitle: "Verwalte die Anmelde-Konten für OpenLibry.",
    existingAccounts: "Vorhandene Konten",
    newAccountSection: "Neues Konto anlegen",
    backToAdmin: "← Zurück zum Admin-Bereich",
    loading: "Lade Konten…",
    loadError: "Fehler beim Laden der Konten.",
    lastAccountWarning:
      "Das letzte Konto kann nicht gelöscht werden. Lege zuerst ein weiteres Konto an.",
    selfBadge: "Du",
    deleteTitle: "Konto löschen",
    editTitle: "Bearbeiten",
    confirmDeleteQuestion: "Wirklich löschen?",
    confirmDeleteYes: "Ja",
    confirmDeleteNo: "Nein",
    toastDeleted: "Konto {username} gelöscht.",
    toastDeleteError: "Fehler beim Löschen",
    toastUpdated: "Konto {username} aktualisiert.",
    toastCreated: "Neues Konto erfolgreich angelegt.",
    editForm: {
      labelUsername: "Benutzername",
      labelEmail: "E-Mail",
      labelPassword: "Neues Passwort",
      labelPasswordOptional: "(optional)",
      labelPasswordConfirm: "Passwort bestätigen",
      placeholderPassword: "Leer lassen = unverändert",
      passwordTooShort: "Mindestens 3 Zeichen erforderlich",
      passwordMismatch: "Passwörter stimmen nicht überein",
      cancel: "Abbrechen",
      save: "Speichern",
    },
    createForm: {
      toggleButton: "Neues Admin-Konto anlegen",
      heading: "Neues Konto",
      labelUsername: "Benutzername",
      labelEmail: "E-Mail",
      labelPassword: "Passwort",
      labelPasswordConfirm: "Passwort bestätigen",
      passwordTooShort: "Mindestens 3 Zeichen",
      passwordMismatch: "Passwörter stimmen nicht überein",
      cancel: "Abbrechen",
      submit: "Konto anlegen",
    },
  },
  // Two literals that previously stayed in rentals.tsx getServerSideProps
  // catch blocks. Now translated for full English-locale support.
  rentalsServerError: {
    invalidServerData: "Ungültige Daten vom Server erhalten",
    fetchFailed: "Fehler beim Laden der Ausleihdaten",
  },

  // ─── Catalog detail page ─────────────────────────────────────────────
  catalogDetailPage: {
    back: "Zurück zum Katalog",
    by: "von",
    noSummary: "Keine Beschreibung vorhanden.",
    relatedBooks: "Ähnliche Bücher",
    noRelatedBooks: "Keine ähnlichen Bücher gefunden.",
    fieldPublisher: "Verlag",
    fieldYear: "Jahr",
    fieldPages: "Seiten",
    fieldAge: "Altersempfehlung",
    fieldIsbn: "ISBN",
    notFound: "Buch nicht gefunden.",
  },

  // ─── Phase 11f: site footer (rendered on every Layout-wrapped page) ───
  footer: {
    publicCatalog: "Öffentlicher Katalog",
    copyright: "Copyright",
    // "Impressum" and "Datenschutz" are German legal disclosure terms
    // (publisher info / privacy policy). Reasonable English equivalents:
    //   Impressum   → "Legal notice"  (EU GDPR-style site identity disclosure)
    //   Datenschutz → "Privacy"
    imprint: "Impressum",
    privacy: "Datenschutz",
  },

  // ─── ISBN lookup API error messages ──────────────────────────────────
  // Used in pages/api/book/FillBookByIsbn.ts.
  // `fetchError.*` values appear inside the `details` array of non-200
  // responses so that users can copy-paste them into support messages.
  isbnLookup: {
    error: {
      missingParam: "ISBN-Parameter fehlt",
      allServicesFailed:
        "Keine externe Buchquelle war erreichbar. Bitte Internetverbindung des Servers prüfen.",
      partialFailure:
        "Buch nicht gefunden. Einige Quellen konnten nicht erreicht werden.",
      notFound: "Buch nicht in einer der verfügbaren Katalogquellen gefunden.",
      unexpected: "Unerwarteter Fehler bei der ISBN-Abfrage.",
    },
    fetchError: {
      timeout: "Zeitüberschreitung (Timeout)",
      connectionRefused: "Verbindung abgelehnt",
      dnsError: "DNS-Fehler (Host nicht gefunden)",
      connectionReset: "Verbindung unterbrochen",
      tlsError: "TLS/Zertifikat-Fehler",
      networkError: "Netzwerkfehler",
      unknown: "Unbekannter Fehler",
    },
  },
};

/**
 * Structural type derived from the German dictionary. All other locale
 * files import and satisfy this type.
 */
export type Dictionary = typeof de;
