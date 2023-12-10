/// <reference types="cypress" />
describe("Navigation", () => {
  before(() => {
    cy.login();
  });
  it("should navigate to the book screen", () => {
    cy.log(Cypress.env("user"));
    // Start from the index page
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");
    cy.get("[data-cy=create_book_button]").click();
  });
});
