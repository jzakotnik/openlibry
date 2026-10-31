/// <reference types="cypress" />

const NEW_USER = "cypress-temp-admin";
const NEW_PASSWORD = "temppass123";
const NEW_EMAIL = "cypress-temp@openlibry.test";

function visitAccountsPage() {
  cy.intercept("GET", "/api/login").as("loginList");
  cy.visit("/auth/accounts");
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
    cy.visit("/");
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
    cy.visit("/");
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

  it("is reachable from the admin page via the accounts card", () => {
    cy.visit("/admin");
    cy.get("[data-cy=admin-accounts-button]").should("be.visible").click();
    cy.url().should("include", "/auth/accounts");
    cy.get("[data-cy=accounts_list]").should("be.visible");
  });

  it("does not offer delete for the logged-in account", () => {
    visitAccountsPage();
    cy.contains("[data-cy=account_username]", "cypress_test_admin")
      .closest("[data-cy=account_row]")
      .within(() => {
        cy.get("[data-cy=delete_account]").should("not.exist");
        cy.get("[data-cy=edit_account]").should("exist");
      });
  });

  it("keeps submit disabled for short or mismatching passwords", () => {
    visitAccountsPage();
    cy.get("[data-cy=create_account_toggle]").click();
    cy.get("[data-cy=create_username]").type("cypress-invalid");
    cy.get("[data-cy=create_email]").type("invalid@openlibry.test");
    cy.get("[data-cy=create_password]").type("ab");
    cy.get("[data-cy=create_password_confirm]").type("ab");
    cy.get("[data-cy=create_submit]").should("be.disabled");
    cy.get("[data-cy=create_password]").clear().type("longenough");
    cy.get("[data-cy=create_password_confirm]").clear().type("different");
    cy.get("[data-cy=create_submit]").should("be.disabled");
    cy.get("[data-cy=create_cancel]").click();
    cy.get("[data-cy=create_account_toggle]").should("be.visible");
  });

  it("edits an account's email and can cancel a delete", () => {
    visitAccountsPage();
    const email = "cypress-edit@openlibry.test";

    // create a throwaway account via API-backed UI
    cy.get("[data-cy=create_account_toggle]").click();
    cy.get("[data-cy=create_username]").type("cypress-edit-user");
    cy.get("[data-cy=create_email]").type("before@openlibry.test");
    cy.get("[data-cy=create_password]").type("temppass123");
    cy.get("[data-cy=create_password_confirm]").type("temppass123");
    cy.intercept("POST", "/api/login/create").as("create");
    cy.get("[data-cy=create_submit]").click();
    cy.wait("@create").its("response.statusCode").should("eq", 201);

    const row = () =>
      cy
        .contains("[data-cy=account_username]", "cypress-edit-user")
        .closest("[data-cy=account_row]");

    row().find("[data-cy=edit_account]").click();
    cy.intercept("PUT", "/api/login/*").as("update");
    row().find("[data-cy=edit_email]").clear().type(email);
    row().find("[data-cy=edit_save]").click();
    cy.wait("@update").its("response.statusCode").should("eq", 200);
    row().should("contain.text", email);

    // cancelling the delete confirmation keeps the account
    row().find("[data-cy=delete_account]").click();
    row().find("[data-cy=cancel_delete]").click();
    row().find("[data-cy=delete_account]").should("exist");
  });
});
