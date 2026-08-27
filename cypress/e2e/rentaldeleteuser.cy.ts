/// <reference types="cypress" />
describe("Rental cleanup on user deletion", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/");
  });

  it("should rent a book, delete the user, and verify the book is also deleted", () => {
    cy.get("[data-cy=index_rental_button]").click();
    cy.url().should("include", "/rental");

    cy.get("[data-cy=user_search_input]").should("be.visible").type("Magnus");
    cy.get("[data-cy^=user_accordion_]").first().click();
    cy.get("[data-cy^=user_accordion_details_]").first().should("be.visible");

    cy.get("[data-cy^=user_accordion_]")
      .filter((_, el) => /user_accordion_\d+$/.test(el.getAttribute("data-cy") || ""))
      .first()
      .invoke("attr", "data-cy")
      .then((dataCy) => {
        const userId = dataCy!.replace("user_accordion_", "");
        cy.wrap(userId).as("rentedUserId");
      });

    cy.get("[data-cy=book_search_input]").should("be.visible").type("Dorf");
    cy.wait(1500);
    cy.get("[data-cy^=book_item_]").first().should("be.visible");

    cy.get("[data-cy^=book_item_]")
      .first()
      .invoke("attr", "data-cy")
      .then((dataCy) => {
        const bookId = dataCy!.replace("book_item_", "");
        cy.wrap(bookId).as("rentedBookId");
      });

    cy.get("[data-cy^=book_item_]")
      .first()
      .within(() => {
        cy.get("[data-cy^=book_rent_button_]").click();
      });

    cy.get("@rentedBookId").then((bookId) => {
      cy.get(`[data-cy=rental_book_title_${bookId}]`, { timeout: 8000 }).should("be.visible");
    });

    cy.get("@rentedUserId").then((userId) => {
      cy.visit(`http://localhost:3000/user/${userId}`);
    });

    cy.url().should("include", "/user/");

    cy.get("[data-cy=delete-user-button]")
      .should("be.visible")
      .trigger("mousedown", { force: true });

    cy.url({ timeout: 10000 }).should("match", /\/user$/);

    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();
    cy.url().should("include", "/book");
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    cy.get("@rentedBookId").then((bookId) => {
      cy.get("[data-cy=rental_input_searchbook]").type(bookId as unknown as string);
      cy.wait(2000);
      cy.get(`[data-cy=book_summary_card_${bookId}]`).should("not.exist");
      cy.get(`[data-cy=book_summary_row_${bookId}]`).should("not.exist");
    });

    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_user_button]").click();
    cy.url().should("include", "/user");
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");

    cy.get("[data-cy=rental_input_searchuser]").type("Magnus");
    cy.wait(1000);
    cy.get("[data-cy^=user_list_item_]").should("not.exist");
  });
});
