/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(): Chainable<any>;
  }
} /// <reference types="cypress" />
Cypress.Commands.add("login", () => {
  cy.log(Cypress.env("user"));
  // Start from the index page
  cy.visit("http://localhost:3000/");
  cy.get('input[id="user"]').type(Cypress.env("user"));
  cy.get('input[id="password"]').type(Cypress.env("password"));
  cy.get('input[id="password"]').type("{enter}"); // '{enter}' submits the form
  cy.get("[data-cy=indexpage]").should("be.visible");
});
