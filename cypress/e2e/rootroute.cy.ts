/// <reference types="cypress" />

// Covers the default configuration, where OPENLIBRY_ROOT_ROUTE is unset and /
// therefore redirects to the internal landing page at /manage. If your
// .env.test.local sets OPENLIBRY_ROOT_ROUTE these will fail; the public-catalog
// configuration has its own spec in rootroute-public.cy.ts, which needs a
// separately configured server (npm run test:e2e:publicroot).

describe("Root route redirect", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  it("should bounce an unauthenticated visitor from / to the login page", () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/");

    cy.url().should("include", "/auth/login");
    cy.url().should("not.include", "/catalog");
    cy.get('input[id="user"]').should("be.visible");
  });

  it("should return to the landing page after logging in from /", () => {
    cy.login();

    cy.url().should("include", "/manage");
  });

  it("should send an authenticated visitor from / to /manage", () => {
    cy.login();
    cy.visit("/");

    cy.url().should("include", "/manage");
    cy.get("[data-cy=indexpage]").should("be.visible");
  });
});
