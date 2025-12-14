export const LogEvents = {
  // Book operations
  BOOK_CREATED: "book.created",
  BOOK_UPDATED: "book.updated",
  BOOK_DELETED: "book.deleted",

  // Rental operations
  BOOK_RENTED: "book.rented",
  BOOK_RETURNED: "book.returned",
  BOOK_EXTENDED: "book.extended",
  BOOK_RENTAL_CHECKED: "book.rental.checked",
  BOOK_RENTAL_REJECTED: "book.rental.rejected",

  // User operations
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",

  // Auth events
  LOGIN_SUCCESS: "auth.login.success",
  LOGIN_FAILED: "auth.login.failed",

  // ISBN lookup operations
  ISBN_LOOKUP_STARTED: "isbn.lookup.started",
  ISBN_LOOKUP_SUCCESS_DNB: "isbn.lookup.success.dnb",
  ISBN_LOOKUP_SUCCESS_OPENLIBRARY: "isbn.lookup.success.openlibrary",
  ISBN_LOOKUP_NOT_FOUND: "isbn.lookup.notfound",
  ISBN_LOOKUP_FAILED: "isbn.lookup.failed",
  ISBN_LOOKUP_INVALID: "isbn.lookup.invalid",

  // Report generation
  REPORT_MAHNUNGEN_GENERATED: "report.mahnungen.generated",
  REPORT_MAHNUNGEN_PRINTED: "report.mahnungen.printed",
  REPORT_ID_CARDS_GENERATED: "report.idcards.generated",
  REPORT_ID_CARDS_PRINTED: "report.idcards.printed",
  REPORT_BOOK_LABELS_GENERATED: "report.booklabels.generated",
  REPORT_BOOK_LABELS_PRINTED: "report.booklabels.printed",
  REPORT_TABLE_EXPORTED: "report.table.exported",
  REPORT_RENTALS_EXPORTED: "report.rentals.exported",
  REPORT_BOOKS_EXPORTED: "report.books.exported",
  REPORT_USERS_EXPORTED: "report.users.exported",

  // Import operations
  IMPORT_EXCEL_STARTED: "import.excel.started",
  IMPORT_EXCEL_COMPLETED: "import.excel.completed",
  IMPORT_EXCEL_FAILED: "import.excel.failed",
  IMPORT_OPENBIBLIO_STARTED: "import.openbiblio.started",
  IMPORT_OPENBIBLIO_COMPLETED: "import.openbiblio.completed",

  // Cover image operations
  COVER_UPLOADED: "cover.uploaded",
  COVER_SERVED: "cover.served",
  COVER_DEFAULT_SERVED: "cover.default.served",
  COVER_NOT_FOUND: "cover.notfound",
  COVER_LIST_RETRIEVED: "cover.list.retrieved",
  COVER_FETCHED_DNB: "cover.fetched.dnb",
  COVER_FETCHED_OPENLIBRARY: "cover.fetched.openlibrary",
  COVER_FETCH_FAILED: "cover.fetch.failed",

  // System events
  API_ERROR: "api.error",
  DB_ERROR: "db.error",
  STARTUP: "system.startup",
  SHUTDOWN: "system.shutdown",
} as const;

export type LogEvent = (typeof LogEvents)[keyof typeof LogEvents];
