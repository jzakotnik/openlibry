/// <reference types="cypress" />
describe("Navigation", () => {
  before(() => {
    cy.resetDatabase();
  });
  after(() => {
    cy.cleanupDatabase();
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
  });

  it("should upload a book cover image", () => {
    // Delete the existing cover image before testing upload
    cy.deleteBookCoverImage(Cypress.env("bookid"));

    // Navigate to the book edit page
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .type(Cypress.env("bookid"));
    cy.get("[data-cy=book_card_editbutton]").click();

    // Wait for the edit form to be visible
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Intercept the upload API call
    cy.intercept("POST", "/api/book/cover/*").as("uploadImage");

    // Upload an image
    cy.get("[data-cy=upload-image-input]").selectFile(
      "cypress/fixtures/test-book-cover.jpg",
      { force: true }
    );

    // Wait for the upload to complete
    cy.wait("@uploadImage").its("response.statusCode").should("eq", 200);

    // Wait for React to update the component state
    cy.wait(1000);

    // Verify the uploaded image is visible and loaded
    cy.get("[data-cy=book-cover-image]")
      .should("be.visible")
      .and(($img) => {
        // Cast to HTMLImageElement to access naturalWidth
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.be.greaterThan(0);
      });

    // Verify the image src contains the correct book ID and has a query parameter
    cy.get("[data-cy=book-cover-image]")
      .invoke("attr", "src")
      .should("match", /\/api\/images\/\d+\?\d+/);
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

    // Wait for the save to complete
    cy.wait(["@saveBook"], { timeout: 10000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);
  });

  it("should delete a book and verify it cannot be found", () => {
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
    cy.wait(3500);

    // Wait for the delete to complete
    cy.wait("@deleteBook", { timeout: 10000 })
      .its("response.statusCode")
      .should("eq", 200);

    // Wait for any redirects/navigation to complete
    cy.wait(1000);

    // Explicitly navigate to home to ensure we're on the right page
    cy.visit("http://localhost:3000/");

    // Wait for the page to be fully loaded
    cy.get("[data-cy=indexpage]").should("be.visible");

    // Now navigate to the book search
    cy.get("[data-cy=index_book_button]").should("be.visible").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Search for the deleted book
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .type(Cypress.env("bookid"));

    // Wait a moment for the search to complete
    cy.wait(1000);

    // Verify that the book title is NOT visible (book was deleted)
    cy.get("[data-cy=book_title]").should("not.exist");
  });
});
