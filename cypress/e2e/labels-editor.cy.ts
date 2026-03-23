/// <reference types="cypress" />

/**
 * Label System — Template Editor Page
 *
 * Tests the /reports/labels/editor page: loading templates,
 * editing fields, live PDF preview, saving, and cleanup.
 */

// Helper: open a shadcn Select by trigger selector and pick an option
function selectByTrigger(triggerSelector: string, optionText: string) {
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

    // Name should be filled
    cy.get("[data-cy=template-name-input]").should(
      "have.value",
      "Standard Buchetikett",
    );
  });

  it("should load a template via deep link query param", () => {
    cy.visit(
      "http://localhost:3000/reports/labels/editor?template=default",
    );

    // Wait for the template to load
    cy.get("[data-cy=template-name-input]", { timeout: 5000 }).should(
      "have.value",
      "Standard Buchetikett",
    );
  });

  // ─── "Neu" Button ──────────────────────────────────────────────────

  it("should reset form when clicking Neu", () => {
    // First load a template
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");
    cy.get("[data-cy=template-name-input]").should(
      "have.value",
      "Standard Buchetikett",
    );

    // Click Neu
    cy.get("[data-cy=new-template-button]").click();

    // Name should be cleared
    cy.get("[data-cy=template-name-input]").should("have.value", "");
  });

  // ─── Field Assignment ──────────────────────────────────────────────

  it("should allow changing field content via dropdown", () => {
    // Change horizontal1 to "Schulname"
    selectByTrigger("[data-cy=field-content-horizontal1]", "Schulname");

    // Verify dropdown shows the new value
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

    cy.get("body").type("{escape}");
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
    cy.get("[data-cy=field-fontsize-horizontal1]").clear().type("14");
    cy.get("[data-cy=field-fontsize-horizontal1]").should("have.value", "14");
  });

  it("should allow changing alignment", () => {
    // Click the center alignment button for horizontal2
    cy.get("[data-cy=field-align-horizontal2]").within(() => {
      cy.get("button").eq(1).click(); // center is the 2nd button
    });

    // The center button should be active (pressed state)
    cy.get("[data-cy=field-align-horizontal2]").within(() => {
      cy.get("button")
        .eq(1)
        .should("have.attr", "data-state", "on");
    });
  });

  // ─── Spine Width Slider ────────────────────────────────────────────

  it("should display the current spine width percentage", () => {
    // The slider area should show a percentage value
    cy.get("[data-cy=spine-width-slider]")
      .parent()
      .parent()
      .should("contain", "%");
  });

  // ─── Preview ───────────────────────────────────────────────────────

  it("should render PDF preview after selecting a sheet", () => {
    cy.intercept("POST", "/api/labels/generate").as("previewGenerate");

    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    // Wait for debounce + render
    cy.wait("@previewGenerate", { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      // Should use inline template, not a saved templateId
      expect(interception.request.body).to.have.property("template");
    });

    cy.get("[data-cy=label-preview-iframe]", { timeout: 5000 }).should(
      "exist",
    );
  });

  it("should send inline template matching editor state in preview", () => {
    cy.intercept("POST", "/api/labels/generate").as("previewGenerate");

    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");
    selectByTrigger("[data-cy=field-content-horizontal1]", "Autor");

    // Wait for the debounced preview to fire
    cy.wait("@previewGenerate", { timeout: 10000 }).then((interception) => {
      const template = interception.request.body.template;
      expect(template.fields.horizontal1.content).to.eq("author");
    });
  });

  // ─── Save Template ─────────────────────────────────────────────────

  it("should save a new template and show success", () => {
    cy.intercept("POST", "/api/labels/templates").as("saveTemplate");

    // Fill in the form
    cy.get("[data-cy=template-name-input]").clear().type("Cypress Editor Test");
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
    // The template from the previous test should appear
    cy.get("[data-cy=template-selector]").click();
    cy.get("[role=option]")
      .contains("Cypress Editor Test")
      .should("exist");
    cy.get("body").type("{escape}");
  });

  it("should show error when saving without a name", () => {
    cy.get("[data-cy=template-name-input]").clear();
    selectByTrigger("[data-cy=sheet-selector]", "Zweckform 3474");

    cy.get("[data-cy=save-template-button]").click();

    cy.get("[data-cy=save-error]").should("be.visible");
  });

  // ─── Dirty State ───────────────────────────────────────────────────

  it("should show dirty indicator after changes", () => {
    // Load a template first to have a clean state
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");

    // Make a change
    cy.get("[data-cy=template-name-input]").clear().type("Geändert");

    // Dirty indicator should appear
    cy.contains("Ungespeicherte Änderungen").should("be.visible");
  });

  // ─── Navigation ────────────────────────────────────────────────────

  it("should navigate back to reports", () => {
    cy.get("[data-cy=back-to-reports]").click();
    cy.url().should("include", "/reports");
    cy.url().should("not.include", "/labels");
  });
});
