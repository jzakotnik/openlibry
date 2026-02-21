/// <reference types="cypress" />
describe("Rental of books", () => {
  before(() => {
    cy.resetDatabase();
    cy.login();
  });

  after(() => {
    cy.cleanupDatabase();
  });

  it("should rent a book and return it", () => {
    cy.log(Cypress.env("user"));

    // Navigate to the rental screen
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_rental_button]").click();

    // Wait for the rental page to load - should see both user and book lists
    cy.url().should("include", "/rental");

    // Search for and select a user (UserRentalList component)
    cy.get("[data-cy=user_search_input]").should("be.visible").type("Magnus");
    cy.wait(1000);

    // Click on the first user accordion to expand it
    cy.get("[data-cy^=user_accordion_]").first().click();

    // The user accordion should expand - verify user details are visible
    cy.get("[data-cy^=user_accordion_details_]").first().should("be.visible");

    // Search for an available book (BookRentalList component)
    cy.get("[data-cy=book_search_input]").should("be.visible").type("Dorf");
    cy.wait(1000); //this is asynchronous now!

    // Find an available book (not rented) and click the rent button
    cy.get("[data-cy^=book_item_]")
      .first()
      .within(() => {
        cy.get("[data-cy^=book_rent_button_]").click();
      });

    cy.wait(5000);
    // Verify rental success message appears
    cy.contains("ausgeliehen").should("be.visible");

    // The book should now appear in the user's rented books list
    cy.get("[data-cy^=user_accordion_details_]")
      .first()
      .within(() => {
        cy.contains("Dorf").should("be.visible");
      });

    // Return the book - find the return button for the rented book
    cy.get("[data-cy^=user_accordion_details_]")
      .first()
      .within(() => {
        cy.contains("Dorf")
          .parents("[data-cy^=rental_book_item_]")
          .find("[data-cy^=book_return_button_]")
          .click();
      });

    // Verify return success message appears
    cy.contains("zurückgegeben").should("be.visible");
    cy.wait(5000);
    // Verify the book is no longer in the user's rented list
    cy.get("[data-cy^=user_accordion_details_]")
      .first()
      .should("not.contain", "Dorf");

    // The book should now be available again in the book list
    cy.get("[data-cy=book_search_input]").clear().type("Dorf");
    cy.get("[data-cy^=book_item_]")
      .first()
      .within(() => {
        cy.get("[data-cy^=book_rent_button_]").should("be.visible");
      });
  });
});
