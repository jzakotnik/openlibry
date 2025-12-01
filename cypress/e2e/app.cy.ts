/// <reference types="cypress" />
describe("Application is available", () => {
  before(() => {
    cy.resetDatabase();
  });

  after(() => {
    cy.cleanupDatabase();
  });
  it("should navigate to the login page", () => {
    // Start from the index page
    cy.visit("http://localhost:3000/");
  });
});
