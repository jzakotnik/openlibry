/// <reference types="cypress" />

const pad = (n: number) => String(n).padStart(2, "0");

const formatDE = (d: Date) =>
  `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

const formatISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const addDays = (days: number, base: Date = new Date()): Date => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const RENTAL_DURATION_DAYS: number = Cypress.env("RENTAL_DURATION_DAYS") ?? 21;
const EXTENSION_DURATION_DAYS: number =
  Cypress.env("EXTENSION_DURATION_DAYS") ?? 14;
const MAX_EXTENSIONS: number = Cypress.env("MAX_EXTENSIONS") ?? 2;

describe("Rental extension logic", () => {
  // IDs are populated from resetAndSeed() in before() and shared via
  // module-level variables — safe within a single spec file.
  let userId: number;
  let bookAId: number;
  let bookBUserColId: number;
  let bookBBookColId: number;
  let bookBUserPageId: number;
  let bookCId: number;

  before(() => {
    // resetAndSeed() already contains all the rental fixture books defined
    // in seed-books.json (bookA, bookBUserCol, bookBBookCol, bookBUserPage,
    // bookC) so no separate seedRentalData task is needed.
    cy.resetAndSeed().then((ids) => {
      userId = ids.userId;
      bookAId = ids.bookAId;
      bookBUserColId = ids.bookBUserColId;
      bookBBookColId = ids.bookBBookColId;
      bookBUserPageId = ids.bookBUserPageId;
      bookCId = ids.bookCId;
    });
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
    cy.visit("/");
  });

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
  // 1. FRESH RENTAL
  // ═══════════════════════════════════════════════════════════════════════════

  it("rents Book A and verifies due date = today + RENTAL_DURATION_DAYS", () => {
    expect(
      RENTAL_DURATION_DAYS,
      "RENTAL_DURATION_DAYS must differ from EXTENSION_DURATION_DAYS",
    ).to.not.equal(EXTENSION_DURATION_DAYS);

    const expectedDue = formatDE(addDays(RENTAL_DURATION_DAYS));
    const expectedDueISO = formatISO(addDays(RENTAL_DURATION_DAYS));
    const wrongDue = formatDE(addDays(EXTENSION_DURATION_DAYS));

    cy.get("[data-cy=index_rental_button]").click();
    cy.url().should("include", "/rental");

    cy.get("[data-cy=user_search_input]").type("Rentaltest");
    cy.wait(1500);
    cy.get(`[data-cy=user_accordion_${userId}]`).click();

    cy.get("[data-cy=book_search_input]").type(String(bookAId));
    cy.get(`[data-cy=book_item_${bookAId}]`).should("be.visible");

    cy.intercept("POST", `/api/book/${bookAId}/user/${userId}`).as("rentBook");
    cy.get(`[data-cy=book_rent_button_${bookAId}]`).click();
    cy.wait("@rentBook").its("response.statusCode").should("eq", 200);

    cy.task("verifyBook", bookAId).then((book: any) => {
      const dbDue = formatDE(new Date(book.dueDate));
      expect(
        dbDue,
        "dueDate should equal today + RENTAL_DURATION_DAYS",
      ).to.equal(expectedDue);
      expect(
        dbDue,
        "dueDate must NOT equal today + EXTENSION_DURATION_DAYS",
      ).to.not.equal(wrongDue);
      expect(book.renewalCount).to.equal(0);
      expect(book.rentalStatus).to.equal("rented");
    });

    cy.visit("/");
    cy.get("[data-cy=index_rental_button]").click();
    cy.get("[data-cy=book_search_input]").type(String(bookAId));
    cy.get(`[data-cy=book_info_${bookAId}]`, { timeout: 6000 }).should(
      "have.attr",
      "data-due-date",
      expectedDueISO,
    );
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. EXTENSION – user column
  // ═══════════════════════════════════════════════════════════════════════════

  it("extends Book B (user column) and verifies due date = today + EXTENSION_DURATION_DAYS", () => {
    cy.task("verifyBook", bookBUserColId).then((bookBefore: any) => {
      const previousDueDate = new Date(bookBefore.dueDate);
      const expectedDue = formatDE(addDays(EXTENSION_DURATION_DAYS));
      const expectedDueISO = formatISO(addDays(EXTENSION_DURATION_DAYS));
      const wrongDue = formatDE(
        addDays(EXTENSION_DURATION_DAYS, previousDueDate),
      );

      openRentalUserAccordion();

      cy.get(`[data-cy=rental_book_details_${bookBUserColId}]`).should(
        "be.visible",
      );

      cy.intercept("POST", `/api/book/${bookBUserColId}/extend`).as(
        "extendBook",
      );
      cy.get("[data-cy=rental_user_column]")
        .find(`[data-cy=book_extend_button_${bookBUserColId}]`)
        .should("not.be.disabled")
        .click();
      cy.wait("@extendBook").its("response.statusCode").should("eq", 200);

      cy.task("verifyBook", bookBUserColId).then((bookAfter: any) => {
        const dbDue = formatDE(new Date(bookAfter.dueDate));
        expect(
          dbDue,
          "dueDate should equal today + EXTENSION_DURATION_DAYS",
        ).to.equal(expectedDue);
        expect(
          dbDue,
          "must NOT equal previousDueDate + EXTENSION_DURATION_DAYS",
        ).to.not.equal(wrongDue);
        expect(bookAfter.renewalCount).to.equal(1);
      });

      cy.visit("/");
      openRentalUserAccordion();
      cy.get(`[data-cy=rental_book_details_${bookBUserColId}]`, {
        timeout: 6000,
      }).should("have.attr", "data-due-date", expectedDueISO);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. EXTENSION – book column
  // ═══════════════════════════════════════════════════════════════════════════

  it("extends Book B (book column) and verifies due date = today + EXTENSION_DURATION_DAYS", () => {
    cy.task("verifyBook", bookBBookColId).then((bookBefore: any) => {
      const previousDueDate = new Date(bookBefore.dueDate);
      const expectedDue = formatDE(addDays(EXTENSION_DURATION_DAYS));
      const expectedDueISO = formatISO(addDays(EXTENSION_DURATION_DAYS));
      const wrongDue = formatDE(
        addDays(EXTENSION_DURATION_DAYS, previousDueDate),
      );

      cy.get("[data-cy=index_rental_button]").click();
      cy.url().should("include", "/rental");

      cy.get("[data-cy=user_search_input]").type("Rentaltest");
      cy.get(`[data-cy=user_accordion_${userId}]`).click();

      cy.get("[data-cy=book_search_input]").type(String(bookBBookColId));
      cy.wait(1500);
      cy.get(`[data-cy=book_item_${bookBBookColId}]`).should("be.visible");

      cy.intercept("POST", `/api/book/${bookBBookColId}/extend`).as(
        "extendBookCol",
      );
      cy.get(`[data-cy=book_item_${bookBBookColId}]`)
        .find(`[data-cy=book_extend_button_${bookBBookColId}]`)
        .should("not.be.disabled")
        .click();
      cy.wait("@extendBookCol").its("response.statusCode").should("eq", 200);

      cy.task("verifyBook", bookBBookColId).then((bookAfter: any) => {
        const dbDue = formatDE(new Date(bookAfter.dueDate));
        expect(
          dbDue,
          "dueDate should equal today + EXTENSION_DURATION_DAYS",
        ).to.equal(expectedDue);
        expect(
          dbDue,
          "must NOT equal previousDueDate + EXTENSION_DURATION_DAYS",
        ).to.not.equal(wrongDue);
        expect(bookAfter.renewalCount).to.equal(1);
      });

      cy.visit("/");
      cy.get("[data-cy=index_rental_button]").click();
      cy.get("[data-cy=book_search_input]").type(String(bookBBookColId));
      cy.wait(1500);
      cy.get(`[data-cy=book_info_${bookBBookColId}]`, { timeout: 6000 }).should(
        "have.attr",
        "data-due-date",
        expectedDueISO,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. EXTENSION – /user/[id] detail page
  // ═══════════════════════════════════════════════════════════════════════════

  it("extends Book B from the user detail page and verifies due date = today + EXTENSION_DURATION_DAYS", () => {
    cy.task("verifyBook", bookBUserPageId).then((bookBefore: any) => {
      const previousDueDate = new Date(bookBefore.dueDate);
      const expectedDue = formatDE(addDays(EXTENSION_DURATION_DAYS));
      const expectedDueISO = formatISO(addDays(EXTENSION_DURATION_DAYS));
      const wrongDue = formatDE(
        addDays(EXTENSION_DURATION_DAYS, previousDueDate),
      );

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

      cy.task("verifyBook", bookBUserPageId).then((bookAfter: any) => {
        const dbDue = formatDE(new Date(bookAfter.dueDate));
        expect(
          dbDue,
          "dueDate should equal today + EXTENSION_DURATION_DAYS",
        ).to.equal(expectedDue);
        expect(
          dbDue,
          "must NOT equal previousDueDate + EXTENSION_DURATION_DAYS",
        ).to.not.equal(wrongDue);
        expect(bookAfter.renewalCount).to.equal(1);
      });

      cy.reload();
      cy.url().should("include", `/user/${userId}`);
      cy.get(`[data-cy=book_due_date_${bookBUserPageId}]`, {
        timeout: 6000,
      }).should("have.attr", "data-due-date", expectedDueISO);
    });
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
    cy.get("[data-cy=rental_user_column]")
      .find(`[data-cy=book_extend_button_${bookCId}]`)
      .should("be.disabled");
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
