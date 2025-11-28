/// <reference types="cypress" />
describe("Navigation", () => {
  before(() => {
    cy.login();
  });
  it("should navigate to the rental screen", () => {
    cy.log(Cypress.env("user"));
    // Start from the index page
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_reports_button]").click();
    cy.get("[data-cy=report-card-rentals-button]").should("be.visible");
    cy.get("[data-cy=report-card-rentals-button]").click();
    cy.get("[data-cy=rentals-datagrid]").should("be.visible");
    cy.get('[data-cy="rentals-error"]').should("not.exist");
    cy.get('[data-cy="rentals-no-data"]').should("not.exist"); //no errors
    cy.get(".MuiDataGrid-row").should("have.length.gt", 0); //has some rows
  });
});
