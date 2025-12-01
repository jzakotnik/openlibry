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

    // Click create book button
    cy.get("[data-cy=create_book_button]").click();
    cy.wait(1000);

    // Wait for the book edit form to be visible
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Fill in book details
    // Note: You'll need to add data-cy attributes to these fields in your BookTextField components
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
    cy.get("[data-cy=book-isbn-field]")
      .find("input")
      .clear()
      .type(testBook.isbn);
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

    // Intercept the save API call
    cy.intercept("PUT", "/api/book/*").as("saveBook");

    // Save the book
    cy.get("[data-cy=save-book-button]").should("be.visible").click();

    // Wait for the save to complete
    cy.wait("@saveBook", { timeout: 10000 }).then((interception) => {
      expect(interception.response).to.exist;
      //expect(interception.response!.statusCode).to.be.oneOf([200, 201]);

      // Store the book ID from the response
      const bookId = interception.response!.body.id;
      cy.wrap(bookId).as("newBookId");
    });

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
});
