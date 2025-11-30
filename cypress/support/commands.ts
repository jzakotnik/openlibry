/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(): Chainable<any>;
    resetDatabase(): Chainable<any>;
    deleteBookCoverImage(bookId: string): Chainable<any>;
    deleteFile(filePath: string): Chainable<any>;
    cleanupDatabase(): Chainable<any>;
  }
}

Cypress.Commands.add("login", () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.log(Cypress.env("user"));
  // Start from the index page
  cy.visit("http://localhost:3000/");
  cy.get('input[id="user"]').type(Cypress.env("user"));
  cy.get('input[id="password"]').type(Cypress.env("password"));
  cy.get('input[id="password"]').type("{enter}"); // '{enter}' submits the form
  cy.get("[data-cy=indexpage]").should("be.visible");
});

Cypress.Commands.add("resetDatabase", () => {
  // Verify source database exists and has content
  const sourceDbPath = "cypress/fixtures/automated-test-db-init.db";

  cy.task("resetDatabase").then(() => {
    // Optional: verify the copy succeeded
    cy.log("✓ Database reset successfully");
  });

  // Reconnect the database connection
  cy.request({
    method: "POST",
    url: "http://localhost:3000/api/db/reconnect",
    failOnStatusCode: false,
  });

  // Wait for database to be ready
  cy.wait(1500);
});

Cypress.Commands.add("cleanupDatabase", () => {
  // Copy the automated-test-db-init.db to automated-test-db.db (overwrites it)
  cy.exec("rm  prisma/database/automated-test-db.db");
  cy.wait(500);
});

Cypress.Commands.add("deleteBookCoverImage", (bookId: string) => {
  // Delete the book cover image file if it exists (try multiple extensions)
  cy.exec(
    `rm -f public/coverimages/${bookId}.jpg public/coverimages/${bookId}.jpeg public/coverimages/${bookId}.png || true`,
    { failOnNonZeroExit: false }
  );
});

Cypress.Commands.add("deleteFile", (filePath: string) => {
  // Delete any file using rm command
  cy.exec(`rm -f ${filePath} || true`, { failOnNonZeroExit: false });
});
