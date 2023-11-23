/// <reference types="cypress" />
describe("Navigation", () => {
  before(() => {
    cy.login();
  });
  it("should navigate to the rental screen", () => {
    cy.log(Cypress.env("user"));
    // Start from the index page
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_user_button]").click();
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");
  });
});
