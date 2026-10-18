/// <reference types="cypress" />

// Single-book API: POST /api/book, PUT/DELETE /api/book/:id. The interesting
// part is the link between a book and its borrower when a book is edited or
// deleted while it is rented.
describe("Book API", () => {
  const API = "http://localhost:3000/api";

  let users: Record<string, number>;
  let books: Record<string, number>;

  beforeEach(() => {
    cy.resetAndSeed();
    cy.task("seedScenario", "batch").then((ids: any) => {
      users = ids.userIdByLastName;
      books = ids.bookIdByLabel;
    });
    cy.session("user-session", () => {
      cy.login();
    });
  });

  after(() => {
    cy.clearDatabase();
  });

  const createBook = (body: Cypress.RequestBody) =>
    cy.request({
      method: "POST",
      url: `${API}/book`,
      body,
      failOnStatusCode: false,
    });

  const updateBook = (id: number, body: Cypress.RequestBody) =>
    cy.request({
      method: "PUT",
      url: `${API}/book/${id}`,
      body,
      failOnStatusCode: false,
    });

  const removeBook = (id: number) =>
    cy.request({
      method: "DELETE",
      url: `${API}/book/${id}`,
      failOnStatusCode: false,
    });

  describe("creating", () => {
    it("creates a book with the given fields", () => {
      createBook({
        title: "Neues Buch",
        author: "Neue Autorin",
        renewalCount: 0,
        topics: "Abenteuer;Tiere",
        pages: 123,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.id).to.be.a("number");

        cy.task("verifyBook", res.body.id).then((book: any) => {
          expect(book.title).to.eq("Neues Buch");
          expect(book.author).to.eq("Neue Autorin");
          expect(book.topics).to.eq("Abenteuer;Tiere");
          expect(book.pages).to.eq(123);
          expect(book.rentalStatus).to.eq("available");
        });
      });
    });

    it("creates a book with a chosen id", () => {
      createBook({
        id: 888,
        title: "Feste Nummer",
        author: "A",
        renewalCount: 0,
      })
        .its("body.id")
        .should("eq", 888);
    });

    it("rejects an id that is already taken and keeps the existing book", () => {
      createBook({
        id: books.freeBook,
        title: "Doppelt",
        author: "A",
        renewalCount: 0,
      })
        .its("status")
        .should("eq", 400);

      cy.task("verifyBook", books.freeBook).then((book: any) => {
        expect(book.title).to.eq("Scn Free");
      });
    });

    it("rejects a book without a title", () => {
      cy.task("countBooks").then((before) => {
        createBook({ author: "Ohne Titel", renewalCount: 0 })
          .its("status")
          .should("eq", 400);
        cy.task("countBooks").should("eq", before);
      });
    });
  });

  describe("updating", () => {
    it("stores the changed fields", () => {
      updateBook(books.freeBook, {
        title: "Geänderter Titel",
        author: "Geänderte Autorin",
        renewalCount: 0,
        rentalStatus: "available",
        subtitle: "Neuer Untertitel",
      })
        .its("status")
        .should("eq", 200);

      cy.task("verifyBook", books.freeBook).then((book: any) => {
        expect(book.title).to.eq("Geänderter Titel");
        expect(book.author).to.eq("Geänderte Autorin");
        expect(book.subtitle).to.eq("Neuer Untertitel");
      });
    });

    it("can clear an optional field", () => {
      updateBook(books.freeBook, {
        title: "Mit Untertitel",
        author: "A",
        renewalCount: 0,
        rentalStatus: "available",
        subtitle: "Weg damit",
      })
        .its("status")
        .should("eq", 200);
      updateBook(books.freeBook, {
        title: "Mit Untertitel",
        author: "A",
        renewalCount: 0,
        rentalStatus: "available",
        subtitle: null,
      })
        .its("status")
        .should("eq", 200);

      cy.task("verifyBook", books.freeBook).then((book: any) => {
        expect(book.subtitle).to.be.null;
      });
    });

    it("ignores an id in the body: the book keeps its id", () => {
      updateBook(books.freeBook, {
        id: 999999,
        title: "Gleiche Nummer",
        author: "A",
        renewalCount: 0,
        rentalStatus: "available",
      })
        .its("status")
        .should("eq", 200);

      cy.task("verifyBook", books.freeBook).then((book: any) => {
        expect(book.title).to.eq("Gleiche Nummer");
      });
      cy.task("verifyBook", 999999).should("be.null");
    });

    it("keeps the loan when a rented book is edited and stays rented", () => {
      cy.task("verifyBook", books.deltaBook).then((before: any) => {
        updateBook(books.deltaBook, {
          title: "Verliehen und bearbeitet",
          author: "A",
          renewalCount: before.renewalCount,
          rentalStatus: "rented",
        })
          .its("status")
          .should("eq", 200);

        cy.task("verifyBook", books.deltaBook).then((book: any) => {
          expect(book.title).to.eq("Verliehen und bearbeitet");
          expect(book.rentalStatus).to.eq("rented");
          expect(book.userId).to.eq(users.Scndelta);
          expect(new Date(book.dueDate).getTime()).to.eq(
            new Date(before.dueDate).getTime(),
          );
        });
      });
    });

    ["lost", "broken", "available"].forEach((status) => {
      it(`ends the loan when a rented book is set to "${status}"`, () => {
        updateBook(books.alphaBook1, {
          title: "Scn Alpha Rented 1",
          author: "Scn Autor",
          renewalCount: 1,
          rentalStatus: status,
        })
          .its("status")
          .should("eq", 200);

        cy.task("verifyBook", books.alphaBook1).then((book: any) => {
          expect(book.rentalStatus).to.eq(status);
          expect(book.userId).to.be.null;
        });
        // the borrower's other loan is untouched
        cy.task("verifyBook", books.alphaBook2).then((book: any) => {
          expect(book.rentalStatus).to.eq("rented");
          expect(book.userId).to.eq(users.Scnalpha);
        });
      });
    });

    it("fails for an unknown book", () => {
      updateBook(999999, {
        title: "Niemand",
        author: "A",
        renewalCount: 0,
      })
        .its("status")
        .should("eq", 400);
    });
  });

  describe("deleting", () => {
    it("deletes a book", () => {
      removeBook(books.freeBook).its("status").should("eq", 200);
      cy.task("verifyBook", books.freeBook).should("be.null");
      cy.task("verifyBook", books.freeBook2).should("not.be.null");
    });

    it("deletes a rented book and removes it from the borrower's loans", () => {
      removeBook(books.alphaBook1).its("status").should("eq", 200);
      cy.task("verifyBook", books.alphaBook1).should("be.null");

      cy.request(`${API}/rental`).then((res) => {
        const loanIds = res.body.rentals.map((r: any) => r.id);
        expect(loanIds).to.not.include(books.alphaBook1);
        expect(loanIds).to.include(books.alphaBook2);
      });
      cy.task("verifyUser", users.Scnalpha).should("not.be.null");
    });

    it("fails for an unknown book and changes nothing", () => {
      cy.task("countBooks").then((before) => {
        removeBook(999999).its("status").should("eq", 400);
        cy.task("countBooks").should("eq", before);
      });
    });
  });
});
