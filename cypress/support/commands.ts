/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(): Chainable<any>;
    resetAndSeed(): Chainable<{
      userIdByLastName: Record<string, number>;
      bookIdByTitle: Record<string, number>;
      bookIdByLabel: Record<string, number>;
      userId: number;
      bookAId: number;
      bookBUserColId: number;
      bookBBookColId: number;
      bookBUserPageId: number;
      bookCId: number;
      adminUsername: string;
      adminPassword: string;
    }>;
    clearDatabase(): Chainable<any>;
    seedRentalData(): Chainable<{
      userId: number;
      bookAId: number;
      bookCId: number;
    }>;
    seedLoginUser(data: {
      username: string;
      password: string;
      email: string;
      role: string;
    }): Chainable<any>;
    deleteLoginUser(username: string): Chainable<any>;
    deleteBookCoverImage(bookId: string): Chainable<any>;
    deleteFile(filePath: string): Chainable<any>;
    navigateToBookEdit(bookId: string): Chainable<any>;
  }
}

// These must match the first entry in cypress/fixtures/seed-login-users.json.
// Defined as constants here rather than read from Cypress.env() so that a
// stale cypress.env.json pointing at old credentials cannot break the session.
const SEEDED_ADMIN_USERNAME = "cypress_test_admin";
const SEEDED_ADMIN_PASSWORD = "CypressTest1234!";

Cypress.Commands.add("login", () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit("http://localhost:3000/");
  cy.get('input[id="user"]').type(SEEDED_ADMIN_USERNAME);
  cy.get('input[id="password"]').type(SEEDED_ADMIN_PASSWORD);
  cy.get('input[id="password"]').type("{enter}");
  cy.get("[data-cy=indexpage]").should("be.visible");
});

// Truncates every application table on the live Prisma connection and
// re-inserts the baseline fixture set (users, books, admin LoginUser).
// No file operations, no disconnect/reconnect — same connection the
// running Next.js server already holds open.
Cypress.Commands.add("resetAndSeed", () => {
  return cy.task("resetAndSeed");
});

// Wipes all application tables without reseeding anything. Use sparingly;
// resetAndSeed() in the next spec's before() will reseed regardless.
Cypress.Commands.add("clearDatabase", () => {
  cy.task("clearDatabase");
});

// Additive seed for specs that need extra rented-book fixtures beyond the
// resetAndSeed() baseline. Kept separate so specs can opt in.
Cypress.Commands.add("seedRentalData", () => {
  return cy.task("seedRentalData");
});

Cypress.Commands.add(
  "seedLoginUser",
  (data: {
    username: string;
    password: string;
    email: string;
    role: string;
  }) => {
    return cy.task("seedLoginUser", data);
  },
);

Cypress.Commands.add("deleteLoginUser", (username: string) => {
  cy.task("deleteLoginUser", username);
});

Cypress.Commands.add("deleteBookCoverImage", (bookId: string) => {
  cy.task("deleteBookCoverImage", bookId);
});

Cypress.Commands.add("deleteFile", (filePath: string) => {
  cy.task("deleteFile", filePath);
});

Cypress.Commands.add("navigateToBookEdit", (bookId: string) => {
  cy.get("[data-cy=index_book_button]").click();
  cy.get("[data-cy=rental_input_searchbook]").should("be.visible").type(bookId);

  // Scope to the exact card matching this book ID
  cy.get(`[data-cy=book_summary_card_${bookId}]`)
    .should("be.visible")
    .within(() => {
      cy.get("[data-cy=book_card_editbutton]").click();
    });

  cy.get("[data-cy=book-edit-form]").should("be.visible");
});
