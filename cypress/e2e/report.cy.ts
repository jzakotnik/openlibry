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
    cy.get("[data-cy=report-card-rentals-button]").should("be.visible").click();

    // Page structure
    cy.get("[data-cy=rentals-datagrid]").should("be.visible");
    cy.get("[data-cy=rentals-error]").should("not.exist");
    cy.get("[data-cy=rentals-no-data]").should("not.exist");

    // Table has data rows (TanStack renders standard tbody > tr)
    cy.get("[data-cy=rentals-datagrid] tbody tr").should("have.length.gt", 0);

    // Overdue indicator is visible
    cy.get("[data-cy=rentals-overdue-count]").should("be.visible");

    // Export buttons are present
    cy.get("[data-cy=rentals-excel-export]").should("be.visible");
    cy.get("[data-cy=rentals-pdf-export]").should("be.visible");
  });
});
