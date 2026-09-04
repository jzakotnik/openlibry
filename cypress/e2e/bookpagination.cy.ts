/// <reference types="cypress" />

// Paging moved from the browser to the server. Both list pages used to receive
// the whole catalogue and slice it client side, so memory grew with the size of
// the library rather than with what is on screen. These specs pin the new query
// contract and, just as importantly, the unparameterised responses that
// existing callers still depend on.

const API = "http://localhost:3000/api/book";
const PUBLIC_API = "http://localhost:3000/api/public/books";

describe("Server-side book pagination", () => {
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

  it("should return one page of books together with the total", () => {
    cy.request(`${API}?pageSize=5&page=1`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.books).to.have.length(5);
      expect(res.body.page).to.eq(1);
      expect(res.body.pageSize).to.eq(5);
      // The seed holds more books than fit on one page, which is the whole
      // point: total counts the catalogue, not the slice.
      expect(res.body.total).to.be.greaterThan(5);
    });
  });

  it("should return a different slice on the second page", () => {
    cy.request(`${API}?pageSize=5&page=1`).then((first) => {
      cy.request(`${API}?pageSize=5&page=2`).then((second) => {
        const firstIds = first.body.books.map((b: { id: number }) => b.id);
        const secondIds = second.body.books.map((b: { id: number }) => b.id);
        expect(second.body.page).to.eq(2);
        expect(secondIds).to.have.length(5);
        expect(firstIds.filter((id: number) => secondIds.includes(id))).to.be
          .empty;
      });
    });
  });

  it("should still answer with a plain array when pageSize is omitted", () => {
    // Older callers pass no paging parameters and expect the full list.
    cy.request(API).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(5);
    });
  });

  it("should narrow the result set with a search term", () => {
    cy.request(`${API}?pageSize=20&q=Diebe`).then((res) => {
      expect(res.body.total).to.be.greaterThan(0);
      expect(res.body.books.length).to.eq(res.body.total);
      res.body.books.forEach((b: { title: string }) => {
        expect(b.title).to.contain("Diebe");
      });
    });
  });

  it("should page the public catalogue without a session", () => {
    cy.clearCookies();
    cy.request(`${PUBLIC_API}?pageSize=3&page=1`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.books).to.have.length(3);
      expect(res.body.pageSize).to.eq(3);
      expect(res.body.total).to.be.greaterThan(3);
    });
  });

  it("should still answer the public catalogue with a plain array by default", () => {
    cy.clearCookies();
    cy.request(PUBLIC_API).then((res) => {
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(3);
    });
  });

  it("should render the book list page and its search field", () => {
    cy.visit("http://localhost:3000/book");
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");
    cy.contains("Herr der Diebe").should("be.visible");
  });
});

export {};
