import type { Dictionary } from "./de";

/**
 * English dictionary.
 *
 * Must mirror the shape of `de` exactly — the `Dictionary` type enforces
 * this. TypeScript will flag any missing or added keys.
 *
 * "OpenLibry" is a brand name and stays unchanged across locales.
 */
export const en: Dictionary = {
  app: {
    title: "OpenLibry Library",
  },
  topbar: {
    brand: "OpenLibry",
    tagline: "Library Management",
    openMenu: "Open navigation",
    closeMenu: "Close menu",
    admin: "Administration",
    logout: "Log out",
  },
  nav: {
    rental: {
      title: "Lending",
      subtitle: "Loans and returns",
    },
    user: {
      title: "Users",
      subtitle: "User management",
    },
    book: {
      title: "Books",
      subtitle: "Media inventory",
    },
    reports: {
      title: "Reports",
      subtitle: "Inventory overview",
    },
  },
  home: {
    chooseSection: "Choose a section to get started",
  },
  rental: {
    searchBookPlaceholder: "Search book",
    searchUserPlaceholder: "Search user",
    clearSearch: "Clear search",
    searchBooksAria: "search books",
    searchUsersAria: "search users",

    extend: "Extend",
    extendAria: "extend",
    maxExtensionReached: "Maximum lending time reached",
    return: "Return",
    returnAria: "return",
    rent: "Lend out",
    rentAria: "lend",

    noUsersFound: "No users found",
    cancelSelection: "Clear selection",
    searchSettings: "Search settings",
    searchSettingsAria: "search-settings",

    bookSingular: "book",
    bookPlural: "books",

    userMetaPrefix: "No.",
    userMetaGrade: "Grade",

    noBorrowedBooks: "No borrowed books",

    bookNumberPrefix: "No.",
    bookRentedUntil: "lent until",
    bookRentedTo: "to",
    rentalUntilPrefix: "until",
    renewalCountSuffix: "× renewed",

    toastAlreadyRented: "Book {bookId} is already lent out",
    toastBookNotFound: "Book {bookId} not found",
  },
  rentSearchParams: {
    overdue: "Overdue",
    grade: "Grade",
  },
  rentalPage: {
    serverReachableButFailed:
      "Something went wrong, but the server is reachable",
    serverUnreachable:
      "Server unreachable. Is the internet connection OK?",

    bookReturned: "Book - {title} - returned",
    bookAlreadyMaxExtended:
      "Book - {title} - has already been extended to the maximum",
    bookExtended: "Book - {title} - extended",
    bookRented: "Book {title} lent out",
  },

  // ── Phase 4b additions ────────────────────────────────────────────────
  bookSearchBar: {
    placeholder: "Search book…",
    ariaLabel: "search books",
    toggleView: "Toggle view",
    newBook: "Create new book",
    importMany: "Import many books",
  },
  userSearchBar: {
    placeholder: "Search by name or ID...",
    ariaLabel: "search users",
    searchSettings: "Search settings",
    cancelSelection: "Clear selection",
    selectAll: "Select all",
    newUser: "Create new user",
    selected: "selected",
    deselect: "Clear",
    actions: "Actions",
    increaseGrade: "Increase grade",
    deleteUsers: "Delete users",
    confirmDelete: "Really delete?",
  },
  userSearchFilters: {
    filter: "Filter",
    active: "Active",
    reset: "Reset",
    resetTooltip: "Reset filters",
    status: "Status",
    onlyOverdue: "Only overdue",
    grade: "Grade",
    allGrades: "All grades",
    overdueChip: "Overdue",
    gradeChipPrefix: "Grade",
  },
  userAdminList: {
    noUsersSearch: "No users found",
    noUsersEmpty: "No users yet",
    tryDifferentSearch: "Try a different search term",
    createNewToBegin: "Create a new user to get started",
    booksRentedSingular: "book borrowed",
    booksRentedPlural: "books borrowed",
    hasOverdue: "Has overdue books",
    metaPrefix: "No.",
    gradePrefix: "Grade",
    rentalSection: "Borrowed books",
    noBorrowedBooks: "No borrowed books",
    edit: "Edit",
    printUserLabel: "Print user label",
  },
  newUserDialog: {
    title: "Create new user",
    subtitle: "Add a user to the library",
    autoBadge: "Auto",
    autoIdLabel: "Automatic ID",
    autoIdHint: "Next available number is assigned automatically",
    userIdLabel: "User ID",
    cancel: "Cancel",
    create: "Create",
  },
  userEditForm: {
    bookSingular: "book",
    bookPlural: "books",
    overdue: "overdue",
    metaPrefix: "No.",
    gradePrefix: "Grade",
    sectionPersonalData: "Details",
    fieldFirstName: "First name",
    fieldLastName: "Last name",
    fieldGrade: "Grade",
    fieldTeacher: "Teacher",
    fieldCreatedAt: "Created on",
    fieldLastUpdated: "Last update",
    createdAtValue: "User created on {date} with user ID {id}",
    activeLabel: "Active",
    activeHintActive: "User can borrow books",
    activeHintInactive: "User is deactivated",
    sectionBorrowedBooks: "Borrowed books",
    noBorrowedBooks: "No borrowed books",
    idNotFound: "ID not found",
    alreadyReturned: "Already returned",
    return: "Return",
    extend: "Extend",
    edit: "Edit",
    cancel: "Cancel",
    save: "Save",
    print: "Print",
    delete: "Delete",
  },
  bookEditForm: {
    save: "Save",
    saving: "Saving...",
    saveTitleNew: "Create and save book",
    saveTitleExisting: "Save",
    cancel: "Cancel",
    cancelTitle: "Cancel and return to overview",
    delete: "Delete",
    sectionIsbn: "ISBN & Basic Data",
    sectionBookData: "Book Details",
    sectionPublisher: "Publisher & Edition",
    sectionRentalStatus: "Lending Status",
    sectionMore: "Additional Information",
    autofill: "Fill in",
    autofillSearching: "Searching...",
    autofillTitle:
      "Look up data and cover by ISBN (DNB, Google Books, OpenLibrary)",
    fetchCover: "Cover",
    fetchCoverLoading: "Loading...",
    fetchCoverTitle: "Load cover from ISBN (OpenLibrary)",
    statusLabel: "Status",
    renewalsLabel: "Renewals",
    coverPreviewAlt: "Cover preview",
    coverImageAlt: "cover image",
    coverPlaceholderInitial: "Enter ISBN and click 'Fill in'",
    coverSearching: "Searching for cover...",
    coverNotFound: "No cover found",
    coverWillUpload: "✓ Cover will be uploaded on save",
    coverUploadAfterSave: "Cover can be uploaded manually after saving",
    antolinLabel: "Antolin:",
    antolinPlaceholder: "...",
    antolinManyFound: " {count} similar books",
    antolinNoneFound: " No book found",
    antolinOneFound: " One book found",
    toastEnterIsbn: "Please enter an ISBN.",
    toastIsbnInvalid: "The ISBN is invalid (no digits found).",
    toastIsbnInvalidShort: "The ISBN is invalid.",
    toastNoIsbn: "No ISBN stored on this book.",
    toastSaveFirst: "Book must be saved first.",
    toastIsbnNotFound: "No data found for this ISBN.",
    toastDataAndCoverLoaded: "Data and cover loaded successfully.",
    toastDataLoaded: "Data filled in successfully.",
    toastDataLoadError: "Error loading book data.",
    toastCoverLoaded: "Cover loaded successfully from {source}.",
    toastCoverSourceUnknown: "unknown",
    toastCoverNotFound: "Cover could not be found.",
    toastCoverLoadError: "Error loading cover.",
  },
  bookSelect: {
    renewalNone: "Not renewed",
    renewalCountFormat: "{n}× renewed",
  },
  userPage: {
    toastUserCreateFailed:
      "New user could not be created. Is the user ID already taken?",
    toastGradeIncreased: "Grade increased for selected users",
    toastUsersDeleted: "Users deleted successfully",
  },
  userDetailPage: {
    idNotFound: "ID not found",
    toastUserSaved: "User {firstName} {lastName} saved",
    toastBookReturned: "Book returned, great!",
    toastBookAlreadyMaxExtended:
      "Book - {title} - has already been extended to the maximum",
    toastServerReachableButFailed:
      "Something went wrong, but the server is reachable",
    toastBookExtended: "Book extended, great!",
    toastUserDeleted: "User deleted!",
  },
  bookPage: {
    toastCreateNewBook: "Create new book - please enter data or scan an ISBN",
    toastBookReturned: "Book returned",
    toastReturnError: "Error returning the book",
    loadMore: "More books...",
  },

  // ── Phase 5 additions: authentication pages ──────────────────────────
  authError: {
    pageTitle: "Login error | OpenLibry",
    heading: "Login failed",
    errorCodePrefix: "Error code:",
    backToLogin: "Back to login",
    codes: {
      Signin: "Sign-in failed. Please try again.",
      OAuthSignin: "Error establishing the OAuth connection.",
      OAuthCallback: "Error during OAuth callback.",
      OAuthCreateAccount: "OAuth account could not be created.",
      EmailCreateAccount: "Email account could not be created.",
      Callback: "Error during callback processing.",
      OAuthAccountNotLinked:
        "This email is already linked to another account.",
      CredentialsSignin: "Username or password is incorrect.",
      SessionRequired: "Please sign in to continue.",
      Default: "An unknown error occurred.",
    },
  },
  login: {
    pageTitle: "Login | OpenLibry",
    heading: "Login to OpenLibry",
    subtitle: "Please sign in",
    labelUsername: "Username",
    labelPassword: "Password",
    placeholderUsername: "Enter username",
    placeholderPassword: "Enter password",
    submitting: "Signing in…",
    submit: "Sign in",
    errorFailed: "Login failed. Please check your input.",
    errorConnection: "Connection error. Please try again.",
  },
  register: {
    pageTitle: "Register | OpenLibry",
    heading: "Create new user",
    subtitle: "Create an admin account for OpenLibry",
    labelUsername: "Username",
    labelEmail: "Email",
    labelPassword: "Password",
    labelPasswordConfirm: "Confirm password",
    placeholderUsername: "Enter username",
    placeholderEmail: "Enter email",
    placeholderPassword: "At least 3 characters",
    placeholderPasswordConfirm: "Confirm password",
    passwordTooShort: "Password must be at least 3 characters",
    passwordMismatch: "Passwords don't match",
    submitting: "Creating…",
    submit: "Create user",
    errorCreate: "Error during creation ({status})",
    errorUnknown: "Unknown error. Please try again.",
  },

  // ─── Phase 6: admin settings page ─────────────────────────────────────
  admin: {
    pageTitle: "Configuration | OpenLibry",
    backToAdmin: "Back to administration",
    heading: "Configuration",
    subheading: "Compose and download the .env file with your settings",

    infoBanner: {
      title: "How this page works",
      bodyP1: "Compose a ",
      bodyCode: ".env",
      bodyP2:
        " file here. All input stays locally in your browser — ",
      bodyStrong: "nothing is stored or sent",
      bodyP3:
        ". Download the finished file and place it in the OpenLibry directory. Then restart OpenLibry.",
      bareMetalCmd: "Bare Metal: pm2 restart openlibry",
      dockerCmd: "Docker: docker restart openlibry",
    },

    preview: {
      title: "Preview: .env",
      copyDone: "Copied!",
      copyAction: "Copy to clipboard",
    },

    stickyBar: {
      varCount: "{count} variables configured",
      reset: "Reset",
      download: "Download .env",
    },

    sectionCard: {
      hintTooltip: "Show hint",
      showAdvancedSingular: "Show {n} advanced setting",
      showAdvancedPlural: "Show {n} advanced settings",
      hideAdvanced: "Hide advanced settings",
    },

    passwordField: {
      placeholder: "Enter or generate a random value...",
      hide: "Hide",
      show: "Show",
      copy: "Copy",
      copied: "Copied!",
      copyTitle: "Copy to clipboard",
      generate: "Generate",
      generateTitle: "Generate a secure random value",
      strength: "✓ {chars} characters — strong enough",
    },

    envHeaders: {
      technical: "🔧 TECHNICAL CONFIGURATION",
      school: "🏫 SCHOOL CONFIGURATION",
      reminder: "📧 REMINDERS",
      userlabels: "🆔 USER CARDS",
    },

    units: {
      days: "days",
      seconds: "seconds",
    },

    placeholders: {
      schoolName: "Sample School",
      reminderName: "School Library",
    },

    sections: {
      technical: {
        title: "Technical Configuration",
        description: "Database connection, authentication, and server paths",
        fields: {
          DATABASE_URL: {
            label: "Database path",
            description:
              "Path to the SQLite database file. Relative to the application directory.",
            hint: "Example: file:./database/dev.db — the folder must exist and be writable.",
          },
          NEXTAUTH_URL: {
            label: "Application URL",
            description:
              "Full URL of the application as accessed in the browser. Used for login redirects.",
            hint: "Local install: http://localhost:3000. With nginx: https://library.school.edu",
          },
          NEXTAUTH_SECRET: {
            label: "Security key (Secret)",
            description:
              "Random secret key used to encrypt sessions and tokens.",
            hint: "At least 32 characters. Don't change once set — all users will be logged out. Tip: pwgen 32 1",
          },
          AUTH_ENABLED: {
            label: "Authentication enabled",
            description:
              "Determines whether login is required. Disable only during initial setup.",
            hint: "⚠️ Always set to true in production!",
          },
          COVERIMAGE_FILESTORAGE_PATH: {
            label: "Cover image path",
            description: "Directory where uploaded book covers are stored.",
            hint: "In Docker: /app/images (in the container). Without Docker: e.g. ./images",
          },
          LOGIN_SESSION_TIMEOUT: {
            label: "Session timeout",
            description:
              "Time in seconds until automatic logout on inactivity.",
          },
          MAX_MIGRATION_SIZE: {
            label: "Max import file size",
            description:
              "Maximum file size for JSON imports (e.g. OpenBiblio migration).",
          },
          SECURITY_HEADERS: {
            label: "Security headers",
            description:
              "Controls Content-Security-Policy headers. Leave empty in production.",
            hint: 'Set "insecure" only when CSP headers should be disabled (not recommended).',
            options: {
              active: "Active (default, recommended)",
              insecure: "Disabled (development only)",
            },
          },
          DELETE_SAFETY_SECONDS: {
            label: "Delete safety delay",
            description:
              "Wait time in seconds before a book/user is permanently deleted. Allows time to cancel.",
          },
          RENTAL_SORT_BOOKS: {
            label: "Lending view sort order",
            description:
              "Default sort order for books in the lending view.",
            options: {
              title_asc: "Title A–Z",
              title_desc: "Title Z–A",
              id_asc: "ID ascending",
              id_desc: "ID descending",
            },
          },
          BARCODE_MINCODELENGTH: {
            label: "Minimum barcode length",
            description:
              "Shorter barcodes are padded with spaces until this length is reached.",
          },
          ADMIN_BUTTON_SWITCH: {
            label: "Show admin button",
            description: "Shows the backup button in the navigation bar.",
            options: {
              show: "Show",
              hide: "Hide",
            },
          },
          NUMBER_BOOKS_OVERVIEW: {
            label: "Books per page",
            description: "Number of books per page in the overview list.",
          },
          NUMBER_BOOKS_MAX: {
            label: "Maximum book count",
            description:
              "Expected maximum number of books in the library. Affects search and pagination.",
          },
        },
      },
      school: {
        title: "School Configuration",
        description: "Name, logo, lending periods, and labels",
        fields: {
          SCHOOL_NAME: {
            label: "School name",
            description:
              "Full name of the school — shown in the UI, on cards, labels, and reports.",
            hint: 'Example: "Sample Elementary School"',
          },
          LOGO_LABEL: {
            label: "School logo (filename)",
            description:
              "Filename of the school logo in the public/ directory. Used on user cards and in the UI.",
            hint: "File must be in /public (bare metal) or in database/custom/ (Docker).",
          },
          RENTAL_DURATION_DAYS: {
            label: "Lending period",
            description:
              "Default lending duration in days from the time of checkout.",
          },
          EXTENSION_DURATION_DAYS: {
            label: "Extension duration",
            description:
              "Number of days a loan can be extended.",
          },
          MAX_EXTENSIONS: {
            label: "Maximum extensions",
            description: "How often a book can be extended at most.",
          },
          LABEL_CONFIG_DIR: {
            label: "Label configuration directory",
            description:
              "Directory for label sheets (sheets/) and templates (templates/). Sheets and templates are stored as JSON files in subfolders.",
            hint: "Default: ./database/custom/labels — in Docker, database/custom/ is mounted as a volume so custom configurations survive updates.",
          },
        },
      },
      reminder: {
        title: "Reminders",
        description: "Settings for automatic reminder letters",
        fields: {
          REMINDER_TEMPLATE_DOC: {
            label: "Reminder template",
            description:
              "Filename of the Word template (.docx) used for reminder letters.",
            hint: "File must be in database/custom/ (Docker) or in the application directory.",
          },
          REMINDER_RESPONSIBLE_NAME: {
            label: "Responsible party",
            description:
              "Name of the responsible person or department shown on reminder letters.",
          },
          REMINDER_RESPONSIBLE_EMAIL: {
            label: "Contact email",
            description:
              "Email address shown on reminder letters as the contact for inquiries.",
          },
          REMINDER_RENEWAL_COUNT: {
            label: "Maximum reminder repetitions",
            description:
              "How often a reminder can be repeated before escalation.",
          },
        },
      },
      userlabels: {
        title: "User Cards",
        description: "Layout and content of printed student ID cards",
        fields: {
          USERID_LABEL_IMAGE: {
            label: "Background image",
            description:
              "Filename of the background image for user cards. In database/custom/ (Docker) or public/ (bare metal).",
          },
          USERLABEL_WIDTH: {
            label: "Card width",
            description:
              "Width of a user card in CSS units. Affects browser display.",
            hint: "Typical values: 42vw, 9cm, 400px",
          },
          USERLABEL_PER_PAGE: {
            label: "Cards per page",
            description: "Number of user cards per printed page.",
          },
          USERLABEL_SEPARATE_COLORBAR: {
            label: "Color bar",
            description:
              'Optional color bar below the image. Format: [width, height, "color"]',
            hint: "CSS color names or hex values, e.g. lightgreen, #4caf50",
          },
          USERLABEL_LINE_1: {
            label: "Text line 1",
            description:
              'First text line on the card. Format: ["content","top","left","width","margin","color",fontSize]',
            hint: "Placeholders: User.firstName, User.lastName, User.schoolGrade",
          },
          USERLABEL_LINE_2: {
            label: "Text line 2",
            description:
              "Second text line on the card (same syntax as line 1).",
          },
          USERLABEL_LINE_3: {
            label: "Text line 3",
            description:
              "Third text line on the card (same syntax as line 1).",
          },
          USERLABEL_BARCODE: {
            label: "Barcode position",
            description:
              'Position and size of the barcode on the card. Format: ["top","left","width","height","type"]',
          },
        },
      },
    },
  },
};
