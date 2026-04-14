/// <reference types="cypress" />
describe("Various Reports show data", () => {
  before(() => {
    cy.resetDatabase();
  });

  after(() => {
    cy.cleanupDatabase();
  });

  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
  });

  it("should navigate to the rental screen and display rental data", () => {
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_reports_button]").click();

    cy.url().should("include", "/reports");

    cy.get("[data-cy=report-card-rentals-button]", { timeout: 15000 })
      .should("be.visible")
      .click();

    cy.url().should("include", "/reports/rentals");

    cy.get("[data-cy=rentals-datagrid]", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.get("[data-cy=rentals-error]").should("not.exist");
    cy.get("[data-cy=rentals-no-data]").should("not.exist");

    cy.get("[data-cy=rentals-datagrid] tbody tr").should("have.length.gt", 0);
    cy.get("[data-cy=rentals-overdue-count]").should("be.visible");
    cy.get("[data-cy=rentals-excel-export]").should("be.visible");
    cy.get("[data-cy=rentals-pdf-export]").should("be.visible");
  });
});
