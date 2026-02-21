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
  USER_CREATE_ATTEMPT: "user.create.attempt",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",
  USER_RETRIEVED: "user.retrieved",
  USER_GRADE_BATCH_UPDATE: "user.grade.batch.update",
  USER_BATCH_DELETE: "user.batch.delete",

  // Auth events
  LOGIN_SUCCESS: "auth.login.success",
  LOGIN_FAILED: "auth.login.failed",
  LOGIN_CHECK: "auth.login.check",
  LOGIN_USER_CREATE_ATTEMPT: "loginuser.create.attempt",
  LOGIN_USER_CREATED: "loginuser.created",
  LOGIN_USER_CREATE_FAILED: "loginuser.create.failed",

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
  REPORT_EXCEL_EXPORTED: "report.excel.exported",

  // Import operations
  IMPORT_EXCEL_STARTED: "import.excel.started",
  IMPORT_EXCEL_COMPLETED: "import.excel.completed",
  IMPORT_EXCEL_FAILED: "import.excel.failed",
  IMPORT_EXCEL_DROP_BEFORE: "import.excel.dropbefore",
  IMPORT_OPENBIBLIO_STARTED: "import.openbiblio.started",
  IMPORT_OPENBIBLIO_COMPLETED: "import.openbiblio.completed",

  // Cover image operations
  COVER_UPLOADED: "cover.uploaded",
  COVER_SERVED: "cover.served",
  COVER_DEFAULT_SERVED: "cover.default.served",
  COVER_NOT_FOUND: "cover.notfound",
  COVER_LIST_RETRIEVED: "cover.list.retrieved",
  COVER_FETCH_STARTED: "cover.fetch.started",
  COVER_FETCH_ATTEMPT: "cover.fetch.attempt",
  COVER_FETCHED_DNB: "cover.fetched.dnb",
  COVER_FETCHED_OPENLIBRARY: "cover.fetched.openlibrary",
  COVER_FETCH_FAILED: "cover.fetch.failed",
  //manual upload events
  COVER_UPLOAD_ERROR: "cover.upload.error",
  COVER_UPLOAD_FIELD: "cover.upload.field",
  COVER_UPLOAD_PROCESSING: "cover.upload.processing",
  COVER_UPLOAD_RECEIVED: "cover.upload.received",
  COVER_UPLOAD_PROGRESS: "cover.upload.progress",

  // System events
  API_ERROR: "api.error",
  CONFIG_ERROR: "config.error",
  DB_ERROR: "db.error",
  DB_RECONNECTED: "db.reconnected",
  STARTUP: "system.startup",
  SHUTDOWN: "system.shutdown",
  // Page loads
  PAGE_LOAD: "page.load",
} as const;

export type LogEvent = (typeof LogEvents)[keyof typeof LogEvents];
