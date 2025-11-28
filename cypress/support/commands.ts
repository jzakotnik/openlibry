/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(): Chainable<any>;
    resetDatabase(): Chainable<any>;
  }
}

Cypress.Commands.add("login", () => {
  cy.log(Cypress.env("user"));
  // Start from the index page
  cy.visit("http://localhost:3000/");
  cy.get('input[id="user"]').type(Cypress.env("user"));
  cy.get('input[id="password"]').type(Cypress.env("password"));
  cy.get('input[id="password"]').type("{enter}"); // '{enter}' submits the form
  cy.get("[data-cy=indexpage]").should("be.visible");
});

Cypress.Commands.add("resetDatabase", () => {
  // Copy the automated-test-db.db to dev.db (overwrites dev.db)
  cy.exec(
    "cp prisma/database/automated-test-db-init.db prisma/database/automated-test-db.db"
  );
});
