/// <reference types="cypress" />

/**
 * Label System — Reports Page Integration
 *
 * Smoke tests that the label cards exist on the Reports page
 * and navigate to the correct routes.
 */

describe("Label cards on Reports page", () => {
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
    cy.visit("http://localhost:3000/reports");
  });

  it("should show the print card", () => {
    cy.get("[data-cy=book-label-print-card]").should("be.visible");
  });

  it("should show the editor card", () => {
    cy.get("[data-cy=book-label-editor-card]").should("be.visible");
  });

  it("should navigate to the print page", () => {
    cy.get("[data-cy=open-label-print]").click();
    cy.url().should("include", "/reports/labels/print");
    cy.get("[data-cy=generate-pdf-button]").should("be.visible");
  });

  it("should navigate to the editor page", () => {
    cy.get("[data-cy=open-label-editor]").click();
    cy.url().should("include", "/reports/labels/editor");
    cy.get("[data-cy=save-template-button]").should("be.visible");
  });

  it("should not show the old BookLabelsCard", () => {
    cy.get("[data-cy=book-labels-card]").should("not.exist");
  });
});
