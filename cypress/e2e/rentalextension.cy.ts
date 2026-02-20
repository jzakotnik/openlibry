/// <reference types="cypress" />

// ─────────────────────────────────────────────────────────────────────────────
// Rental extension tests
//
// Extend path: POST /api/book/{id}/extend  (server computes date from env)
// Rent   path: POST /api/book/{id}/user/{userid}
//
// After every mutation we cy.reload() to get a clean SSR response from the
// real DB state — no SWR / React.memo timing to fight.
//
// DB assertions via cy.task("verifyBook") are the authoritative truth.
//
// cypress.env.json must match the server's .env EXACTLY:
//   {
//     "RENTAL_DURATION_DAYS": <same as server>,
//     "EXTENSION_DURATION_DAYS": <same as server>,
//     "MAX_EXTENSIONS": <same as server>
//   }
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");
const formatDE = (d: Date) =>
  `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
const addDays = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const RENTAL_DURATION_DAYS: number = Cypress.env("RENTAL_DURATION_DAYS") ?? 21;
const EXTENSION_DURATION_DAYS: number =
  Cypress.env("EXTENSION_DURATION_DAYS") ?? 14;
const MAX_EXTENSIONS: number = Cypress.env("MAX_EXTENSIONS") ?? 2;

// ─────────────────────────────────────────────────────────────────────────────

describe("Rental extension logic", () => {
  let userId: number;
  let bookAId: number; // available → fresh rental
  let bookBUserColId: number; // rented, 0 renewals → user column extension
  let bookBBookColId: number; // rented, 0 renewals → book column extension
  let bookBUserPageId: number; // rented, 0 renewals → user detail page extension
  let bookCId: number; // rented, MAX_EXTENSIONS renewals → disabled tests

  before(() => {
    cy.task("resetDatabase");
    cy.task("seedRentalData").then((ids: any) => {
      userId = ids.userId;
      bookAId = ids.bookAId;
      bookBUserColId = ids.bookBUserColId;
      bookBBookColId = ids.bookBBookColId;
      bookBUserPageId = ids.bookBUserPageId;
      bookCId = ids.bookCId;
    });
  });

  after(() => {
    cy.task("cleanupDatabase");
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.session("user-session", () => {
      cy.login();
    });
    cy.visit("/");
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const openRentalUserAccordion = () => {
    cy.get("[data-cy=index_rental_button]").click();
    cy.url().should("include", "/rental");
    cy.get("[data-cy=user_search_input]")
      .should("be.visible")
      .type("Rentaltest");
    cy.get(`[data-cy=user_accordion_${userId}]`).click();
    cy.get(`[data-cy=user_accordion_details_${userId}]`).should("be.visible");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. FRESH RENTAL – POST /api/book/{id}/user/{userId}
  //    Expected due date: today + RENTAL_DURATION_DAYS
  // ═══════════════════════════════════════════════════════════════════════════

  it("rents Book A and verifies due date = today + RENTAL_DURATION_DAYS", () => {
    expect(
      RENTAL_DURATION_DAYS,
      "RENTAL_DURATION_DAYS must differ from EXTENSION_DURATION_DAYS",
    ).to.not.equal(EXTENSION_DURATION_DAYS);

    const expectedDue = formatDE(addDays(RENTAL_DURATION_DAYS));
    const wrongDue = formatDE(addDays(EXTENSION_DURATION_DAYS));

    cy.get("[data-cy=index_rental_button]").click();
    cy.url().should("include", "/rental");

    cy.get("[data-cy=user_search_input]").type("Rentaltest");
    cy.get(`[data-cy=user_accordion_${userId}]`).click();

    cy.get("[data-cy=book_search_input]").type(String(bookAId));
    cy.get(`[data-cy=book_item_${bookAId}]`).should("be.visible");

    cy.intercept("POST", `/api/book/${bookAId}/user/${userId}`).as("rentBook");
    cy.get(`[data-cy=book_rent_button_${bookAId}]`).click();
    cy.wait("@rentBook").its("response.statusCode").should("eq", 200);

    // ── DB check (authoritative) ──────────────────────────────────────────
    cy.task("verifyBook", bookAId).then((book: any) => {
      const dbDue = formatDE(new Date(book.dueDate));
      expect(
        dbDue,
        "dueDate in DB should equal today + RENTAL_DURATION_DAYS",
      ).to.equal(expectedDue);
      expect(
        dbDue,
        "dueDate must NOT equal today + EXTENSION_DURATION_DAYS",
      ).to.not.equal(wrongDue);
      expect(book.renewalCount).to.equal(0);
      expect(book.rentalStatus).to.equal("rented");
    });

    // ── DOM check after reload ────────────────────────────────────────────
    cy.reload();
    cy.get("[data-cy=index_rental_button]").click();
    cy.get("[data-cy=book_search_input]").type(String(bookAId));
    cy.get(`[data-cy=book_info_${bookAId}]`, { timeout: 6000 })
      .should("contain", `ausgeliehen bis ${expectedDue}`)
      .and("not.contain", `ausgeliehen bis ${wrongDue}`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. EXTENSION – user column (UserRentalList)
  //    POST /api/book/{id}/extend  (server computes date from EXTENSION_DURATION_DAYS)
  //    Expected due date: today + EXTENSION_DURATION_DAYS
  // ═══════════════════════════════════════════════════════════════════════════

  it("extends Book B (user column) and verifies due date = today + EXTENSION_DURATION_DAYS", () => {
    const expectedDue = formatDE(addDays(EXTENSION_DURATION_DAYS));
    const wrongDue = formatDE(addDays(RENTAL_DURATION_DAYS));

    openRentalUserAccordion();

    cy.get(`[data-cy=rental_book_details_${bookBUserColId}]`).should(
      "be.visible",
    );

    // New endpoint: POST /api/book/{id}/extend
    cy.intercept("POST", `/api/book/${bookBUserColId}/extend`).as("extendBook");
    cy.get(`[data-cy=book_extend_button_${bookBUserColId}]`)
      .should("not.be.disabled")
      .click();
    cy.wait("@extendBook").its("response.statusCode").should("eq", 200);

    // ── DB check ─────────────────────────────────────────────────────────
    cy.task("verifyBook", bookBUserColId).then((book: any) => {
      const dbDue = formatDE(new Date(book.dueDate));
      expect(
        dbDue,
        "dueDate should equal today + EXTENSION_DURATION_DAYS",
      ).to.equal(expectedDue);
      expect(
        dbDue,
        "dueDate must NOT equal today + RENTAL_DURATION_DAYS",
      ).to.not.equal(wrongDue);
      expect(book.renewalCount).to.equal(1);
    });

    // ── DOM check after reload ────────────────────────────────────────────
    cy.reload();
    openRentalUserAccordion();
    cy.get(`[data-cy=rental_book_details_${bookBUserColId}]`, { timeout: 6000 })
      .should("contain", `bis ${expectedDue}`)
      .and("not.contain", `bis ${wrongDue}`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. EXTENSION – book column (BookRentalList)
  // ═══════════════════════════════════════════════════════════════════════════

  it("extends Book B (book column) and verifies due date = today + EXTENSION_DURATION_DAYS", () => {
    const expectedDue = formatDE(addDays(EXTENSION_DURATION_DAYS));
    const wrongDue = formatDE(addDays(RENTAL_DURATION_DAYS));

    cy.get("[data-cy=index_rental_button]").click();
    cy.url().should("include", "/rental");

    cy.get("[data-cy=user_search_input]").type("Rentaltest");
    cy.get(`[data-cy=user_accordion_${userId}]`).click();

    cy.get("[data-cy=book_search_input]").type(String(bookBBookColId));
    cy.get(`[data-cy=book_item_${bookBBookColId}]`).should("be.visible");

    cy.intercept("POST", `/api/book/${bookBBookColId}/extend`).as(
      "extendBookCol",
    );
    cy.get(`[data-cy=book_item_${bookBBookColId}]`)
      .find(`[data-cy=book_extend_button_${bookBBookColId}]`)
      .should("not.be.disabled")
      .click();
    cy.wait("@extendBookCol").its("response.statusCode").should("eq", 200);

    // ── DB check ─────────────────────────────────────────────────────────
    cy.task("verifyBook", bookBBookColId).then((book: any) => {
      const dbDue = formatDE(new Date(book.dueDate));
      expect(
        dbDue,
        "dueDate should equal today + EXTENSION_DURATION_DAYS",
      ).to.equal(expectedDue);
      expect(
        dbDue,
        "dueDate must NOT equal today + RENTAL_DURATION_DAYS",
      ).to.not.equal(wrongDue);
      expect(book.renewalCount).to.equal(1);
    });

    // ── DOM check after reload ────────────────────────────────────────────
    cy.reload();
    cy.get("[data-cy=index_rental_button]").click();
    cy.get("[data-cy=book_search_input]").type(String(bookBBookColId));
    cy.get(`[data-cy=book_info_${bookBBookColId}]`, { timeout: 6000 })
      .should("contain", `ausgeliehen bis ${expectedDue}`)
      .and("not.contain", `ausgeliehen bis ${wrongDue}`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. EXTENSION – /user/[id] detail page (UserEditForm)
  // ═══════════════════════════════════════════════════════════════════════════

  it("extends Book B from the user detail page and verifies due date = today + EXTENSION_DURATION_DAYS", () => {
    const expectedDue = formatDE(addDays(EXTENSION_DURATION_DAYS));
    const wrongDue = formatDE(addDays(RENTAL_DURATION_DAYS));

    cy.visit(`/user/${userId}`);
    cy.url().should("include", `/user/${userId}`);

    cy.intercept("POST", `/api/book/${bookBUserPageId}/extend`).as(
      "extendUserPage",
    );

    cy.contains("Cypress Verlaengerbar UserPage")
      .closest("div.rounded-lg")
      .find("button")
      .eq(1)
      .should("be.visible")
      .click();

    cy.wait("@extendUserPage").its("response.statusCode").should("eq", 200);

    // ── DB check ─────────────────────────────────────────────────────────
    cy.task("verifyBook", bookBUserPageId).then((book: any) => {
      const dbDue = formatDE(new Date(book.dueDate));
      expect(
        dbDue,
        "dueDate should equal today + EXTENSION_DURATION_DAYS",
      ).to.equal(expectedDue);
      expect(
        dbDue,
        "dueDate must NOT equal today + RENTAL_DURATION_DAYS",
      ).to.not.equal(wrongDue);
      expect(book.renewalCount).to.equal(1);
    });

    // ── DOM check after reload ────────────────────────────────────────────
    cy.reload();
    cy.url().should("include", `/user/${userId}`);
    cy.contains("Cypress Verlaengerbar UserPage")
      .closest("div.rounded-lg")
      .should("contain", expectedDue)
      .and("not.contain", wrongDue);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. MAX EXTENSIONS – user column, extend button disabled
  // ═══════════════════════════════════════════════════════════════════════════

  it("disables the extend button for Book C (user column) when MAX_EXTENSIONS reached", () => {
    cy.task("verifyBook", bookCId).then((book: any) => {
      expect(
        book.renewalCount,
        "Book C renewalCount must equal MAX_EXTENSIONS",
      ).to.equal(MAX_EXTENSIONS);
    });

    openRentalUserAccordion();
    cy.get(`[data-cy=book_extend_button_${bookCId}]`).should("be.disabled");
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. MAX EXTENSIONS – book column, extend button disabled
  // ═══════════════════════════════════════════════════════════════════════════

  it("disables the extend button for Book C (book column) when MAX_EXTENSIONS reached", () => {
    cy.get("[data-cy=index_rental_button]").click();
    cy.url().should("include", "/rental");

    cy.get("[data-cy=user_search_input]").type("Rentaltest");
    cy.get(`[data-cy=user_accordion_${userId}]`).click();

    cy.get("[data-cy=book_search_input]").type(String(bookCId));
    cy.get(`[data-cy=book_item_${bookCId}]`).should("be.visible");

    cy.get(`[data-cy=book_item_${bookCId}]`)
      .find(`[data-cy=book_extend_button_${bookCId}]`)
      .should("be.disabled");
  });
});
