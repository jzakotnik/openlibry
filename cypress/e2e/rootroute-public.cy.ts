/// <reference types="cypress" />

// Runs only against a server started with OPENLIBRY_ROOT_ROUTE=/catalog:
//
//   npm run test:e2e:publicroot
//
// This is the other half of the middleware check in proxy.ts, which exempts /
// from authentication only when the configured target is itself public. The
// env var is read server-side, so it cannot be flipped from inside a spec and
// this case needs its own server rather than living in rootroute.cy.ts.

describe("Root route pointed at the public catalog", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should serve the catalog at / without authentication", () => {
    cy.visit("/");

    cy.url().should("include", "/catalog");
    cy.url().should("not.include", "/auth/login");
    // Generous timeout: this is usually the first page the dev server has to
    // compile in this run, and the default 4s can expire before it responds.
    cy.get("[data-cy^=book_summary_card_]", { timeout: 20000 }).should(
      "have.length.greaterThan",
      0,
    );
  });

  it("should still gate the internal landing page", () => {
    cy.visit("/manage");

    cy.url().should("include", "/auth/login");
  });
});
