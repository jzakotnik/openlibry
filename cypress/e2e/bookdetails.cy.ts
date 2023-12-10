/// <reference types="cypress" />
describe("Navigation", () => {
  before(() => {
    cy.login();
  });
  it("should navigate to the book screen", () => {
    cy.log(Cypress.env("user"));
    // Start from the index page
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");
    cy.get("[data-cy=rental_input_searchbook]").type(Cypress.env("bookid"));
    cy.get("[data-cy=book_title]").should("be.visible");
    cy.get("[data-cy=book_card_editbutton]").should("be.visible");
    cy.get("[data-cy=book_card_editbutton]").click();

    cy.get("[data-cy=book_rentedDate_datepicker]").should("be.visible");
    //cy.get("[data-cy=book_rentedDate_datepicker]").type("12122023");

    //check if Antolin results are retrieved

    // in particular edit a date and check if this is saved properly
  });
});
