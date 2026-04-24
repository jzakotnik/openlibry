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
};
