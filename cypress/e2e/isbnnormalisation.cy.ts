/// <reference types="cypress" />

// ISBNs arrive in whatever shape they were typed or scanned: hyphenated from a
// catalogue, spaced from a supplier list, bare from a barcode reader. Storing
// them in one canonical form is what lets a later lookup find the book at all.

const API = "http://localhost:3000/api/book";

describe("Canonical ISBN storage", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
  });

  it("should strip separators from an ISBN when a book is created", () => {
    cy.request("POST", API, {
      title: "Cypress ISBN Normalisierung",
      author: "Test, Autorin",
      isbn: "978-3-608-93828-9",
      rentalStatus: "available",
      renewalCount: 0,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body.isbn).to.eq("9783608938289");
    });
  });

  it("should also normalise an ISBN written with spaces on update", () => {
    cy.request("POST", API, {
      title: "Cypress ISBN Update",
      author: "Test, Autorin",
      isbn: "9783596906673",
      rentalStatus: "available",
      renewalCount: 0,
    }).then((created) => {
      cy.request("PUT", `${API}/${created.body.id}`, {
        ...created.body,
        isbn: "978 3 596 90667 3",
      }).then(() => {
        cy.request(`${API}/${created.body.id}`).then((res) => {
          expect(res.body.isbn).to.eq("9783596906673");
        });
      });
    });
  });

  it("should leave a book without an ISBN untouched", () => {
    cy.request("POST", API, {
      title: "Cypress ohne ISBN",
      author: "Test, Autorin",
      rentalStatus: "available",
      renewalCount: 0,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body.isbn ?? "").to.eq("");
    });
  });
});

export {};
