/// <reference types="cypress" />
describe("Rental cleanup on user deletion", () => {
  before(() => {
    cy.resetDatabase();
    cy.login();
  });

  after(() => {
    cy.cleanupDatabase();
  });

  it("should rent a book, delete the user, and verify the book is also deleted", () => {
    cy.log(Cypress.env("user"));

    // Navigate to the rental screen
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_rental_button]").click();

    cy.url().should("include", "/rental");

    // Search for and select a user
    cy.get("[data-cy=user_search_input]").should("be.visible").type("Magnus");
    cy.get("[data-cy^=user_accordion_]").first().click();
    cy.get("[data-cy^=user_accordion_details_]").first().should("be.visible");

    // Store the user ID from the accordion's data-cy attribute
    cy.get("[data-cy^=user_accordion_]")
      .filter((_, el) =>
        /user_accordion_\d+$/.test(el.getAttribute("data-cy") || ""),
      )
      .first()
      .invoke("attr", "data-cy")
      .then((dataCy) => {
        const userId = dataCy!.replace("user_accordion_", "");
        cy.wrap(userId).as("rentedUserId");
      });

    // Search for an available book
    cy.get("[data-cy=book_search_input]").should("be.visible").type("Dorf");
    cy.wait(1500);
    cy.get("[data-cy^=book_item_]").first().should("be.visible");

    // Extract the book ID directly from the data-cy attribute — no text parsing
    cy.get("[data-cy^=book_item_]")
      .first()
      .invoke("attr", "data-cy")
      .then((dataCy) => {
        const bookId = dataCy!.replace("book_item_", "");
        cy.wrap(bookId).as("rentedBookId");
        cy.log(`Renting book ID: ${bookId}`);
      });

    // Rent the book
    cy.get("[data-cy^=book_item_]")
      .first()
      .within(() => {
        cy.get("[data-cy^=book_rent_button_]").click();
      });

    // Verify the book appears in the user's accordion by its ID-scoped title element
    cy.get("@rentedBookId").then((bookId) => {
      cy.get(`[data-cy=rental_book_title_${bookId}]`, { timeout: 8000 }).should(
        "be.visible",
      );
    });

    // Navigate to the user detail page to delete the user
    cy.get("@rentedUserId").then((userId) => {
      cy.visit(`http://localhost:3000/user/${userId}`);
    });

    cy.url().should("include", "/user/");

    // Hold the delete button until it fires
    cy.get("[data-cy=delete-user-button]")
      .should("be.visible")
      .trigger("mousedown", { force: true });

    // Redirect to user list proves deletion succeeded
    cy.url({ timeout: 10000 }).should("match", /\/user$/);

    // Navigate to book list and verify the rented book was also deleted
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();

    cy.url().should("include", "/book");
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    cy.get("@rentedBookId").then((bookId) => {
      cy.get("[data-cy=rental_input_searchbook]").type(
        bookId as unknown as string,
      );
      cy.wait(2000);
      cy.get(`[data-cy=book_summary_card_${bookId}]`).should("not.exist");
      cy.get(`[data-cy=book_summary_row_${bookId}]`).should("not.exist");
    });

    // Navigate to user list and verify Magnus is gone
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_user_button]").click();

    cy.url().should("include", "/user");
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");

    cy.get("[data-cy=rental_input_searchuser]").type("Magnus");
    cy.wait(1000);
    cy.get("[data-cy^=user_list_item_]").should("not.exist");

    cy.get("[data-cy=rental_input_searchuser]").clear();
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");
  });
});
