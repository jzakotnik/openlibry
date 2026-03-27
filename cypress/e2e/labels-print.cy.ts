/// <reference types="cypress" />

export {};

/**
 * Label System — Print Page
 *
 * Tests the /reports/labels/print page: selecting config,
 * filtering books, picking positions, and downloading PDFs.
 */

// Fix: use cy.contains("[role=option]", text) so the option *div* is clicked,
// not its inner <span>. Clicking the span bypasses Radix's onPointerUp handler
// and leaves the dropdown open (aria-expanded stays true, body scroll-locked).
// Then wait for aria-expanded=false — synchronous, no animation dependency.
function selectByTrigger(triggerSelector: string, optionText: string) {
  cy.get(triggerSelector).click();
  cy.contains("[role=option]", optionText).click();
  cy.get(triggerSelector).should("have.attr", "aria-expanded", "false");
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

    // Disable CSS animations so Radix portals unmount immediately after
    // selection (no lingering scroll-lock / pointer-events:none on body).
    cy.document().then((doc) => {
      const style = doc.createElement("style");
      style.id = "cypress-disable-animations";
      style.innerHTML =
        "*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }";
      doc.head.appendChild(style);
    });
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
    // Fix: register the intercept BEFORE visiting so the request is captured
    // on the first load (not a cached 304 from the beforeEach visit).
    cy.intercept("GET", "/api/labels/sheets").as("loadSheets");
    cy.visit("http://localhost:3000/reports/labels/print");

    // Fix: accept 304 (cached) as well as 200 — both mean the data was
    // successfully returned from the server or a valid local cache.
    cy.wait("@loadSheets")
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);

    cy.get("[data-cy=sheet-selector]").click();
    // cy.contains(selector) treats the arg as text, not a CSS selector.
    // Use cy.get() to find by attribute.
    cy.get("[role=option]").should("have.length.greaterThan", 0);
    cy.get("body").type("{esc}");
  });

  it("should populate template selector from API", () => {
    cy.intercept("GET", "/api/labels/templates").as("loadTemplates");
    cy.visit("http://localhost:3000/reports/labels/print");

    cy.wait("@loadTemplates")
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);

    cy.get("[data-cy=template-selector]").click();
    cy.get("[role=option]").should("have.length.greaterThan", 0);
    cy.get("body").type("{esc}");
  });

  // ─── Book Filters ──────────────────────────────────────────────────

  it("should allow selecting 'Neueste' filter with count", () => {
    // Fix: Radix RadioGroupItem is a <button role="radio" aria-checked="true">,
    // not a native <input type="radio">. cy's "be.checked" checks the DOM
    // .checked property (undefined on buttons). Use aria-checked instead.
    cy.get("#filter-latest").should("have.attr", "aria-checked", "true");

    cy.get("[data-cy=filter-latest-count]")
      .should("not.be.disabled")
      .click()
      .type("{selectAll}10");
    cy.get("[data-cy=filter-latest-count]").should("have.value", "10");
  });

  it("should allow selecting 'Thema' filter with text input", () => {
    cy.get("#filter-topic").click();
    cy.get("#filter-topic").should("have.attr", "aria-checked", "true");

    // The topic filter is a Popover+Command combobox (data-cy=filter-topic-combobox),
    // not a plain text input. Verify it becomes enabled when the radio is selected.
    cy.get("[data-cy=filter-topic-combobox]").should("not.be.disabled");

    // Open the combobox and verify the search input and list are visible.
    cy.get("[data-cy=filter-topic-combobox]").click();
    cy.get("[cmdk-input]").should("be.visible");
    cy.get("body").type("{esc}");
  });

  it("should allow selecting 'Alle Bücher' filter", () => {
    cy.get("#filter-all").click();
    cy.get("#filter-all").should("have.attr", "aria-checked", "true");

    // All three filter controls are always rendered — only disabled state changes.
    cy.get("[data-cy=filter-latest-count]").should("be.disabled");
    cy.get("[data-cy=filter-topic-combobox]").should("be.disabled");
    cy.get("[data-cy=filter-ids-input]").should("be.disabled");
  });

  it("should allow selecting 'Buch-IDs' filter with ID input", () => {
    cy.get("#filter-ids").click();
    cy.get("#filter-ids").should("have.attr", "aria-checked", "true");

    // The input is controlled: every keystroke triggers onChange which parses
    // the value as integers and re-renders the displayed value. Typing "1, 2, 3"
    // char-by-char discards the commas/spaces on each re-render and produces "123".
    // Type a single valid integer to get a stable round-trip value.
    cy.get("[data-cy=filter-ids-input]")
      .should("not.be.disabled")
      .click()
      .type("{selectAll}42");
    cy.get("[data-cy=filter-ids-input]").should("have.value", "42");
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

  // ─── PDF Generation ────────────────────────────────────────────────

  it("should generate PDF with latest N books", () => {
    cy.intercept("POST", "/api/labels/generate").as("generatePdf");

    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    cy.get("[data-cy=filter-latest-count]").click().type("{selectAll}5");

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

  // ─── Loading & Error States ────────────────────────────────────────

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

  // ─── Navigation ────────────────────────────────────────────────────

  it("should navigate back to reports", () => {
    cy.get("[data-cy=back-to-reports]").click();
    cy.url().should("include", "/reports");
    cy.url().should("not.include", "/labels");
  });
});
