/// <reference types="cypress" />
describe("Navigation", () => {
  it("should navigate to the login page", () => {
    // Start from the index page
    cy.visit("http://localhost:3000/");
  });
});
