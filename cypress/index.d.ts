/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(): Chainable<any>;
  }
  interface Chainable {
    navigateToBookEdit(bookId: string): Chainable<void>;
  }
}
