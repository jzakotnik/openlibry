/// <reference types="cypress" />

// The camera itself cannot be driven from Cypress: getUserMedia needs a real
// device and a permission grant that headless Chrome will not fake. What is
// worth covering is everything around it, above all the secure-context guard.
// That is not an edge case here: OpenLibry is typically served over plain HTTP
// on a school LAN, where the browser exposes no camera at all, so this is the
// path most installations will actually take.

describe("Camera barcode scanner", () => {
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
  });

  it("should offer a camera button next to the batch scan ISBN input", () => {
    cy.visit("http://localhost:3000/book/batchscan");
    cy.get("[data-cy=batch-scan-camera-button]").should("be.visible");
  });

  it("should warn instead of clearing the field when the ISBN is empty", () => {
    cy.visit("http://localhost:3000/book/batchscan");
    cy.get("[data-cy=batch-scan-add-button]").click();
    cy.contains("Bitte eine gültige ISBN eingeben").should("be.visible");
    cy.get("[data-cy=batch-scan-entry]").should("not.exist");
  });

  it("should explain that HTTPS is needed when the page is not a secure context", () => {
    cy.visit("http://localhost:3000/book/batchscan", {
      onBeforeLoad(win) {
        // Plain HTTP on a LAN: navigator.mediaDevices is undefined and the
        // zxing call throws. Without the guard this surfaced as the generic
        // "Kamerazugriff nicht möglich." with no hint at the real cause.
        Object.defineProperty(win, "isSecureContext", {
          value: false,
          configurable: true,
        });
      },
    });

    cy.get("[data-cy=batch-scan-camera-button]").click();
    cy.contains("HTTPS").should("be.visible");
    // Retrying cannot succeed without a secure context, so no retry button.
    cy.contains("Erneut versuchen").should("not.exist");
  });

  it("should close the scanner overlay again", () => {
    cy.visit("http://localhost:3000/book/batchscan", {
      onBeforeLoad(win) {
        Object.defineProperty(win, "isSecureContext", {
          value: false,
          configurable: true,
        });
      },
    });

    // Match the overlay itself, not its title: the page heading behind it
    // reads "ISBN scannen oder eingeben" and would satisfy a text assertion.
    cy.get("[data-cy=batch-scan-camera-button]").click();
    cy.get("[data-cy=camera-scanner-overlay]").should("be.visible");
    cy.get("[aria-label=Schließen]").click();
    cy.get("[data-cy=camera-scanner-overlay]").should("not.exist");
    cy.get("[data-cy=batch-scan-isbn-input]").should("be.visible");
  });

  it("should offer the camera button on the book edit ISBN field", () => {
    cy.visit("http://localhost:3000/book/new");
    cy.get("[data-cy=book-isbn-camera-button]").should("exist");
  });
});
