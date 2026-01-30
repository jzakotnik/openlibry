/// <reference types="cypress" />
describe("Book creation with ISBN autofill and editing", () => {
  // Store the created book ID for subsequent tests
  let createdBookId: number;

  before(() => {
    cy.task("resetDatabase");
    cy.task("logDatabaseState");
  });

  after(() => {
    cy.task("cleanupDatabase");
  });

  beforeEach(() => {
    // Preserve session between tests
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.session("user-session", () => {
      cy.login();
    });
    // Visit the home page after session is restored
    cy.visit("http://localhost:3000/");
  });

  afterEach(() => {
    // Optional: Log database state after each test for debugging
    cy.task("logDatabaseState");
  });

  it("should create a new book and autofill data from ISBN", () => {
    const testIsbn = "978-3596907281";

    // Navigate to books page
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Click the create new book button - now navigates to /book/new
    cy.get("[data-cy=create_book_button]").click();

    // Should be on the new book page
    cy.url().should("include", "/book/new");

    // Wait for the edit form to be visible
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Intercept the ISBN autofill API call
    cy.intercept("GET", "/api/book/FillBookByIsbn?isbn=*").as("fillByIsbn");

    // Enter ISBN in the unified ISBN field (now at the top of the form)
    // The ISBN field uses data-cy="book-isbn-field"
    cy.get("[data-cy=book-isbn-field]").find("input").clear().type(testIsbn);

    // Click the autofill button (data-cy="autofill-button")
    cy.get("[data-cy=autofill-button]").should("not.be.disabled").click();

    // Wait for the autofill API to complete
    cy.wait("@fillByIsbn", { timeout: 15000 }).then((interception) => {
      expect(interception.response).to.exist;
      expect(interception.response?.statusCode).to.equal(200);

      // Log the response for debugging
      cy.log(
        "ISBN autofill response:",
        JSON.stringify(interception.response?.body),
      );
    });

    // Wait for React to update the form with autofilled data
    cy.wait(1500);

    // Verify that the title field has been populated
    cy.get("[data-cy=book-title-field]")
      .find("input")
      .should("not.have.value", "");

    // Verify that the author field has been populated
    cy.get("[data-cy=book-author-field]")
      .find("input")
      .should("not.have.value", "");

    // Store the autofilled title for later verification
    cy.get("[data-cy=book-title-field]")
      .find("input")
      .invoke("val")
      .then((title) => {
        cy.log("Autofilled title:", title as string);
        expect(title).to.not.be.empty;
      });

    // Intercept the POST API call (new books use POST to /api/book)
    cy.intercept("POST", "/api/book").as("createBook");

    // Click the save button
    cy.get("[data-cy=save-book-button]").should("be.visible").click();

    // Wait for the create to complete
    cy.wait("@createBook", { timeout: 10000 }).then((interception) => {
      expect(interception.response).to.exist;
      expect(interception.response?.statusCode).to.eq(200);

      // Extract the book ID from the response
      createdBookId = interception.response?.body.id;
      cy.log("Created book ID:", createdBookId);
      expect(createdBookId).to.exist;

      // Store the book ID in Cypress environment for other tests
      Cypress.env("createdBookId", createdBookId);
    });

    // Should redirect to book list after save
    cy.url({ timeout: 10000 }).should("include", "/book");
    cy.url().should("not.include", "/book/new");
  });

  it("should edit the created book and change the title", () => {
    // Get the book ID from the previous test
    const bookId = Cypress.env("createdBookId");
    expect(bookId).to.exist;
    cy.log("Editing book with ID:", bookId);

    const newTitle = "Geänderter Buchtitel - Cypress Test";

    // Navigate to books page
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Search for the created book by ID
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .clear()
      .type(bookId.toString());

    // Wait for search results
    cy.wait(1000);

    // Verify the book is found and click edit
    cy.get("[data-cy=book_title]").should("be.visible");
    cy.get("[data-cy=book_card_editbutton]").should("be.visible").click();

    // Wait for the edit form to be visible (now at /book/[id])
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Store the original title for verification
    cy.get("[data-cy=book-title-field]")
      .find("input")
      .invoke("val")
      .then((originalTitle) => {
        cy.log("Original title:", originalTitle as string);
        expect(originalTitle).to.not.be.empty;
      });

    // Clear and enter the new title
    cy.get("[data-cy=book-title-field]").find("input").clear().type(newTitle);

    // Verify the title field has the new value
    cy.get("[data-cy=book-title-field]")
      .find("input")
      .should("have.value", newTitle);

    // Intercept the save API call (editing existing books uses PUT)
    cy.intercept("PUT", "/api/book/*").as("saveBookEdit");

    // Click the save button
    cy.get("[data-cy=save-book-button]").should("be.visible").click();

    // Wait for the save to complete
    cy.wait("@saveBookEdit", { timeout: 10000 }).then((interception) => {
      expect(interception.response).to.exist;
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });

    // Should redirect to book list after save
    cy.url({ timeout: 10000 }).should("include", "/book");

    // Navigate back to verify the change persisted
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .clear()
      .type(bookId.toString());

    // Wait for search results
    cy.wait(1000);

    // Verify the book title has been updated
    cy.get("[data-cy=book_title]").should("contain", newTitle);
  });

  it("should verify the book data was saved correctly in the database", () => {
    const bookId = Cypress.env("createdBookId");
    expect(bookId).to.exist;

    // Verify book exists in database with the updated title
    cy.task("verifyBook", bookId).then((book: any) => {
      expect(book).to.not.be.null;
      cy.log("Book from database:", JSON.stringify(book));

      // Verify the title was changed
      expect(book.title).to.equal("Geänderter Buchtitel - Cypress Test");

      // Verify ISBN-related fields were populated from autofill
      // These fields should have been filled from DNB data
      expect(book.author).to.not.be.empty;
    });
  });

  it("should clean up by deleting the test book", () => {
    const bookId = Cypress.env("createdBookId");
    expect(bookId).to.exist;

    // Navigate to the book edit page
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]")
      .find("input")
      .clear()
      .type(bookId.toString());

    // Wait for search results
    cy.wait(1000);

    cy.get("[data-cy=book_card_editbutton]").click();
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Intercept the delete API call
    cy.intercept("DELETE", "/api/book/*").as("deleteBook");

    // Hold the delete button (it requires holding for safety)
    cy.get("[data-cy=delete-book-button]")
      .should("be.visible")
      .should("not.be.disabled")
      .as("deleteBtn");

    cy.get("@deleteBtn").trigger("mousedown");

    // Wait for the hold duration (3.5 seconds based on the example test)
    cy.wait(3500);

    // Wait for delete to complete
    cy.wait("@deleteBook", { timeout: 10000 }).then((interception) => {
      expect(interception.response).to.exist;
    });

    // Verify book was deleted
    cy.task("verifyBook", bookId).should("be.null");
  });

  it("should show cover preview when autofilling with ISBN that has cover", () => {
    // Use an ISBN that likely has a cover on OpenLibrary
    const testIsbn = "9783551551672"; // Harry Potter German edition

    // Navigate to books page
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Click the create new book button
    cy.get("[data-cy=create_book_button]").click();

    // Should be on the new book page
    cy.url().should("include", "/book/new");
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    // Intercept the ISBN autofill API call
    cy.intercept("GET", "/api/book/FillBookByIsbn?isbn=*").as("fillByIsbn");

    // Enter ISBN
    cy.get("[data-cy=book-isbn-field]").find("input").clear().type(testIsbn);

    // Click autofill button
    cy.get("[data-cy=autofill-button]").click();

    // Wait for autofill to complete
    cy.wait("@fillByIsbn", { timeout: 15000 });

    // Wait for cover fetch (happens in parallel)
    cy.wait(2000);

    // Check if cover preview is shown (depends on OpenLibrary availability)
    cy.get("body").then(($body) => {
      if ($body.find("[data-cy=book-cover-preview]").length > 0) {
        cy.log("Cover preview found - cover was fetched successfully");
        cy.get("[data-cy=book-cover-preview]").should("be.visible");
        // Verify the success message
        cy.contains("Cover wird beim Speichern hochgeladen").should(
          "be.visible",
        );
      } else {
        cy.log("No cover preview - cover not available or fetch failed");
        // Should show "Kein Cover gefunden" message
        cy.contains("Kein Cover gefunden").should("be.visible");
      }
    });

    // Cancel without saving (cleanup)
    cy.get("[data-cy=cancel-book-button]").click();
    cy.url().should("not.include", "/book/new");
  });
});
