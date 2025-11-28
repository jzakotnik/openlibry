/// <reference types="cypress" />
describe("Navigation", () => {
  before(() => {
    cy.resetDatabase();
  });
  beforeEach(() => {
    // Preserve session between tests
    cy.session("user-session", () => {
      cy.login();
    });
    // Visit the home page after session is restored
    cy.visit("http://localhost:3000/");
  });

  it("should navigate to the book screen", () => {
    cy.log(Cypress.env("user"));
    // Start from the index page (already at home from beforeEach)
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .type(Cypress.env("bookid"));
    cy.get("[data-cy=book_title]").should("be.visible");
    cy.get("[data-cy=book_card_editbutton]").should("be.visible");
    cy.get("[data-cy=book_card_editbutton]").click();

    cy.get("[data-cy=book_rentedDate_datepicker]").should("be.visible");
    //cy.get("[data-cy=book_rentedDate_datepicker]").type("12122023");

    //check if Antolin results are retrieved

    // in particular edit a date and check if this is saved properly
  });

  it("should upload a book cover image", () => {
    // Navigate to the book edit page
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .type(Cypress.env("bookid"));
    cy.get("[data-cy=book_card_editbutton]").click();

    // Wait for the edit form to be visible
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Get the current image src to compare later
    cy.get("[data-cy=book-cover-image]")
      .invoke("attr", "src")
      .as("originalImageSrc");

    // Intercept the upload API call
    cy.intercept("POST", "/api/book/cover/*").as("uploadImage");

    // Upload an image
    // Note: You'll need to create a test image in cypress/fixtures/
    cy.get("[data-cy=upload-image-input]").selectFile(
      "cypress/fixtures/test-book-cover.jpg",
      { force: true }
    );

    // Wait for the upload to complete
    cy.wait("@uploadImage").its("response.statusCode").should("eq", 200);

    // Verify the image src has changed (the query parameter should be different)
    cy.get("@originalImageSrc").then((originalSrc) => {
      cy.get("[data-cy=book-cover-image]")
        .invoke("attr", "src")
        .should("not.equal", originalSrc);
    });

    // Verify the image loads successfully
    cy.get("[data-cy=book-cover-image]").should("be.visible");
  });

  it("should save book changes", () => {
    // Navigate to the book edit page
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .type(Cypress.env("bookid"));
    cy.get("[data-cy=book_card_editbutton]").click();

    // Wait for the edit form to be visible
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Intercept the save API call
    cy.intercept("PUT", "/api/book/*").as("saveBook");

    // Click the save button
    cy.get("[data-cy=save-book-button]").should("be.visible").click();

    // Wait for the save to complete (adjust based on your actual API endpoint)
    cy.wait(["@saveBook"], { timeout: 10000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);
  });

  it("should delete a book and verify it cannot be found", () => {
    // Note: This test might need a dedicated test book that can be safely deleted
    // You may want to create a test book first or skip this in production data

    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .type(Cypress.env("bookid"));
    cy.get("[data-cy=book_card_editbutton]").click();

    // Wait for the edit form to be visible
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Intercept the delete API call
    cy.intercept("DELETE", "/api/book/*").as("deleteBook");

    // Wait for the delete button to be stable and store it as an alias
    cy.get("[data-cy=delete-book-button]")
      .should("be.visible")
      .should("not.be.disabled")
      .as("deleteBtn");

    // Trigger mousedown on the stored reference
    cy.get("@deleteBtn").trigger("mousedown");

    // Wait for the hold duration
    cy.wait(3500); // Wait slightly longer than 3 seconds to ensure completion

    // Wait for the delete to complete
    cy.wait("@deleteBook", { timeout: 10000 })
      .its("response.statusCode")
      .should("eq", 200);

    // Verify we're back on the book search screen
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Clear the search field and search for the deleted book
    cy.get("[data-cy=rental_input_searchbook]").find("input").clear();
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .type(Cypress.env("bookid"));

    // Wait a moment for the search to complete
    cy.wait(1000);

    // Verify that the book title is NOT visible (book was deleted)
    cy.get("[data-cy=book_title]").should("not.exist");

    // Optionally, you can also check for a "not found" message if your app displays one
    // cy.contains("Kein Buch gefunden").should("be.visible");
    // or
    // cy.get("[data-cy=no-books-found]").should("be.visible");
  });
});
