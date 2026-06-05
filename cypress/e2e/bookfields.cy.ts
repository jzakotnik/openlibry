/// <reference types="cypress" />

// ─────────────────────────────────────────────────────────────────────────────
// Test data — all fields that appear in BookEditForm
// ─────────────────────────────────────────────────────────────────────────────

const testBook = {
  isbn: "9783791504285",
  title: "Cypress Feldtest Buch",
  author: "Test Autorin",
  subtitle: "Ein vollständiger Untertitel",
  summary: "Eine ausführliche Zusammenfassung für den automatisierten Test.",
  publisherName: "Testverlag GmbH",
  publisherLocation: "Teststadt",
  publisherDate: "2024",
  editionDescription: "2. Auflage",
  pages: "256",
  price: "14.99",
  rentalStatus: "lost",
  renewalCount: "1",
  rentedDate: "2025-01-15",
  dueDate: "2025-02-05",
  minAge: "8",
  maxAge: "14",
  minPlayers: "2",
  physicalSize: "21x29 cm",
  otherPhysicalAttributes: "Hardcover",
  additionalMaterial: "Beiliegende CD",
  externalLinks: "https://example.com/buch",
  supplierComment: "Direkt vom Verlag bezogen",
};

// All rental statuses — raw values only, no display labels
const allStatuses: string[] = [
  "available",
  "rented",
  "broken",
  "presentation",
  "ordered",
  "lost",
  "remote",
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: interact with shadcn/ui <Select> by value, not display label
// ─────────────────────────────────────────────────────────────────────────────

function selectOption(triggerId: string, optionValue: string) {
  cy.get(`#${triggerId}`).click();
  cy.get(`[data-cy=option-${optionValue}]`).click();
  cy.get("[role=option]").should("not.exist");
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────────────────────

describe("Book fields — fill all and verify persistence", () => {
  before(() => {
    cy.resetDatabase();
    cy.task("logDatabaseState");
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
    cy.visit("http://localhost:3000/");
  });

  afterEach(() => {
    cy.task("logDatabaseState");
  });

  // ── 1. Fill every field and save ─────────────────────────────────────────

  it("should fill all fields and save successfully", () => {
    cy.navigateToBookEdit(Cypress.env("bookid"));

    cy.intercept("PUT", "/api/book/*").as("saveBook");

    // ── ISBN ─────────────────────────────────────────────────────────────
    cy.get("[data-cy=book-isbn-field]").clear().type(testBook.isbn);

    // ── Stammdaten des Buchs ─────────────────────────────────────────────
    cy.get("[data-cy=book-title-field]").clear().type(testBook.title);
    cy.get("[data-cy=book-author-field]").clear().type(testBook.author);
    cy.get("[data-cy=book-subtitle-field]").clear().type(testBook.subtitle);
    cy.get("[data-cy=book-summary-field]").clear().type(testBook.summary);

    // ── Verlag & Ausgabe ─────────────────────────────────────────────────
    cy.get("[data-cy=book-publisherName-field]")
      .clear()
      .type(testBook.publisherName);
    cy.get("[data-cy=book-publisherLocation-field]")
      .clear()
      .type(testBook.publisherLocation);
    cy.get("[data-cy=book-publisherDate-field]")
      .clear()
      .type(testBook.publisherDate);
    cy.get("[data-cy=book-editionDescription-field]")
      .clear()
      .type(testBook.editionDescription);
    cy.get("[data-cy=book-pages-field]").clear().type(testBook.pages);
    cy.get("[data-cy=book-price-field]").clear().type(testBook.price);

    // ── Ausleih-Status ───────────────────────────────────────────────────
    selectOption("book-rentalStatus-select", testBook.rentalStatus);
    selectOption("book-renewalCount-select", testBook.renewalCount);

    cy.get("[data-cy=book_rentedDate_datepicker]")
      .find("input[type=date]")
      .clear()
      .type(testBook.rentedDate);

    cy.get("[data-cy=book_dueDate_datepicker]")
      .find("input[type=date]")
      .clear()
      .type(testBook.dueDate);

    // ── Weitere Angaben ──────────────────────────────────────────────────
    cy.get("[data-cy=book-minAge-field]").clear().type(testBook.minAge);
    cy.get("[data-cy=book-maxAge-field]").clear().type(testBook.maxAge);
    cy.get("[data-cy=book-minPlayers-field]").clear().type(testBook.minPlayers);
    cy.get("[data-cy=book-physicalSize-field]")
      .clear()
      .type(testBook.physicalSize);
    cy.get("[data-cy=book-otherPhysicalAttributes-field]")
      .clear()
      .type(testBook.otherPhysicalAttributes);
    cy.get("[data-cy=book-additionalMaterial-field]")
      .clear()
      .type(testBook.additionalMaterial);
    cy.get("[data-cy=book-externalLinks-field]")
      .clear()
      .type(testBook.externalLinks);
    cy.get("[data-cy=book-supplierComment-field]")
      .clear()
      .type(testBook.supplierComment);

    // ── Save ─────────────────────────────────────────────────────────────
    cy.get("[data-cy=save-book-button]").click();

    cy.wait("@saveBook", { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });

    cy.url({ timeout: 10000 }).should("not.include", "/edit");
  });

  // ── 2. Navigate back and verify every field ───────────────────────────

  it("should reflect all saved field values after reload", () => {
    cy.navigateToBookEdit(Cypress.env("bookid"));

    cy.get("[data-cy=book-isbn-field]").should("have.value", testBook.isbn);
    cy.get("[data-cy=book-title-field]").should("have.value", testBook.title);
    cy.get("[data-cy=book-author-field]").should("have.value", testBook.author);
    cy.get("[data-cy=book-subtitle-field]").should(
      "have.value",
      testBook.subtitle,
    );
    cy.get("[data-cy=book-summary-field]").should(
      "have.value",
      testBook.summary,
    );

    cy.get("[data-cy=book-publisherName-field]").should(
      "have.value",
      testBook.publisherName,
    );
    cy.get("[data-cy=book-publisherLocation-field]").should(
      "have.value",
      testBook.publisherLocation,
    );
    cy.get("[data-cy=book-publisherDate-field]").should(
      "have.value",
      testBook.publisherDate,
    );
    cy.get("[data-cy=book-editionDescription-field]").should(
      "have.value",
      testBook.editionDescription,
    );
    cy.get("[data-cy=book-pages-field]").should("have.value", testBook.pages);
    cy.get("[data-cy=book-price-field]").should("have.value", testBook.price);

    cy.get("#book-rentalStatus-select").should(
      "have.attr",
      "data-value",
      testBook.rentalStatus,
    );
    cy.get("#book-renewalCount-select").should(
      "have.attr",
      "data-value",
      testBook.renewalCount,
    );

    cy.get("[data-cy=book_rentedDate_datepicker]")
      .find("input[type=date]")
      .should("have.value", testBook.rentedDate);

    cy.get("[data-cy=book_dueDate_datepicker]")
      .find("input[type=date]")
      .should("have.value", testBook.dueDate);

    cy.get("[data-cy=book-minAge-field]").should("have.value", testBook.minAge);
    cy.get("[data-cy=book-maxAge-field]").should("have.value", testBook.maxAge);
    cy.get("[data-cy=book-minPlayers-field]").should(
      "have.value",
      testBook.minPlayers,
    );
    cy.get("[data-cy=book-physicalSize-field]").should(
      "have.value",
      testBook.physicalSize,
    );
    cy.get("[data-cy=book-otherPhysicalAttributes-field]").should(
      "have.value",
      testBook.otherPhysicalAttributes,
    );
    cy.get("[data-cy=book-additionalMaterial-field]").should(
      "have.value",
      testBook.additionalMaterial,
    );
    cy.get("[data-cy=book-externalLinks-field]").should(
      "have.value",
      testBook.externalLinks,
    );
    cy.get("[data-cy=book-supplierComment-field]").should(
      "have.value",
      testBook.supplierComment,
    );
  });

  // ── 3. Verify status badge on the book card reflects the saved status ─

  it("should show the correct status badge on the book card", () => {
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]")
      .should("be.visible")
      .type(String(Cypress.env("bookid")));

    cy.get(`[data-cy=book_summary_card_${Cypress.env("bookid")}]`)
      .should("be.visible")
      .find("[role=status]")
      .should("have.attr", "data-value", testBook.rentalStatus);
  });

  // ── 4. Verify the DB record directly ─────────────────────────────────

  it("should persist all field values in the database", () => {
    cy.task("verifyBook", parseInt(Cypress.env("bookid"))).then((book: any) => {
      expect(book).to.not.be.null;
      expect(book.title).to.equal(testBook.title);
      expect(book.author).to.equal(testBook.author);
      expect(book.subtitle).to.equal(testBook.subtitle);
      expect(book.summary).to.equal(testBook.summary);
      expect(book.isbn).to.equal(testBook.isbn);
      expect(book.publisherName).to.equal(testBook.publisherName);
      expect(book.publisherLocation).to.equal(testBook.publisherLocation);
      expect(book.publisherDate).to.equal(testBook.publisherDate);
      expect(book.editionDescription).to.equal(testBook.editionDescription);
      expect(book.pages).to.equal(parseInt(testBook.pages));
      expect(book.price).to.equal(testBook.price);
      expect(book.rentalStatus).to.equal(testBook.rentalStatus);
      expect(book.renewalCount).to.equal(parseInt(testBook.renewalCount));
      expect(book.minAge).to.equal(testBook.minAge);
      expect(book.maxAge).to.equal(testBook.maxAge);
      expect(book.minPlayers).to.equal(testBook.minPlayers);
      expect(book.physicalSize).to.equal(testBook.physicalSize);
      expect(book.otherPhysicalAttributes).to.equal(
        testBook.otherPhysicalAttributes,
      );
      expect(book.additionalMaterial).to.equal(testBook.additionalMaterial);
      expect(book.externalLinks).to.equal(testBook.externalLinks);
      expect(book.supplierComment).to.equal(testBook.supplierComment);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rental status cycling — one describe block per status
// For each status: save → verify select → verify badge → verify DB
// ─────────────────────────────────────────────────────────────────────────────

allStatuses.forEach((value) => {
  describe(`Rental status: ${value}`, () => {
    before(() => {
      cy.resetDatabase();
    });

    after(() => {
      cy.task("cleanupDatabase");
    });

    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.session(`user-session-${value}`, () => {
        cy.login();
      });
      cy.visit("http://localhost:3000/");
    });

    it(`should save status "${value}" successfully`, () => {
      cy.navigateToBookEdit(Cypress.env("bookid"));
      cy.intercept("PUT", "/api/book/*").as(`save_${value}`);

      selectOption("book-rentalStatus-select", value);

      cy.get("[data-cy=save-book-button]").click();
      cy.wait(`@save_${value}`, { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });
      cy.url({ timeout: 10000 }).should("not.include", "/edit");
    });

    it(`should show "${value}" in the select after reload`, () => {
      cy.navigateToBookEdit(Cypress.env("bookid"));
      cy.get("#book-rentalStatus-select").should(
        "have.attr",
        "data-value",
        value,
      );
    });

    it(`should show correct badge on the book card`, () => {
      cy.get("[data-cy=index_book_button]").click();
      cy.get("[data-cy=rental_input_searchbook]")
        .should("be.visible")
        .type(String(Cypress.env("bookid")));
      cy.get(`[data-cy=book_summary_card_${Cypress.env("bookid")}]`)
        .should("be.visible")
        .find("[role=status]")
        .should("have.attr", "data-value", value);
    });

    it(`should persist raw status "${value}" in the database`, () => {
      cy.task("verifyBook", parseInt(Cypress.env("bookid"))).then(
        (book: any) => {
          expect(book).to.not.be.null;
          expect(book.rentalStatus).to.equal(value);
        },
      );
    });
  });
});
