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
};
