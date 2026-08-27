/// <reference types="cypress" />

export {};

function selectByTrigger(triggerSelector: string, optionText: string) {
  cy.get(triggerSelector).click();
  cy.contains("[role=option]", optionText).click();
  cy.get(triggerSelector).should("have.attr", "aria-expanded", "false");
}

describe("Label Print Page", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/reports/labels/print");

    cy.document().then((doc) => {
      const style = doc.createElement("style");
      style.id = "cypress-disable-animations";
      style.innerHTML =
        "*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }";
      doc.head.appendChild(style);
    });
  });

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

  it("should populate sheet selector from API", () => {
    cy.intercept("GET", "/api/labels/sheets").as("loadSheets");
    cy.visit("http://localhost:3000/reports/labels/print");
    cy.wait("@loadSheets").its("response.statusCode").should("be.oneOf", [200, 304]);
    cy.get("[data-cy=sheet-selector]").click();
    cy.get("[role=option]").should("have.length.greaterThan", 0);
    cy.get("body").type("{esc}");
  });

  it("should populate template selector from API", () => {
    cy.intercept("GET", "/api/labels/templates").as("loadTemplates");
    cy.visit("http://localhost:3000/reports/labels/print");
    cy.wait("@loadTemplates").its("response.statusCode").should("be.oneOf", [200, 304]);
    cy.get("[data-cy=template-selector]").click();
    cy.get("[role=option]").should("have.length.greaterThan", 0);
    cy.get("body").type("{esc}");
  });

  it("should allow selecting 'Neueste' filter with count", () => {
    cy.get("#filter-latest").should("have.attr", "aria-checked", "true");
    cy.get("[data-cy=filter-latest-count]")
      .should("not.be.disabled")
      .click()
      .type("{selectAll}10");
    cy.get("[data-cy=filter-latest-count]").should("have.value", "10");
  });

  it("should allow selecting 'Schlagwort' filter with text input", () => {
    cy.get("#filter-topic").click();
    cy.get("#filter-topic").should("have.attr", "aria-checked", "true");
    cy.get("[data-cy=filter-topic-combobox]").should("not.be.disabled");
    cy.get("[data-cy=filter-topic-combobox]").click();
    cy.get("[cmdk-input]").should("be.visible");
    cy.get("body").type("{esc}");
  });

  it("should allow selecting 'Alle Bücher' filter", () => {
    cy.get("#filter-all").click();
    cy.get("#filter-all").should("have.attr", "aria-checked", "true");
    cy.get("[data-cy=filter-latest-count]").should("be.disabled");
    cy.get("[data-cy=filter-topic-combobox]").should("be.disabled");
    cy.get("[data-cy=filter-ids-input]").should("be.disabled");
  });

  it("should allow selecting 'Buch-IDs' filter with ID input", () => {
    cy.get("#filter-ids").click();
    cy.get("#filter-ids").should("have.attr", "aria-checked", "true");
    cy.get("[data-cy=filter-ids-input]")
      .should("not.be.disabled")
      .click()
      .type("{selectAll}42");
    cy.get("[data-cy=filter-ids-input]").should("have.value", "42");
  });

  it("should show position picker after sheet selection", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    cy.get("[data-cy=position-picker-grid]").should("be.visible");
    cy.get("[data-cy=position-picker-grid] button").should("have.length", 24);
  });

  it("should highlight start position in start mode", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    cy.get("[data-cy=position-5-2]").click();
    cy.get("[data-cy=position-5-2]").should("have.class", "bg-primary");
    cy.get("[data-cy=position-1-1]").should("have.class", "bg-muted/50");
    cy.contains("Druck ab Zeile 5, Spalte 2").should("be.visible");
  });

  it("should toggle start position off when clicking same cell", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    cy.get("[data-cy=position-5-2]").click();
    cy.contains("Druck ab Zeile 5, Spalte 2").should("be.visible");
    cy.get("[data-cy=position-5-2]").click();
    cy.contains("Alle Felder werden bedruckt").should("be.visible");
  });

  it("should allow picking individual cells in pick mode", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    cy.get("#mode-pick").click();
    cy.get("[data-cy=position-1-1]").click();
    cy.get("[data-cy=position-3-2]").click();
    cy.get("[data-cy=position-8-3]").click();
    cy.contains("3 Felder ausgewählt").should("be.visible");
  });

  it("should update grid when switching sheets", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    cy.get("[data-cy=position-picker-grid] button").should("have.length", 24);
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3659");
    cy.get("[data-cy=position-picker-grid] button").should("have.length", 12);
  });

  it("should generate PDF with latest N books", () => {
    cy.intercept("POST", "/api/labels/generate").as("generatePdf");
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    cy.get("[data-cy=filter-latest-count]").click().type("{selectAll}5");
    cy.get("[data-cy=generate-pdf-button]").should("not.be.disabled").click();
    cy.wait("@generatePdf", { timeout: 15000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request.body.bookFilter).to.deep.include({ type: "latest" });
    });
  });

  it("should generate PDF with start position", () => {
    cy.intercept("POST", "/api/labels/generate").as("generatePdf");
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    cy.get("[data-cy=position-8-1]").click();
    cy.get("[data-cy=generate-pdf-button]").click();
    cy.wait("@generatePdf", { timeout: 15000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request.body.startPosition).to.deep.eq({ row: 8, col: 1 });
    });
  });

  it("should generate PDF with explicit positions", () => {
    cy.intercept("POST", "/api/labels/generate").as("generatePdf");
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    cy.get("#mode-pick").click();
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
    cy.get("#filter-all").click();
    cy.get("[data-cy=generate-pdf-button]").click();
    cy.wait("@generatePdf", { timeout: 15000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request.body.bookFilter.type).to.eq("all");
    });
  });

  it("should show loading state during PDF generation", () => {
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    cy.get("[data-cy=generate-pdf-button]").click();
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

  it("should navigate back to reports", () => {
    cy.get("[data-cy=back-to-reports]").click();
    cy.url().should("include", "/reports");
    cy.url().should("not.include", "/labels");
  });
});
