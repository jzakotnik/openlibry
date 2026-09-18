/// <reference types="cypress" />
describe("User list search filters", () => {
  before(() => {
    cy.resetAndSeed();
    cy.seedRentalData();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.session("user-filter-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_user_button]").click();
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");
  });

  it("opens and closes the filter panel", () => {
    cy.get("[data-cy=user-filter-overdue-toggle]").should("not.exist");
    cy.get("[data-cy=user_search_settings_toggle]").click();
    cy.get("[data-cy=user-filter-overdue-toggle]").should("be.visible");
    cy.get("[data-cy=user_search_settings_toggle]").click();
    cy.get("[data-cy=user-filter-overdue-toggle]").should("not.exist");
  });

  it("filters the list to only users with overdue rentals", () => {
    cy.get("[data-cy=user_search_settings_toggle]").click();
    cy.get("[data-cy=user-filter-overdue-toggle]").click();

    cy.contains("Rentaltest").should("be.visible");
    cy.contains("Pfau").should("not.exist");
    cy.contains("Berens").should("not.exist");

    cy.get("[data-cy=user-filter-reset-button]").click();
    cy.contains("Pfau").should("be.visible");
  });

  it("filters the list by school grade", () => {
    cy.get("[data-cy=user_search_settings_toggle]").click();
    cy.get("[data-cy=user-filter-grade-select]").click();
    cy.get("[data-cy=user-filter-grade-option-2]").click();

    cy.contains("Pesch").should("be.visible");
    cy.contains("Hübner").should("be.visible");
    cy.contains("Pfau").should("not.exist");
    cy.contains("Limmer").should("not.exist");
  });

  it("combines the overdue and grade filters", () => {
    cy.get("[data-cy=user_search_settings_toggle]").click();
    cy.get("[data-cy=user-filter-overdue-toggle]").click();
    cy.get("[data-cy=user-filter-grade-select]").click();
    cy.get("[data-cy=user-filter-grade-option-4b]").click();

    cy.contains("Rentaltest").should("be.visible");
    cy.contains("Limmer").should("not.exist");
    cy.contains("Pesch").should("not.exist");
  });

  it("shows the reset button only while a filter is active and clears both filters", () => {
    cy.get("[data-cy=user_search_settings_toggle]").click();
    cy.get("[data-cy=user-filter-reset-button]").should("not.exist");

    cy.get("[data-cy=user-filter-overdue-toggle]").click();
    cy.get("[data-cy=user-filter-reset-button]").should("be.visible");

    cy.get("[data-cy=user-filter-reset-button]").click();
    cy.get("[data-cy=user-filter-reset-button]").should("not.exist");
    cy.get("[data-cy=user-filter-overdue-toggle]").should(
      "have.attr",
      "data-state",
      "off",
    );
  });
});
