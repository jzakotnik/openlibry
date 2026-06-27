/// <reference types="cypress" />
describe("Book editing and upload of cover", () => {
  let bookId: number;

  before(() => {
    cy.resetAndSeed().then((ids) => {
      bookId = ids.bookIdByLabel["bookEdit"];
    });
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

  it("should navigate to the book screen", () => {
    cy.navigateToBookEdit(String(bookId));
    cy.get("[data-cy=book_rentedDate_datepicker]").should("be.visible");
  });

  it("should upload a book cover image", () => {
    cy.deleteBookCoverImage(String(bookId));
    cy.navigateToBookEdit(String(bookId));

    cy.intercept("POST", "/api/book/cover/*").as("uploadImage");

    cy.get("[data-cy=upload-image-input]").selectFile(
      "cypress/fixtures/test-book-cover.jpg",
      { force: true },
    );

    cy.wait("@uploadImage").its("response.statusCode").should("eq", 200);
    cy.wait(1000);

    cy.get("[data-cy=book-cover-image]")
      .should("be.visible")
      .and(($img) => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.be.greaterThan(0);
      });

    cy.get("[data-cy=book-cover-image]")
      .invoke("attr", "src")
      .should("match", /\/api\/images\/\d+\?\d+/);
  });

  it("should save book changes", () => {
    cy.navigateToBookEdit(String(bookId));

    cy.intercept("PUT", "/api/book/*").as("saveBook");
    cy.get("[data-cy=save-book-button]").should("be.visible").click();

    cy.wait("@saveBook", { timeout: 10000 }).then((interception) => {
      expect(interception.response).to.exist;
    });

    cy.url({ timeout: 10000 }).should("not.include", "/edit");
    cy.get("body").should("be.visible");

    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").type(String(bookId));
    cy.get(`[data-cy=book_summary_card_${bookId}]`).should("be.visible");
  });

  it("should delete a book and verify it cannot be found", () => {
    cy.task("verifyBook", bookId).then((book) => {
      expect(book).to.not.be.null;
    });

    cy.navigateToBookEdit(String(bookId));

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

    cy.url({ timeout: 10000 }).should("not.include", "/edit");

    cy.task("verifyBook", bookId).should("be.null");

    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").should("be.visible").click();
    cy.get("[data-cy=rental_input_searchbook]")
      .should("be.visible")
      .type(String(bookId));
    cy.wait(1000);
    cy.get(`[data-cy=book_summary_card_${bookId}]`).should("not.exist");
  });
});
