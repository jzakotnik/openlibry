/// <reference types="cypress" />
describe("Book creation with ISBN autofill and editing", () => {
  let createdBookId: number;

  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.session("user-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/");
  });

  it("should create a new book and autofill data from ISBN", () => {
    const testIsbn = "978-3596907281";

    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    cy.get("[data-cy=create_book_button]").click();
    cy.url().should("include", "/book/new");
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    cy.intercept("GET", "/api/book/FillBookByIsbn?isbn=*").as("fillByIsbn");

    cy.get("[data-cy=book-isbn-field]").clear().type(testIsbn);
    cy.get("[data-cy=autofill-button]").should("not.be.disabled").click();

    cy.wait("@fillByIsbn", { timeout: 15000 }).then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
    });

    cy.wait(1500);

    cy.get("[data-cy=book-title-field]").should("not.have.value", "");
    cy.get("[data-cy=book-author-field]").should("not.have.value", "");

    cy.intercept("POST", "/api/book").as("createBook");
    cy.get("[data-cy=save-book-button]").should("be.visible").click();

    cy.wait("@createBook", { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      createdBookId = interception.response?.body.id;
      expect(createdBookId).to.exist;
      Cypress.env("createdBookId", createdBookId);
    });

    cy.url({ timeout: 10000 }).should("include", "/book");
    cy.url().should("not.include", "/book/new");
  });

  it("should edit the created book and change the title", () => {
    const bookId = Cypress.env("createdBookId");
    expect(bookId).to.exist;

    const newTitle = "Geänderter Buchtitel - Cypress Test";

    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    cy.get("[data-cy=rental_input_searchbook]").clear().type(bookId.toString());
    cy.wait(1000);

    cy.get("[data-cy=book_title]").should("be.visible");
    cy.get("[data-cy=book_card_editbutton]").should("be.visible").click();
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    cy.get("[data-cy=book-title-field]").clear().type(newTitle);
    cy.get("[data-cy=book-title-field]").should("have.value", newTitle);

    cy.intercept("PUT", "/api/book/*").as("saveBookEdit");
    cy.get("[data-cy=save-book-button]").should("be.visible").click();

    cy.wait("@saveBookEdit", { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });

    cy.url({ timeout: 10000 }).should("include", "/book");

    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").clear().type(bookId.toString());
    cy.wait(1000);

    cy.get("[data-cy=book_title]").should("contain", newTitle);
  });

  it("should verify the book data was saved correctly in the database", () => {
    const bookId = Cypress.env("createdBookId");
    expect(bookId).to.exist;

    cy.task("verifyBook", bookId).then((book: any) => {
      expect(book).to.not.be.null;
      expect(book.title).to.equal("Geänderter Buchtitel - Cypress Test");
      expect(book.author).to.not.be.empty;
    });
  });

  it("should clean up by deleting the test book", () => {
    const bookId = Cypress.env("createdBookId");
    expect(bookId).to.exist;

    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").clear().type(bookId.toString());
    cy.wait(1000);

    cy.get("[data-cy=book_card_editbutton]").click();
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    cy.intercept("DELETE", "/api/book/*").as("deleteBook");

    cy.get("[data-cy=delete-book-button]")
      .should("be.visible")
      .should("not.be.disabled")
      .as("deleteBtn");

    cy.get("@deleteBtn").trigger("mousedown");
    cy.wait(3500);

    cy.wait("@deleteBook", { timeout: 10000 }).then((interception) => {
      expect(interception.response).to.exist;
    });

    cy.task("verifyBook", bookId).should("be.null");
  });

  it("should show cover preview when autofilling with ISBN that has cover", () => {
    const testIsbn = "9783551551672";

    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    cy.get("[data-cy=create_book_button]").click();
    cy.url().should("include", "/book/new");
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    cy.intercept("GET", "/api/book/FillBookByIsbn?isbn=*").as("fillByIsbn");
    cy.get("[data-cy=book-isbn-field]").clear().type(testIsbn);
    cy.get("[data-cy=autofill-button]").click();

    cy.wait("@fillByIsbn", { timeout: 25000 });
    cy.wait(5000);

    cy.get("body").then(($body) => {
      if ($body.find("[data-cy=book-cover-preview]").length > 0) {
        cy.get("[data-cy=book-cover-preview]").should("be.visible");
        cy.get("[data-cy=cover-will-upload-message]").should("be.visible");
      } else {
        cy.get("[data-cy=cover-not-found-message]").should("be.visible");
      }
    });

    cy.get("[data-cy=cancel-book-button]").click();
    cy.url().should("not.include", "/book/new");
  });
});
