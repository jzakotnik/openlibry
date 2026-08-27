/// <reference types="cypress" />

describe("Login", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  it("should navigate to the title screen", () => {
    cy.visit("http://localhost:3000/");
    cy.get('input[id="user"]').type("cypress_test_admin");
    cy.get('input[id="password"]').type("CypressTest1234!");
    cy.get('input[id="password"]').type("{enter}");
    cy.get("[data-cy=indexpage]").should("be.visible");
  });
});
