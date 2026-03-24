/// <reference types="cypress" />

// Make this a module so the helper doesn't pollute the global script scope
// (fixes TS2393 "Duplicate function implementation" when other test files
//  also declare top-level helpers with the same name).
export {};

/**
 * Label System — Template Editor Page
 *
 * Tests the /reports/labels/editor page: loading templates,
 * editing fields, live PDF preview, saving, and cleanup.
 */

// Helper: wait for Radix to release body scroll-lock, then open a shadcn
// Select by trigger selector and pick an option.
function selectByTrigger(triggerSelector: string, optionText: string) {
  // Radix sets data-scroll-locked="1" on <body> while a Select is open;
  // waiting for it to clear prevents the "pointer-events: none" error when
  // multiple selects are used in the same test.
  cy.get("body").should("not.have.attr", "data-scroll-locked");
  cy.get(triggerSelector).click();
  cy.get("[role=option]").contains(optionText).click();
}

describe("Label Template Editor", () => {
  const TEMPLATE_FILE =
    "database/custom/labels/templates/cypress-editor-test.json";

  before(() => {
    cy.resetDatabase();
  });

  after(() => {
    // Clean up any template created during tests
    cy.task("deleteFile", TEMPLATE_FILE);
    cy.cleanupDatabase();
  });

  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/reports/labels/editor");
  });

  // ─── Page Load ─────────────────────────────────────────────────────

  it("should display all editor controls on load", () => {
    cy.get("[data-cy=template-selector]").should("be.visible");
    cy.get("[data-cy=new-template-button]").should("be.visible");
    cy.get("[data-cy=template-name-input]").should("be.visible");
    cy.get("[data-cy=sheet-selector]").should("be.visible");
    cy.get("[data-cy=spine-width-slider]").should("be.visible");
    cy.get("[data-cy=save-template-button]").should("be.visible");

    // Four field assignment rows
    cy.get("[data-cy=field-content-spine]").should("be.visible");
    cy.get("[data-cy=field-content-horizontal1]").should("be.visible");
    cy.get("[data-cy=field-content-horizontal2]").should("be.visible");
    cy.get("[data-cy=field-content-horizontal3]").should("be.visible");
  });

  // ─── Load Existing Template ────────────────────────────────────────

  it("should load the default template via dropdown", () => {
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");

    cy.get("[data-cy=template-name-input]").should(
      "have.value",
      "Standard Buchetikett",
    );
  });

  it("should load a template via deep link query param", () => {
    cy.visit("http://localhost:3000/reports/labels/editor?template=default");

    cy.get("[data-cy=template-name-input]", { timeout: 5000 }).should(
      "have.value",
      "Standard Buchetikett",
    );
  });

  // ─── "Neu" Button ──────────────────────────────────────────────────

  it("should reset form when clicking Neu", () => {
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    cy.get("[data-cy=template-name-input]").should(
      "have.value",
      "Standard Buchetikett",
    );

    cy.get("[data-cy=new-template-button]").click();

    cy.get("[data-cy=template-name-input]").should("have.value", "");
  });

  // ─── Field Assignment ──────────────────────────────────────────────

  it("should allow changing field content via dropdown", () => {
    selectByTrigger("[data-cy=field-content-horizontal1]", "Schulname");

    cy.get("[data-cy=field-content-horizontal1]").should(
      "contain",
      "Schulname",
    );
  });

  it("should offer all content types in the dropdown", () => {
    cy.get("[data-cy=field-content-horizontal1]").click();

    const expectedOptions = [
      "Titel",
      "Untertitel",
      "Autor",
      "Buchnummer",
      "Schulname",
      "Themen (max. 3)",
      "Barcode",
      "Leer",
    ];

    expectedOptions.forEach((option) => {
      cy.get("[role=option]").contains(option).should("exist");
    });

    // Fix: Cypress uses {esc}, not {escape}
    cy.get("body").type("{esc}");
  });

  it("should disable font size input when barcode is selected", () => {
    selectByTrigger("[data-cy=field-content-horizontal3]", "Barcode");
    cy.get("[data-cy=field-fontsize-horizontal3]").should("be.disabled");
  });

  it("should enable font size input for text fields", () => {
    selectByTrigger("[data-cy=field-content-horizontal1]", "Titel");
    cy.get("[data-cy=field-fontsize-horizontal1]").should("not.be.disabled");
  });

  it("should allow changing font size", () => {
    // Fix: .clear() does not reliably reset a React-controlled number input.
    // Using {selectAll} before typing ensures the existing value is replaced.
    cy.get("[data-cy=field-fontsize-horizontal1]")
      .click()
      .type("{selectAll}14");
    cy.get("[data-cy=field-fontsize-horizontal1]").should("have.value", "14");
  });

  it("should allow changing alignment", () => {
    cy.get("[data-cy=field-align-horizontal2]").within(() => {
      cy.get("button").eq(1).click(); // center is the 2nd button (0-indexed)
    });

    // Fix: Radix ToggleGroupItem signals the active state via aria-pressed="true",
    // not data-state="on" (which is reserved for Radix Collapsible / Accordion).
    cy.get("[data-cy=field-align-horizontal2]").within(() => {
      cy.get("button").eq(1).should("have.attr", "aria-pressed", "true");
    });
  });

  // ─── Spine Width Slider ────────────────────────────────────────────

  it("should display the current spine width percentage", () => {
    cy.get("[data-cy=spine-width-slider]")
      .parent()
      .parent()
      .should("contain", "%");
  });

  // ─── Preview ───────────────────────────────────────────────────────

  it("should render PDF preview after selecting a sheet", () => {
    cy.intercept("POST", "/api/labels/generate").as("previewGenerate");

    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    cy.wait("@previewGenerate", { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request.body).to.have.property("template");
    });

    cy.get("[data-cy=label-preview-iframe]", { timeout: 5000 }).should("exist");
  });

  it("should send inline template matching editor state in preview", () => {
    cy.intercept("POST", "/api/labels/generate").as("previewGenerate");

    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    selectByTrigger("[data-cy=field-content-horizontal1]", "Autor");

    cy.wait("@previewGenerate", { timeout: 10000 }).then((interception) => {
      const template = interception.request.body.template;
      expect(template.fields.horizontal1.content).to.eq("author");
    });
  });

  // ─── Save Template ─────────────────────────────────────────────────

  it("should save a new template and show success", () => {
    cy.intercept("POST", "/api/labels/templates").as("saveTemplate");

    cy.get("[data-cy=template-name-input]")
      .click()
      .type("{selectAll}Cypress Editor Test");
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    selectByTrigger("[data-cy=field-content-spine]", "Buchnummer");
    selectByTrigger("[data-cy=field-content-horizontal1]", "Titel");
    selectByTrigger("[data-cy=field-content-horizontal2]", "Autor");
    selectByTrigger("[data-cy=field-content-horizontal3]", "Barcode");

    cy.get("[data-cy=save-template-button]").click();

    cy.wait("@saveTemplate", { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });

    cy.get("[data-cy=save-success]").should("be.visible");
  });

  it("should show saved template in the dropdown after saving", () => {
    selectByTrigger("[data-cy=template-selector]", "Cypress Editor Test");
    cy.get("[data-cy=template-name-input]").should(
      "have.value",
      "Cypress Editor Test",
    );
  });

  it("should show error when saving without a name", () => {
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    // Fix: the Save button is intentionally disabled when the name field is
    // empty — assert that state rather than trying to click a disabled button.
    cy.get("[data-cy=template-name-input]").invoke("val", "").trigger("input");
    cy.get("[data-cy=save-template-button]").should("be.disabled");
  });

  // ─── Dirty State ───────────────────────────────────────────────────

  it("should show dirty indicator after changes", () => {
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");

    cy.get("[data-cy=template-name-input]").click().type("{selectAll}Geändert");

    cy.contains("Ungespeicherte Änderungen").should("be.visible");
  });

  // ─── Navigation ────────────────────────────────────────────────────

  it("should navigate back to reports", () => {
    cy.get("[data-cy=back-to-reports]").click();
    cy.url().should("include", "/reports");
    cy.url().should("not.include", "/labels");
  });
});
