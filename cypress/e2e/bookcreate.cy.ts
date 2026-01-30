/// <reference types="cypress" />
describe("Book creation and validation", () => {
  const testBook = {
    title: "Test Cypress Book",
    author: "Jure",
    subtitle: "Batman uses a bathtub",
    isbn: "9781234567890",
    publisherName: "Cypress Publishing",
    publisherLocation: "Königstein",
    publisherDate: "2025",
    pages: "42",
  };

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
    cy.visit("http://localhost:3000/");
  });

  it("should create a new book, fill in details, save, and verify it exists", () => {
    cy.log(Cypress.env("user"));

    // Navigate to the book screen
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Click create book button - now navigates to /book/new instead of creating empty book
    cy.get("[data-cy=create_book_button]").click();

    // Should be on the new book page
    cy.url().should("include", "/book/new");

    // Wait for the book edit form to be visible
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Fill in book details
    // ISBN field is now at the top and auto-focused for new books
    cy.get("[data-cy=book-isbn-field]")
      .find("input")
      .clear()
      .type(testBook.isbn);

    cy.get("[data-cy=book-title-field]")
      .find("input")
      .clear()
      .type(testBook.title);

    cy.get("[data-cy=book-author-field]")
      .find("input")
      .clear()
      .type(testBook.author);

    cy.get("[data-cy=book-subtitle-field]")
      .find("input")
      .clear()
      .type(testBook.subtitle);

    cy.get("[data-cy=book-publisherName-field]")
      .find("input")
      .clear()
      .type(testBook.publisherName);

    cy.get("[data-cy=book-publisherLocation-field]")
      .find("input")
      .clear()
      .type(testBook.publisherLocation);

    cy.get("[data-cy=book-publisherDate-field]")
      .find("input")
      .clear()
      .type(testBook.publisherDate);

    cy.get("[data-cy=book-pages-field]")
      .find("input")
      .clear()
      .type(testBook.pages);

    // Intercept the POST API call (new books use POST, not PUT)
    cy.intercept("POST", "/api/book").as("createBook");

    // Save the book
    cy.get("[data-cy=save-book-button]").should("be.visible").click();

    // Wait for the create to complete
    cy.wait("@createBook", { timeout: 10000 }).then((interception) => {
      expect(interception.response).to.exist;
      expect(interception.response!.statusCode).to.eq(200);

      // Store the book ID from the response
      const bookId = interception.response!.body.id;
      expect(bookId).to.exist;
      cy.wrap(bookId).as("newBookId");
    });

    // Should redirect to book list after save
    cy.url().should("include", "/book");
    cy.url().should("not.include", "/book/new");

    // Navigate back to the book search screen
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=indexpage]").should("be.visible");
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Search for the newly created book by title
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .clear()
      .type(testBook.title);

    // Wait for search results
    cy.wait(1000);

    // Verify the book appears in search results
    cy.get("[data-cy=book_title]")
      .should("be.visible")
      .and("contain", testBook.title);

    // Optionally verify other details are visible
    cy.contains(testBook.author).should("be.visible");

    // Click on the book to open edit page and verify all details were saved
    cy.get("[data-cy=book_card_editbutton]").click();
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Verify all fields contain the correct values
    cy.get("[data-cy=book-title-field]")
      .find("input")
      .should("have.value", testBook.title);
    cy.get("[data-cy=book-author-field]")
      .find("input")
      .should("have.value", testBook.author);
    cy.get("[data-cy=book-subtitle-field]")
      .find("input")
      .should("have.value", testBook.subtitle);
    cy.get("[data-cy=book-isbn-field]")
      .find("input")
      .should("have.value", testBook.isbn);
    cy.get("[data-cy=book-publisherName-field]")
      .find("input")
      .should("have.value", testBook.publisherName);
    cy.get("[data-cy=book-publisherLocation-field]")
      .find("input")
      .should("have.value", testBook.publisherLocation);
    cy.get("[data-cy=book-publisherDate-field]")
      .find("input")
      .should("have.value", testBook.publisherDate);
    cy.get("[data-cy=book-pages-field]")
      .find("input")
      .should("have.value", testBook.pages);
  });

  it("should cancel book creation and return to book list", () => {
    // Navigate to the book screen
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Click create book button
    cy.get("[data-cy=create_book_button]").click();

    // Should be on the new book page
    cy.url().should("include", "/book/new");
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Fill in some data (but don't save)
    cy.get("[data-cy=book-title-field]")
      .find("input")
      .type("This should not be saved");

    // Click cancel button
    cy.get("[data-cy=cancel-book-button]").should("be.visible").click();

    // Should return to book list
    cy.url().should("include", "/book");
    cy.url().should("not.include", "/book/new");

    // Verify the unsaved book is not in the list
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .type("This should not be saved");

    cy.wait(500);

    // Should not find any results
    cy.get("[data-cy=book_title]").should("not.exist");
  });

  it("should validate required fields before saving", () => {
    // Navigate to the book screen
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Click create book button
    cy.get("[data-cy=create_book_button]").click();

    // Should be on the new book page
    cy.url().should("include", "/book/new");
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Try to save without filling required fields
    cy.get("[data-cy=save-book-button]").click();

    // Should show validation error (via snackbar) and stay on same page
    cy.url().should("include", "/book/new");

    // Fill only title
    cy.get("[data-cy=book-title-field]").find("input").type("Only Title");
    cy.get("[data-cy=save-book-button]").click();

    // Should still show validation error for missing author
    cy.url().should("include", "/book/new");

    // Now fill author as well
    cy.get("[data-cy=book-author-field]").find("input").type("Test Author");

    // Intercept the POST
    cy.intercept("POST", "/api/book").as("createBook");

    // Save should work now
    cy.get("[data-cy=save-book-button]").click();

    cy.wait("@createBook").then((interception) => {
      expect(interception.response!.statusCode).to.eq(200);
    });

    // Should redirect after successful save
    cy.url().should("not.include", "/book/new");
  });
});
