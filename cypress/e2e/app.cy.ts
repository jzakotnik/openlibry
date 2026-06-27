/// <reference types="cypress" />
describe("Application is available", () => {
  before(() => {
    cy.resetAndSeed();
  });

  it("should navigate to the login page", () => {
    cy.visit("http://localhost:3000/");
  });
});
