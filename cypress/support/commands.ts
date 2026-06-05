/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(): Chainable<any>;
    resetDatabase(): Chainable<any>;
    deleteBookCoverImage(bookId: string): Chainable<any>;
    deleteFile(filePath: string): Chainable<any>;
    cleanupDatabase(): Chainable<any>;
    navigateToBookEdit(bookId: string): Chainable<any>;
  }
}

Cypress.Commands.add("login", () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.log(Cypress.env("user"));
  cy.visit("http://localhost:3000/");
  cy.get('input[id="user"]').type(Cypress.env("user"));
  cy.get('input[id="password"]').type(Cypress.env("password"));
  cy.get('input[id="password"]').type("{enter}");
  cy.get("[data-cy=indexpage]").should("be.visible");
});

// Wrapper commands that call the config tasks
Cypress.Commands.add("resetDatabase", () => {
  cy.task("resetDatabase");

  // Retry the reconnect until the server confirms success
  const reconnect = (attemptsLeft = 10): Cypress.Chainable => {
    return cy
      .request({
        method: "POST",
        url: "http://localhost:3000/api/db/reconnect",
        failOnStatusCode: false,
      })
      .then((res) => {
        if (res.status === 200) {
          cy.log("✓ Server reconnected");
        } else if (attemptsLeft > 0) {
          cy.wait(300);
          return reconnect(attemptsLeft - 1);
        } else {
          throw new Error("Server failed to reconnect after DB reset");
        }
      });
  };

  reconnect();
});

Cypress.Commands.add("cleanupDatabase", () => {
  cy.task("cleanupDatabase");
});

Cypress.Commands.add("deleteBookCoverImage", (bookId: string) => {
  cy.task("deleteBookCoverImage", bookId);
});

Cypress.Commands.add("deleteFile", (filePath: string) => {
  cy.task("deleteFile", filePath);
});

Cypress.Commands.add("navigateToBookEdit", (bookId: string) => {
  cy.get("[data-cy=index_book_button]").click();
  cy.get("[data-cy=rental_input_searchbook]").should("be.visible").type(bookId);

  // Scope to the exact card matching this book ID
  cy.get(`[data-cy=book_summary_card_${bookId}]`)
    .should("be.visible")
    .within(() => {
      cy.get("[data-cy=book_card_editbutton]").click();
    });

  cy.get("[data-cy=book-edit-form]").should("be.visible");
});
