/// <reference types="cypress" />
describe("Create a new library user", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.session("user-create-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_user_button]").click();
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");
  });

  it("opens the new-user dialog with auto-ID pre-selected", () => {
    cy.get("[data-cy=user_search_new_user_button]").click();
    cy.get("[data-cy=new-user-dialog]").should("be.visible");
    cy.get("[data-cy=new-user-id-auto-checkbox]").should(
      "have.attr",
      "data-state",
      "checked",
    );
    cy.get("[data-cy=new-user-id-input]").should("be.disabled");
  });

  it("creates a user with an auto-assigned ID and navigates to the edit page", () => {
    cy.get("[data-cy=user_search_new_user_button]").click();
    cy.get("[data-cy=new-user-dialog]").should("be.visible");

    cy.intercept("POST", "/api/user").as("createUser");
    cy.get("[data-cy=new-user-create-button]").click();
    cy.wait("@createUser").its("response.statusCode").should("eq", 200);

    cy.url().should("match", /\/user\/\d+$/);
  });

  it("allows picking a manual ID and rejects an invalid one", () => {
    cy.get("[data-cy=user_search_new_user_button]").click();
    cy.get("[data-cy=new-user-dialog]").should("be.visible");

    cy.get("[data-cy=new-user-id-auto-checkbox]").click();
    cy.get("[data-cy=new-user-id-input]").should("be.enabled");

    cy.get("[data-cy=new-user-id-input]").clear().type("0");
    cy.get("[data-cy=new-user-create-button]").should("be.disabled");

    cy.get("[data-cy=new-user-id-input]").clear().type("9999");
    cy.get("[data-cy=new-user-create-button]").should("be.enabled");

    cy.intercept("POST", "/api/user").as("createManualUser");
    cy.get("[data-cy=new-user-create-button]").click();
    cy.wait("@createManualUser").its("response.statusCode").should("eq", 200);

    cy.url().should("include", "/user/9999");
  });

  it("closes the dialog without creating a user on cancel", () => {
    cy.get("[data-cy=user_search_new_user_button]").click();
    cy.get("[data-cy=new-user-dialog]").should("be.visible");

    cy.get("[data-cy=new-user-cancel-button]").click();
    cy.get("[data-cy=new-user-dialog]").should("not.exist");
    cy.url().should("include", "/user");
    cy.url().should("not.match", /\/user\/\d+$/);
  });
});
