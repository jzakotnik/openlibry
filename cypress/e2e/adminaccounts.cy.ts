/// <reference types="cypress" />

const NEW_USER = "cypress-temp-admin";
const NEW_PASSWORD = "temppass123";
const NEW_EMAIL = "cypress-temp@openlibry.test";

function loginAs(username: string, password: string) {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit("http://localhost:3000/auth/login");
  cy.get('input[id="user"]').type(username);
  cy.get('input[id="password"]').type(password);
  cy.get('input[id="password"]').type("{enter}");
}

/** Visit the accounts page and wait for the SWR fetch to settle */
function visitAccountsPage() {
  cy.intercept("GET", "/api/login").as("loginList");
  cy.visit("http://localhost:3000/auth/accounts");
  cy.wait("@loginList");
  cy.get("[data-cy=accounts_list]").should("be.visible");
}

describe("Admin account management", () => {
  before(() => {
    cy.resetDatabase();
  });

  after(() => {
    cy.cleanupDatabase();
  });

  it("creates a new admin account, verifies login, then deletes it and verifies login fails", () => {
    // ── Step 1: log in as the existing test user ──────────────────────
    cy.session("initial-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=indexpage]").should("be.visible");

    // ── Step 2: create a new admin account ───────────────────────────
    visitAccountsPage();

    cy.get("[data-cy=create_account_toggle]").click();
    cy.get("[data-cy=create_username]").type(NEW_USER);
    cy.get("[data-cy=create_email]").type(NEW_EMAIL);
    cy.get("[data-cy=create_password]").type(NEW_PASSWORD);
    cy.get("[data-cy=create_password_confirm]").type(NEW_PASSWORD);

    cy.intercept("POST", "/api/login/create").as("createAccount");
    cy.intercept("GET", "/api/login").as("loginListAfterCreate");
    cy.get("[data-cy=create_submit]").click();
    cy.wait("@createAccount");
    cy.wait("@loginListAfterCreate");

    cy.contains("[data-cy=account_username]", NEW_USER).should("be.visible");

    // ── Step 3: log in with the new account — should succeed ──────────
    cy.session("new-user-session", () => {
      loginAs(NEW_USER, NEW_PASSWORD);
    });
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=indexpage]").should("be.visible");

    // ── Step 4: switch back to the original user and delete the new account
    // The new account cannot delete itself (isSelf guard hides the delete
    // button). Log back in as the original test user who can see the delete
    // button on the new account's row.
    cy.session("initial-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=indexpage]").should("be.visible");

    visitAccountsPage();
    cy.get("[data-cy=account_row]").should("have.length.gt", 1);

    cy.contains("[data-cy=account_username]", NEW_USER)
      .closest("[data-cy=account_row]")
      .find("[data-cy=delete_account]")
      .as("deleteBtn");
    cy.get("@deleteBtn").click();

    cy.intercept("DELETE", "/api/login/*").as("deleteRequest");
    cy.intercept("GET", "/api/login").as("loginListAfterDelete");

    cy.contains("[data-cy=account_username]", NEW_USER)
      .closest("[data-cy=account_row]")
      .find("[data-cy=confirm_delete]")
      .as("confirmBtn");
    cy.get("@confirmBtn").click();

    cy.wait("@deleteRequest");
    cy.wait("@loginListAfterDelete");

    cy.contains("[data-cy=account_username]", NEW_USER).should("not.exist");

    // ── Step 5: try to log in with the deleted account — must fail ────
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit("http://localhost:3000/auth/login");
    cy.get('input[id="user"]').type(NEW_USER);
    cy.get('input[id="password"]').type(NEW_PASSWORD);
    cy.get('input[id="password"]').type("{enter}");

    cy.get("[data-cy=indexpage]").should("not.exist");
    cy.get('input[id="user"]').should("be.visible");
  });
});
