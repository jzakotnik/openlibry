/// <reference types="cypress" />

describe("Public book catalog", () => {
  Cypress.on("uncaught:exception", () => false);

  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  // No login — this is the whole point of the test suite
  beforeEach(() => {
    cy.visit("http://localhost:3000/catalog");
  });

  it("should load the catalog without authentication", () => {
    cy.url().should("include", "/catalog");
    cy.url().should("not.include", "/auth/login");
  });

  it("should show the search bar without admin controls", () => {
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");
    cy.get("[data-cy=create_book_button]").should("not.exist");
    cy.get("[data-cy=batchscan_button]").should("not.exist");
  });

  it("should render book cards", () => {
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
        cy.get("[data-cy=rental_input_searchbook]").click().type("editierbar");
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
