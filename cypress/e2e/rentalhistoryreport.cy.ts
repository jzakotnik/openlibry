/// <reference types="cypress" />
describe("Rental History Report", () => {
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

  it("should navigate to the rental history screen and display history data", () => {
    cy.visit("http://localhost:3000/reports/userhistory");

    // Page structure
    cy.get("[data-cy=history-datagrid]").should("be.visible");
    cy.get("[data-cy=history-error]").should("not.exist");
    cy.get("[data-cy=history-no-data]").should("not.exist");

    // Table has data rows
    cy.get("[data-cy=history-table] tbody tr").should("have.length.gt", 0);

    // Title with user count is visible
    cy.get("[data-cy=history-title]").should("be.visible");

    // Export buttons are present
    cy.get("[data-cy=history-excel-export]").should("be.visible");
    cy.get("[data-cy=history-pdf-export]").should("be.visible");
  });

  it("should filter history rows by school grade", () => {
    cy.visit("http://localhost:3000/reports/userhistory");

    cy.get("[data-cy=history-table] tbody tr").then(($rows) => {
      const totalRows = $rows.length;

      cy.get("[data-cy=history-table] thead select")
        .first()
        .find("option")
        .then(($options) => {
          const gradeOption = $options
            .toArray()
            .find((o) => (o as HTMLOptionElement).value !== "") as
            | HTMLOptionElement
            | undefined;

          if (!gradeOption) return;

          cy.get("[data-cy=history-table] thead select")
            .first()
            .select(gradeOption.value);

          // Filtered rows should be fewer than or equal to the total
          cy.get("[data-cy=history-table] tbody tr").should(
            "have.length.lte",
            totalRows,
          );

          // No "no results" message should appear when a valid grade is selected
          cy.get("[data-cy=history-no-results]").should("not.exist");
        });
    });
  });

  it("should filter history rows by name search", () => {
    cy.visit("http://localhost:3000/reports/userhistory");

    cy.get("[data-cy=history-table] tbody tr").then(($rows) => {
      const totalRows = $rows.length;

      // Type a name fragment that is unlikely to match everything
      cy.get("[data-cy=history-table] thead input[type=text]")
        .first()
        .type("a");

      cy.get("[data-cy=history-table] tbody tr").should(
        "have.length.lte",
        totalRows,
      );

      // Clear with Escape
      cy.get("[data-cy=history-table] thead input[type=text]")
        .first()
        .type("{esc}");

      cy.get("[data-cy=history-table] tbody tr").should(
        "have.length",
        totalRows,
      );
    });
  });

  it("should navigate back to reports overview", () => {
    cy.visit("http://localhost:3000/reports/userhistory");

    cy.contains("a", "Zurück").click();
    cy.url().should("include", "/reports");
  });
});
