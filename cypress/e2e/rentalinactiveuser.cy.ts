/// <reference types="cypress" />

// Issue #488: a deactivated ("inaktiv") user must not be able to rent
// books. seed-users.json includes a pre-seeded inactive user
// ("Archiv Inaktiv", active: false) specifically for this scenario.
//
// This spec checks both layers of the fix:
//   1. UI  — the rent button is disabled once an inactive user is selected.
//   2. API — POST /api/book/:id/user/:userid is rejected with 403 even if
//      called directly, so the UI guard can't be bypassed.

const INACTIVE_USER_SWR_TIMEOUT = 10000;

describe("Inactive users cannot rent books", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.session("user-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/");
  });

  function goToRental() {
    cy.get("[data-cy=index_rental_button]").click();
    cy.url().should("include", "/rental");
  }

  function idFrom(dataCy: string, prefix: string): number {
    return parseInt(dataCy.replace(prefix, ""), 10);
  }

  function expandUser(searchTerm: string) {
    cy.get("[data-cy=user_search_input]")
      .should("be.visible")
      .clear()
      .type(searchTerm);
    cy.get("[data-cy^=user_accordion_]")
      .filter((_, el) =>
        /user_accordion_\d+$/.test(el.getAttribute("data-cy") || ""),
      )
      .first()
      .should("be.visible")
      .click();
    cy.get("[data-cy^=user_accordion_details_]").first().should("be.visible");
  }

  function getUserId(): Cypress.Chainable<number> {
    return cy
      .get("[data-cy^=user_accordion_]")
      .filter((_, el) =>
        /user_accordion_\d+$/.test(el.getAttribute("data-cy") || ""),
      )
      .first()
      .invoke("attr", "data-cy")
      .then((dataCy) => idFrom(dataCy!, "user_accordion_"));
  }

  it("shows the inactive user greyed out with a badge in the rental list", () => {
    goToRental();

    cy.get("[data-cy=user_search_input]")
      .should("be.visible")
      .clear()
      .type("Inaktiv");

    cy.get("[data-cy^=user_accordion_]")
      .filter((_, el) =>
        /user_accordion_\d+$/.test(el.getAttribute("data-cy") || ""),
      )
      .first()
      .should("have.attr", "data-user-active", "false");

    cy.get("[data-cy^=user_inactive_badge_]", { timeout: SWR_TIMEOUT }).should(
      "be.visible",
    );
  });

  it("disables the rent button once an inactive user is selected", () => {
    goToRental();
    expandUser("Inaktiv");

    getUserId().then(() => {
      // Selected-user badge should flag the user as inactive.
      cy.get("[data-cy=user_selected_display]").should(
        "contain.text",
        "Inaktiv",
      );

      // Any rent button rendered for the selected (inactive) user must be
      // disabled, since userExpanded is now the inactive user's id.
      cy.get("[data-cy^=book_rent_button_]", { timeout: SWR_TIMEOUT })
        .first()
        .should("be.disabled")
        .invoke("attr", "data-cy")
        .then((btnDataCy) => {
          const bookId = idFrom(btnDataCy!, "book_rent_button_");

          // The book must stay available since the click can't succeed.
          cy.get(`[data-cy=book_item_${bookId}]`).should(
            "have.attr",
            "data-rental-status",
            "available",
          );

          cy.task("verifyBook", bookId).then((book: any) => {
            expect(book.rentalStatus).to.equal("available");
            expect(book.userId).to.be.null;
          });
        });
    });
  });

  it("rejects a rental via the API even if called directly (403)", () => {
    goToRental();

    cy.resetAndSeed().then((ids: any) => {
      cy.request({
        method: "GET",
        url: "/api/rental",
      }).then((res) => {
        const inactiveUser = res.body.users.find(
          (u: any) => u.lastName === "Inaktiv",
        );
        const availableBook = res.body.books.find(
          (b: any) => b.rentalStatus === "available",
        );

        expect(inactiveUser, "seeded inactive user").to.exist;
        expect(availableBook, "an available book").to.exist;

        cy.request({
          method: "POST",
          url: `/api/book/${availableBook.id}/user/${inactiveUser.id}`,
          failOnStatusCode: false,
        }).then((rentRes) => {
          expect(rentRes.status).to.equal(403);
          expect(rentRes.body.result).to.contain("inactive");

          cy.task("verifyBook", availableBook.id).then((book: any) => {
            expect(book.rentalStatus).to.equal("available");
            expect(book.userId).to.be.null;
          });
        });
      });
    });
  });
});
