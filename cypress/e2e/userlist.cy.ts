/// <reference types="cypress" />
describe("List of users", () => {
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

  it("should navigate to the user screen", () => {
    cy.get("[data-cy=index_user_button]").click();
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");
  });
});
