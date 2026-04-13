/// <reference types="cypress" />

describe("Public book catalog", () => {
  // The public catalog page includes a Footer that fetches /api/version, which
  // is auth-protected. In dev mode this causes Next.js to show its error
  // overlay (<nextjs-portal>), which can steal keyboard focus and break
  // cy.type(). Suppress uncaught exceptions for this whole suite — the
  // relevant assertions are structural, not error-boundary tests.
  Cypress.on("uncaught:exception", () => false);

  before(() => {
    cy.resetDatabase();
  });

  after(() => {
    cy.cleanupDatabase();
  });

  // No login — this is the whole point of the test suite
  beforeEach(() => {
    cy.visit("http://localhost:3000/catalog");
  });

  it("should load the catalog without authentication", () => {
    // If middleware exclusion is broken, Next.js redirects to /auth/login
    cy.url().should("include", "/catalog");
    cy.url().should("not.include", "/auth/login");
  });

  it("should show the search bar without admin controls", () => {
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // These controls must not exist on the public page
    cy.get("[data-cy=create_book_button]").should("not.exist");
    cy.get("[data-cy=batchscan_button]").should("not.exist");
  });

  it("should render book cards", () => {
    // At least one card should be present after DB reset
    cy.get("[data-cy^=book_summary_card_]").should(
      "have.length.greaterThan",
      0,
    );
  });

  it("should not show edit or return controls on cards", () => {
    cy.get("[data-cy^=book_summary_card_]")
      .first()
      .within(() => {
        cy.get("[data-cy=book_card_editbutton]").should("not.exist");
        cy.get("[data-cy=book_card_printbutton]").should("not.exist");
      });
  });

  it("should filter books when searching", () => {
    cy.get("[data-cy^=book_summary_card_]")
      .its("length")
      .then((totalCount) => {
        // Click first to guarantee focus lands on the input and not on any
        // dev overlay that may have appeared due to the /api/version redirect.
        cy.get("[data-cy=rental_input_searchbook]").click().type("a");
        cy.get("[data-cy^=book_summary_card_]").should(
          "have.length.lessThan",
          totalCount,
        );
      });
  });

  it("should clear search results when input is cleared", () => {
    cy.get("[data-cy^=book_summary_card_]")
      .its("length")
      .then((totalCount) => {
        cy.get("[data-cy=rental_input_searchbook]").click().type("a").clear();
        cy.get("[data-cy^=book_summary_card_]").should(
          "have.length",
          totalCount,
        );
      });
  });
});
