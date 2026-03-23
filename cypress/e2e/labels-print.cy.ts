/// <reference types="cypress" />

/**
 * Label System — Print Page
 *
 * Tests the /reports/labels/print page: selecting config,
 * filtering books, picking positions, and downloading PDFs.
 */

// Helper: open a shadcn Select by trigger selector and pick an option
function selectByTrigger(triggerSelector: string, optionText: string) {
  cy.get(triggerSelector).click();
  cy.get("[role=option]").contains(optionText).click();
}

describe("Label Print Page", () => {
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
    cy.visit("http://localhost:3000/reports/labels/print");
  });

  // ─── Page Load ─────────────────────────────────────────────────────

  it("should display all controls on load", () => {
    cy.get("[data-cy=template-selector]").should("be.visible");
    cy.get("[data-cy=sheet-selector]").should("be.visible");
    cy.get("[data-cy=book-filter-radio]").should("be.visible");
    cy.get("[data-cy=generate-pdf-button]").should("be.visible");
    cy.get("[data-cy=back-to-reports]").should("be.visible");
  });

  it("should have download button disabled until config is selected", () => {
    cy.get("[data-cy=generate-pdf-button]").should("be.disabled");
  });

  // ─── Selectors ─────────────────────────────────────────────────────

  it("should populate sheet selector from API", () => {
    cy.intercept("GET", "/api/labels/sheets").as("loadSheets");
    cy.visit("http://localhost:3000/reports/labels/print");
    cy.wait("@loadSheets").its("response.statusCode").should("eq", 200);

    cy.get("[data-cy=sheet-selector]").click();
    cy.get("[role=option]").should("have.length.greaterThan", 0);
    // Close the dropdown
    cy.get("body").type("{escape}");
  });

  it("should populate template selector from API", () => {
    cy.intercept("GET", "/api/labels/templates").as("loadTemplates");
    cy.visit("http://localhost:3000/reports/labels/print");
    cy.wait("@loadTemplates").its("response.statusCode").should("eq", 200);

    cy.get("[data-cy=template-selector]").click();
    cy.get("[role=option]").should("have.length.greaterThan", 0);
    cy.get("body").type("{escape}");
  });

  // ─── Book Filters ──────────────────────────────────────────────────

  it("should allow selecting 'Neueste' filter with count", () => {
    cy.get("[data-cy=book-filter-radio]").within(() => {
      cy.get("#filter-latest").should("be.checked");
      cy.get("[data-cy=filter-latest-count]")
        .should("not.be.disabled")
        .clear()
        .type("10");
      cy.get("[data-cy=filter-latest-count]").should("have.value", "10");
    });
  });

  it("should allow selecting 'Thema' filter with text input", () => {
    cy.get("[data-cy=book-filter-radio]").within(() => {
      cy.get("#filter-topic").click({ force: true });
      cy.get("[data-cy=filter-topic-input]")
        .should("not.be.disabled")
        .type("Abenteuer");
      cy.get("[data-cy=filter-topic-input]").should(
        "have.value",
        "Abenteuer",
      );
    });
  });

  it("should allow selecting 'Alle Bücher' filter", () => {
    cy.get("[data-cy=book-filter-radio]").within(() => {
      cy.get("#filter-all").click({ force: true });
    });
    // No additional input fields should be active for 'all'
    cy.get("[data-cy=filter-latest-count]").should("be.disabled");
    cy.get("[data-cy=filter-topic-input]").should("be.disabled");
    cy.get("[data-cy=filter-ids-input]").should("be.disabled");
  });

  it("should allow selecting 'Buch-IDs' filter with ID input", () => {
    cy.get("[data-cy=book-filter-radio]").within(() => {
      cy.get("#filter-ids").click({ force: true });
      cy.get("[data-cy=filter-ids-input]")
        .should("not.be.disabled")
        .type("1, 2, 3");
      cy.get("[data-cy=filter-ids-input]").should("have.value", "1, 2, 3");
    });
  });

  // ─── Position Picker ───────────────────────────────────────────────

  it("should show position picker after sheet selection", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    cy.get("[data-cy=position-picker-grid]").should("be.visible");
    // 3474 = 3 columns × 8 rows = 24 cells
    cy.get("[data-cy=position-picker-grid] button").should("have.length", 24);
  });

  it("should highlight start position in start mode", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    // Default mode is "start" — click cell (5,2)
    cy.get("[data-cy=position-5-2]").click();

    // The clicked cell should be the start marker (primary bg)
    cy.get("[data-cy=position-5-2]").should(
      "have.class",
      "bg-primary",
    );

    // Cells before (5,2) should be inactive
    cy.get("[data-cy=position-1-1]").should("have.class", "bg-muted/50");

    // Status text
    cy.contains("Druck ab Zeile 5, Spalte 2").should("be.visible");
  });

  it("should toggle start position off when clicking same cell", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    cy.get("[data-cy=position-5-2]").click();
    cy.contains("Druck ab Zeile 5, Spalte 2").should("be.visible");

    // Click again to clear
    cy.get("[data-cy=position-5-2]").click();
    cy.contains("Alle Felder werden bedruckt").should("be.visible");
  });

  it("should allow picking individual cells in pick mode", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    // Switch to pick mode
    cy.get("#mode-pick").click({ force: true });

    // Click 3 cells
    cy.get("[data-cy=position-1-1]").click();
    cy.get("[data-cy=position-3-2]").click();
    cy.get("[data-cy=position-8-3]").click();

    cy.contains("3 Felder ausgewählt").should("be.visible");
  });

  it("should update grid when switching sheets", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    cy.get("[data-cy=position-picker-grid] button").should("have.length", 24);

    // Switch to 3659 (2×6 = 12 cells)
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3659");
    cy.get("[data-cy=position-picker-grid] button").should("have.length", 12);
  });

  // ─── PDF Generation ────────────────────────────────────────────────

  it("should generate PDF with latest N books", () => {
    cy.intercept("POST", "/api/labels/generate").as("generatePdf");

    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    // Set filter to latest 5
    cy.get("[data-cy=filter-latest-count]").clear().type("5");

    cy.get("[data-cy=generate-pdf-button]").should("not.be.disabled").click();

    cy.wait("@generatePdf", { timeout: 15000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request.body.bookFilter).to.deep.include({
        type: "latest",
      });
    });
  });

  it("should generate PDF with start position", () => {
    cy.intercept("POST", "/api/labels/generate").as("generatePdf");

    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    // Set start position at bottom of sheet
    cy.get("[data-cy=position-8-1]").click();

    cy.get("[data-cy=generate-pdf-button]").click();

    cy.wait("@generatePdf", { timeout: 15000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request.body.startPosition).to.deep.eq({
        row: 8,
        col: 1,
      });
    });
  });

  it("should generate PDF with explicit positions", () => {
    cy.intercept("POST", "/api/labels/generate").as("generatePdf");

    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    // Switch to pick mode and select specific cells
    cy.get("#mode-pick").click({ force: true });
    cy.get("[data-cy=position-2-1]").click();
    cy.get("[data-cy=position-5-3]").click();

    cy.get("[data-cy=generate-pdf-button]").click();

    cy.wait("@generatePdf", { timeout: 15000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request.body.positions).to.have.length(2);
    });
  });

  it("should generate PDF filtered by all books", () => {
    cy.intercept("POST", "/api/labels/generate").as("generatePdf");

    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    // Switch to "all" filter
    cy.get("#filter-all").click({ force: true });

    cy.get("[data-cy=generate-pdf-button]").click();

    cy.wait("@generatePdf", { timeout: 15000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request.body.bookFilter.type).to.eq("all");
    });
  });

  // ─── Loading & Error States ────────────────────────────────────────

  it("should show loading state during PDF generation", () => {
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    cy.get("[data-cy=generate-pdf-button]").click();

    // Button should show spinner text while generating
    cy.get("[data-cy=generate-pdf-button]").should("contain", "wird erstellt");
    cy.get("[data-cy=generate-pdf-button]").should("be.disabled");
  });

  it("should show error when API fails", () => {
    cy.intercept("POST", "/api/labels/generate", {
      statusCode: 500,
      body: { error: "Interner Serverfehler" },
    }).as("failedGenerate");

    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    cy.get("[data-cy=generate-pdf-button]").click();

    cy.wait("@failedGenerate");
    cy.get("[data-cy=print-error]").should("be.visible");
  });

  // ─── Navigation ────────────────────────────────────────────────────

  it("should navigate back to reports", () => {
    cy.get("[data-cy=back-to-reports]").click();
    cy.url().should("include", "/reports");
    cy.url().should("not.include", "/labels");
  });
});
