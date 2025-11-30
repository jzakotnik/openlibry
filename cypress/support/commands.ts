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
  cy.visit("http://localhost:3000/");
  cy.get('input[id="user"]').type(Cypress.env("user"));
  cy.get('input[id="password"]').type(Cypress.env("password"));
  cy.get('input[id="password"]').type("{enter}");
  cy.get("[data-cy=indexpage]").should("be.visible");
});

// Wrapper commands that call the config tasks
Cypress.Commands.add("resetDatabase", () => {
  cy.task("resetDatabase").then(() => {
    cy.log("✓ Database reset successfully");
  });

  // Reconnect via API
  cy.request({
    method: "POST",
    url: "http://localhost:3000/api/db/reconnect",
    failOnStatusCode: false,
  });

  cy.wait(500); // Reduced wait time since operations are faster now
});

Cypress.Commands.add("cleanupDatabase", () => {
  cy.task("cleanupDatabase");
});

Cypress.Commands.add("deleteBookCoverImage", (bookId: string) => {
  cy.task("deleteBookCoverImage", bookId);
});

Cypress.Commands.add("deleteFile", (filePath: string) => {
  cy.task("deleteFile", filePath);
});
