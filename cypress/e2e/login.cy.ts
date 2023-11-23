/// <reference types="cypress" />
describe("Navigation", () => {
  it("should navigate to the title screen", () => {
    cy.log(Cypress.env("user"));
    // Start from the index page
    cy.visit("http://localhost:3000/");

    cy.get('input[id="user"]').type(Cypress.env("user"));
    cy.get('input[id="password"]').type(Cypress.env("password"));
    cy.get('input[id="password"]').type("{enter}"); // '{enter}' submits the form

    cy.get("[data-cy=indexpage]").should("be.visible");
  });
});
