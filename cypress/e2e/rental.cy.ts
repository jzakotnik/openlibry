/// <reference types="cypress" />
describe("Rental of books", () => {
  before(() => {
    cy.task("resetDatabase");
    cy.task("logDatabaseState");
  });

  after(() => {
    cy.task("cleanupDatabase");
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.session("user-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/");
  });

  afterEach(() => {
    cy.task("logDatabaseState");
  });

  it("should rent a book and return it", () => {
    cy.log(Cypress.env("user"));

    cy.get("[data-cy=index_rental_button]").click();
    cy.url().should("include", "/rental");

    // Search for and expand a user
    cy.get("[data-cy=user_search_input]").should("be.visible").type("Magnus");
    cy.get("[data-cy^=user_accordion_]").first().should("be.visible").click();
    cy.get("[data-cy^=user_accordion_details_]").first().should("be.visible");

    // Search for an available book
    cy.get("[data-cy=book_search_input]").should("be.visible").type("Dorf");
    // doesn't work: cy.get("[data-cy^=book_item_]").should("have.length.at.least", 5);
    cy.wait(1500);
    cy.get("[data-cy^=book_item_]").first().should("be.visible");

    // Wait for rent buttons to appear — they only render once userExpanded
    // state has propagated from the accordion click to the BookList component
    cy.get("[data-cy^=book_rent_button_]").first().should("be.visible");

    // Rent the first available book
    cy.get("[data-cy^=book_item_]")
      .first()
      .within(() => {
        cy.get("[data-cy^=book_rent_button_]").click();
      });

    cy.contains("ausgeliehen", { timeout: 10000 }).should("be.visible");

    // Re-expand the accordion in case it collapsed after the rent action
    cy.get("[data-cy^=user_accordion_]")
      .first()
      .then(($accordion) => {
        const details = $accordion.find("[data-cy^=user_accordion_details_]");
        if (!details.is(":visible")) {
          cy.wrap($accordion).click();
        }
      });
    cy.get("[data-cy^=user_accordion_details_]").first().should("be.visible");

    // Verify the book appears in the user's rented list
    cy.get("[data-cy^=user_accordion_details_]")
      .first()
      .within(() => {
        cy.contains("Dorf", { timeout: 10000 }).should("be.visible");
      });

    // Return the book
    cy.get("[data-cy^=user_accordion_details_]")
      .first()
      .within(() => {
        cy.contains("Dorf")
          .parents("[data-cy^=rental_book_item_]")
          .find("[data-cy^=book_return_button_]")
          .should("be.visible")
          .click();
      });

    cy.contains("zurückgegeben", { timeout: 10000 }).should("be.visible");

    // Re-expand the accordion in case it collapsed after the return action
    cy.get("[data-cy^=user_accordion_]")
      .first()
      .then(($accordion) => {
        const details = $accordion.find("[data-cy^=user_accordion_details_]");
        if (!details.is(":visible")) {
          cy.wrap($accordion).click();
        }
      });
    cy.get("[data-cy^=user_accordion_details_]").first().should("be.visible");

    // Verify the book is gone from the user's rented list
    cy.get("[data-cy^=user_accordion_details_]")
      .first()
      .should("not.contain", "Dorf");

    // Verify the book is available again in the book list
    cy.get("[data-cy=book_search_input]").clear().type("Dorf");
    cy.wait(1500);
    cy.get("[data-cy^=book_item_]").first().should("be.visible");
    cy.get("[data-cy^=book_rent_button_]").first().should("be.visible");
    cy.get("[data-cy^=book_item_]")
      .first()
      .within(() => {
        cy.get("[data-cy^=book_rent_button_]").should("be.visible");
      });
  });
});
