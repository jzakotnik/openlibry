/// <reference types="cypress" />

const NEW_USER = "cypress-temp-admin";
const NEW_PASSWORD = "temppass123";
const NEW_EMAIL = "cypress-temp@openlibry.test";

function visitAccountsPage() {
  cy.intercept("GET", "/api/login").as("loginList");
  cy.visit("http://localhost:3000/auth/accounts");
  cy.wait("@loginList");
  cy.get("[data-cy=accounts_list]").should("be.visible");
}

function logout() {
  cy.get("[data-cy=topbar_logout_button]").click();
  cy.url().should("include", "/auth/login");
}

describe("Admin account management", () => {
  before(() => {
    cy.viewport(1280, 800);
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.session("accounts-admin-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=indexpage]").should("be.visible");
  });

  it("creates a new admin account, verifies login, then deletes it and verifies login fails", () => {
    // ── Step 1: create the new account via UI ────────────────────────
    visitAccountsPage();

    cy.get("[data-cy=create_account_toggle]").click();
    cy.get("[data-cy=create_username]").type(NEW_USER);
    cy.get("[data-cy=create_email]").type(NEW_EMAIL);
    cy.get("[data-cy=create_password]").type(NEW_PASSWORD);
    cy.get("[data-cy=create_password_confirm]").type(NEW_PASSWORD);

    cy.intercept("POST", "/api/login/create").as("createAccount");
    cy.intercept("GET", "/api/login").as("loginListAfterCreate");
    cy.get("[data-cy=create_submit]").click();
    cy.wait("@createAccount").its("response.statusCode").should("eq", 201);
    cy.wait("@loginListAfterCreate");

    cy.contains("[data-cy=account_username]", NEW_USER).should("be.visible");

    // ── Step 2: log out and log in as new account — bypass cy.session ─
    logout();

    cy.get('input[id="user"]').type(NEW_USER);
    cy.get('input[id="password"]').type(NEW_PASSWORD);
    cy.get('input[id="password"]').type("{enter}");
    cy.get("[data-cy=indexpage]").should("be.visible");

    // ── Step 3: log out and switch back to the seeded admin ───────────
    logout();

    // Invalidate the cached session so cy.session re-runs login with the
    // original seeded credentials rather than reusing the new-user cookie.
    cy.session("accounts-admin-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=indexpage]").should("be.visible");

    // ── Step 4: delete the new account via UI ────────────────────────
    visitAccountsPage();
    cy.get("[data-cy=account_row]").should("have.length.gt", 1);

    cy.contains("[data-cy=account_username]", NEW_USER)
      .closest("[data-cy=account_row]")
      .find("[data-cy=delete_account]")
      .click();

    cy.intercept("DELETE", "/api/login/*").as("deleteRequest");
    cy.intercept("GET", "/api/login").as("loginListAfterDelete");

    cy.contains("[data-cy=account_username]", NEW_USER)
      .closest("[data-cy=account_row]")
      .find("[data-cy=confirm_delete]")
      .click();

    cy.wait("@deleteRequest").its("response.statusCode").should("eq", 200);
    cy.wait("@loginListAfterDelete");

    cy.contains("[data-cy=account_username]", NEW_USER).should("not.exist");

    // ── Step 5: verify deleted account login fails ────────────────────
    logout();

    cy.get('input[id="user"]').type(NEW_USER);
    cy.get('input[id="password"]').type(NEW_PASSWORD);
    cy.get('input[id="password"]').type("{enter}");

    cy.get("[data-cy=indexpage]").should("not.exist");
    cy.get('input[id="user"]').should("be.visible");
  });
});
