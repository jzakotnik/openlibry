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

// Helper: open a shadcn Select by trigger selector and pick an option.
//
// Why aria-expanded and not [role=listbox] existence:
//   Radix Select runs a CSS exit animation; the listbox element stays mounted
//   for the full animation duration and waiting for it to disappear reliably
//   times out. The trigger's aria-expanded flips to "false" synchronously the
//   moment the value is committed — no animation dependency — and once it is
//   false the body scroll-lock is also released so the next click() won't hit
//   pointer-events:none.
function selectByTrigger(triggerSelector: string, optionText: string) {
  cy.get(triggerSelector).click();
  // cy.contains("[role=option]", text) finds the option element whose text
  // matches — it targets the [role=option] div itself.
  // cy.get("[role=option]").contains(text) returns the inner <span> child;
  // clicking that span does not reliably fire Radix's onPointerUp handler on
  // the option div, so the dropdown never closes (aria-expanded stays true).
  cy.contains("[role=option]", optionText).click();
  cy.get(triggerSelector).should("have.attr", "aria-expanded", "false");
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

    // Disable all CSS animations and transitions so Radix portals unmount
    // immediately after selection. Without this, Radix's exit animations keep
    // the listbox/popover in the DOM for several hundred milliseconds, which
    // also holds the body scroll-lock (pointer-events:none) in place and
    // causes subsequent clicks to fail.
    cy.document().then((doc) => {
      const style = doc.createElement("style");
      style.id = "cypress-disable-animations";
      style.innerHTML =
        "*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }";
      doc.head.appendChild(style);
    });
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
      // Use cy.contains("[role=option]", text) to assert the option div exists,
      // consistent with how selectByTrigger clicks options.
      cy.contains("[role=option]", option).should("exist");
    });

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
    // Load a template so the editor has a known baseline alignment. Then
    // clicking a different alignment button should mark the template dirty.
    selectByTrigger("[data-cy=template-selector]", "Standard Buchetikett");

    // NOTE: The alignment buttons inside field-align-* do NOT expose a
    // reliable data-state="on"/"off" or aria-pressed attribute in this
    // shadcn/Radix version — their data-state is always "closed" (inherited
    // from a wrapping Popover/Collapsible trigger). Until data-cy attributes
    // are added to each individual alignment button (e.g. data-cy="align-left",
    // "align-center", "align-right"), we test the observable side-effect:
    // picking a different alignment marks the template dirty.
    cy.get("[data-cy=field-align-horizontal2]")
      .find("button")
      .eq(1) // center button (left=0, center=1, right=2)
      .click({ force: true }); // force bypasses any residual pointer-events:none

    cy.contains("Ungespeicherte Änderungen").should("be.visible");
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
