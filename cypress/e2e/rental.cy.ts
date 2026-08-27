/// <reference types="cypress" />

// SWR polls /api/rental every second. After a rent/return the API call
// succeeds immediately but the UI only updates once mutate() + SWR re-fetch
// completes. All post-action DOM assertions use SWR_TIMEOUT.
//
// API:
//   Rent:   POST   /api/book/${bookId}/user/${userId}
//   Return: DELETE /api/book/${bookId}/user/${userId}
//
// The rent button (book_rent_button_${id}) only renders when:
//   - a user accordion is expanded (userExpanded !== false)
//   - the book's rentalStatus !== "available" is false (isRented = false)
// data-rental-status on book_item_ is updated by SWR after mutate().

const SWR_TIMEOUT = 10000;

describe("Rental of books", () => {
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

  // ── Helpers ────────────────────────────────────────────────────────────────

  function goToRental() {
    cy.get("[data-cy=index_rental_button]").click();
    cy.url().should("include", "/rental");
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

  function reExpandIfCollapsed() {
    cy.get("[data-cy^=user_accordion_]")
      .filter((_, el) =>
        /user_accordion_\d+$/.test(el.getAttribute("data-cy") || ""),
      )
      .first()
      .then(($el) => {
        if (!$el.find("[data-cy^=user_accordion_details_]").is(":visible")) {
          cy.wrap($el).click();
          cy.get("[data-cy^=user_accordion_details_]")
            .first()
            .should("be.visible");
        }
      });
  }

  function idFrom(dataCy: string, prefix: string): number {
    return parseInt(dataCy.replace(prefix, ""), 10);
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

  // Type a book ID into the search — numeric search bypasses debounce on Enter,
  // but we still wait for the specific item to appear before asserting.
  function searchAndWaitForBook(bookId: number) {
    cy.get("[data-cy=book_search_input]")
      .should("be.visible")
      .clear()
      .type(String(bookId));
    cy.get(`[data-cy=book_item_${bookId}]`, { timeout: SWR_TIMEOUT }).should(
      "be.visible",
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 1. Rent a book — verify data-rental-status updates and book appears in
  //    the user accordion
  // ════════════════════════════════════════════════════════════════════════════

  it("should rent a book and verify it appears in the user's rented list", () => {
    goToRental();
    expandUser("Magnus");

    getUserId().then((userId) => {
      // Find the first available rent button — it's already rendered because
      // Magnus is expanded and all available books show rent buttons.
      // We don't need to search first; the full list is already visible.
      cy.get("[data-cy^=book_rent_button_]", { timeout: SWR_TIMEOUT })
        .first()
        .invoke("attr", "data-cy")
        .then((btnDataCy) => {
          const bookId = idFrom(btnDataCy!, "book_rent_button_");

          // Confirm this book is genuinely available before renting
          cy.get(`[data-cy=book_item_${bookId}]`).should(
            "have.attr",
            "data-rental-status",
            "available",
          );

          // Register intercept BEFORE the click
          cy.intercept("POST", `/api/book/${bookId}/user/${userId}`).as(
            "rentBook",
          );

          cy.get(`[data-cy=book_rent_button_${bookId}]`).click();

          cy.wait("@rentBook").its("response.statusCode").should("eq", 200);

          // data-rental-status flips to "rented" after mutate() + SWR re-fetch
          cy.get(`[data-cy=book_item_${bookId}]`, {
            timeout: SWR_TIMEOUT,
          }).should("have.attr", "data-rental-status", "rented");

          // Re-expand accordion if SWR re-render collapsed it
          reExpandIfCollapsed();

          // Book appears in the user's accordion panel
          cy.get(`[data-cy=rental_book_title_${bookId}]`, {
            timeout: SWR_TIMEOUT,
          }).should("be.visible");

          // DB is authoritative
          cy.task("verifyBook", bookId).then((book: any) => {
            expect(book.rentalStatus).to.equal("rented");
            expect(book.userId).to.equal(userId);
          });
        });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. Return a book — verify data-rental-status flips to "available" and
  //    the book disappears from the user accordion
  // ════════════════════════════════════════════════════════════════════════════

  it("should return a rented book and verify it is available again", () => {
    goToRental();
    expandUser("Rentaltest");

    cy.get("[data-cy^=user_accordion_details_]")
      .first()
      .within(() => {
        cy.contains("Cypress Verlaengerbar UserCol", {
          timeout: SWR_TIMEOUT,
        }).should("be.visible");
      });

    // Read book ID and user ID from the DOM
    cy.get("[data-cy^=user_accordion_details_]")
      .first()
      .find("[data-cy^=book_return_button_]")
      .first()
      .invoke("attr", "data-cy")
      .then((btnDataCy) => {
        const bookId = idFrom(btnDataCy!, "book_return_button_");

        getUserId().then((userId) => {
          // Register intercept BEFORE the click
          cy.intercept("DELETE", `/api/book/${bookId}/user/${userId}`).as(
            "returnBook",
          );

          cy.get("[data-cy^=user_accordion_details_]")
            .first()
            .within(() => {
              cy.get(`[data-cy=book_return_button_${bookId}]`)
                .should("be.visible")
                .click();
            });

          cy.wait("@returnBook").its("response.statusCode").should("eq", 200);

          reExpandIfCollapsed();

          // Book must disappear from the user panel
          cy.get(`[data-cy=rental_book_title_${bookId}]`, {
            timeout: SWR_TIMEOUT,
          }).should("not.exist");

          // Search by ID — guaranteed single result, no debounce issue
          searchAndWaitForBook(bookId);

          // data-rental-status must flip back to "available"
          cy.get(`[data-cy=book_item_${bookId}]`, {
            timeout: SWR_TIMEOUT,
          }).should("have.attr", "data-rental-status", "available");

          // Rent button reappears (user is still expanded)
          cy.get(`[data-cy=book_rent_button_${bookId}]`, {
            timeout: SWR_TIMEOUT,
          }).should("be.visible");

          // DB is authoritative
          cy.task("verifyBook", bookId).then((book: any) => {
            expect(book.rentalStatus).to.equal("available");
            expect(book.userId).to.be.null;
          });
        });
      });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. Due date = today + RENTAL_DURATION_DAYS
  // ════════════════════════════════════════════════════════════════════════════

  it("should set due date to today + RENTAL_DURATION_DAYS", () => {
    const RENTAL_DURATION_DAYS: number =
      Cypress.env("RENTAL_DURATION_DAYS") ?? 21;

    goToRental();
    expandUser("Magnus");

    getUserId().then((userId) => {
      // Pick the first available rent button — same pattern as test 1
      cy.get("[data-cy^=book_rent_button_]", { timeout: SWR_TIMEOUT })
        .first()
        .invoke("attr", "data-cy")
        .then((btnDataCy) => {
          const bookId = idFrom(btnDataCy!, "book_rent_button_");

          cy.intercept("POST", `/api/book/${bookId}/user/${userId}`).as(
            "rentBook",
          );

          cy.get(`[data-cy=book_rent_button_${bookId}]`).click();

          cy.wait("@rentBook").its("response.statusCode").should("eq", 200);

          cy.get(`[data-cy=book_item_${bookId}]`, {
            timeout: SWR_TIMEOUT,
          }).should("have.attr", "data-rental-status", "rented");

          const expectedDue = new Date();
          expectedDue.setDate(expectedDue.getDate() + RENTAL_DURATION_DAYS);
          const expectedISO = expectedDue.toISOString().slice(0, 10);

          cy.task("verifyBook", bookId).then((book: any) => {
            expect(book.rentalStatus).to.equal("rented");
            expect(new Date(book.dueDate).toISOString().slice(0, 10)).to.equal(
              expectedISO,
            );
            expect(book.renewalCount).to.equal(0);
          });
        });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. Already-rented books: data-rental-status="rented", no rent button
  // ════════════════════════════════════════════════════════════════════════════

  it("should not show a rent button for an already-rented book", () => {
    goToRental();
    expandUser("Rentaltest");

    // Search by title to filter to the specific pre-seeded rented book
    cy.get("[data-cy=book_search_input]")
      .should("be.visible")
      .type("Verlaengerbar UserCol");

    // Wait for the item to appear with the expected status
    cy.get("[data-cy^=book_item_][data-rental-status=rented]", {
      timeout: SWR_TIMEOUT,
    })
      .first()
      .should("be.visible")
      .invoke("attr", "data-cy")
      .then((bookDataCy) => {
        const bookId = idFrom(bookDataCy!, "book_item_");

        // Rented status info span visible
        cy.get(`[data-cy=book_rented_status_${bookId}]`).should("be.visible");

        // No rent button for a rented book
        cy.get(`[data-cy=book_rent_button_${bookId}]`).should("not.exist");
      });
  });
});
