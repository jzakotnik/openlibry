/// <reference types="cypress" />

// Rental rules at API level: rent (POST /book/:id/user/:uid), return
// (DELETE /book/:id/user/:uid) and extend (POST /book/:id/extend). The UI
// specs rental/rentalextension cover the screens; these pin the rules.
describe("Rental rules (API)", () => {
  const API = "/api";

  const RENTAL_DURATION_DAYS: number =
    Cypress.env("RENTAL_DURATION_DAYS") ?? 21;
  const EXTENSION_DURATION_DAYS: number =
    Cypress.env("EXTENSION_DURATION_DAYS") ?? 14;
  const MAX_EXTENSIONS: number = Cypress.env("MAX_EXTENSIONS") ?? 2;
  const DAY_MS = 24 * 60 * 60 * 1000;

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

  const rent = (bookId: number, userId: number) =>
    cy.request({
      method: "POST",
      url: `${API}/book/${bookId}/user/${userId}`,
      failOnStatusCode: false,
    });

  const giveBack = (bookId: number, userId: number) =>
    cy.request({
      method: "DELETE",
      url: `${API}/book/${bookId}/user/${userId}`,
      failOnStatusCode: false,
    });

  const extend = (bookId: number) =>
    cy.request({
      method: "POST",
      url: `${API}/book/${bookId}/extend`,
      failOnStatusCode: false,
    });

  // whole days between two instants, tolerant of a 23/25 hour day at DST change
  const daysBetween = (from: string | Date, to: string | Date) =>
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS);

  // |date - (now + days)| below one day: same moment, give or take the test run
  const expectDueInDays = (due: string | Date, days: number) => {
    const expected = Date.now() + days * DAY_MS;
    expect(
      Math.abs(new Date(due).getTime() - expected),
      `due date should be about ${days} days from now`,
    ).to.be.lessThan(DAY_MS);
  };

  describe("renting", () => {
    it("stores borrower, status and a due date RENTAL_DURATION_DAYS ahead", () => {
      rent(books.freeBook, users.Scnalpha).its("status").should("eq", 200);

      cy.task("verifyBook", books.freeBook).then((book: any) => {
        expect(book.rentalStatus).to.eq("rented");
        expect(book.userId).to.eq(users.Scnalpha);
        expect(book.renewalCount).to.eq(0);
        expect(daysBetween(book.rentedDate, book.dueDate)).to.eq(
          RENTAL_DURATION_DAYS,
        );
        expectDueInDays(book.dueDate, RENTAL_DURATION_DAYS);
      });
    });

    it("rejects an already rented book with 409 and keeps the borrower", () => {
      cy.task("verifyBook", books.deltaBook).then((before: any) => {
        rent(books.deltaBook, users.Scnalpha).its("status").should("eq", 409);

        cy.task("verifyBook", books.deltaBook).then((after: any) => {
          expect(after.userId).to.eq(users.Scndelta);
          expect(after.rentalStatus).to.eq("rented");
          expect(new Date(after.dueDate).getTime()).to.eq(
            new Date(before.dueDate).getTime(),
          );
        });
      });
    });

    it("rejects an inactive user with 403 and leaves the book available", () => {
      rent(books.freeBook, users.Scninactive).its("status").should("eq", 403);

      cy.task("verifyBook", books.freeBook).then((book: any) => {
        expect(book.rentalStatus).to.eq("available");
        expect(book.userId).to.be.null;
      });
    });

    it("fails for an unknown user and leaves the book available", () => {
      rent(books.freeBook, 999999).its("status").should("be.gte", 400);

      cy.task("verifyBook", books.freeBook).then((book: any) => {
        expect(book.rentalStatus).to.eq("available");
        expect(book.userId).to.be.null;
      });
    });

    it("fails for an unknown book", () => {
      rent(999999, users.Scnalpha).its("status").should("be.gte", 400);
    });
  });

  describe("returning", () => {
    it("resets status, due date, extension counter and borrower", () => {
      giveBack(books.alphaBook2, users.Scnalpha)
        .its("status")
        .should("eq", 200);

      cy.task("verifyBook", books.alphaBook2).then((book: any) => {
        expect(book.rentalStatus).to.eq("available");
        expect(book.dueDate).to.be.null;
        expect(book.renewalCount).to.eq(0);
        expect(book.userId).to.be.null;
      });
    });

    it("lets someone else rent the returned book with a fresh counter", () => {
      giveBack(books.alphaBook2, users.Scnalpha)
        .its("status")
        .should("eq", 200);
      rent(books.alphaBook2, users.Scnbeta).its("status").should("eq", 200);

      cy.task("verifyBook", books.alphaBook2).then((book: any) => {
        expect(book.rentalStatus).to.eq("rented");
        expect(book.userId).to.eq(users.Scnbeta);
        expect(book.renewalCount).to.eq(0);
        expectDueInDays(book.dueDate, RENTAL_DURATION_DAYS);
      });
    });

    it("does not touch the other loans of the same user", () => {
      giveBack(books.alphaBook1, users.Scnalpha)
        .its("status")
        .should("eq", 200);

      cy.task("verifyBook", books.alphaBook2).then((book: any) => {
        expect(book.rentalStatus).to.eq("rented");
        expect(book.userId).to.eq(users.Scnalpha);
      });
    });

    it("rejects a return by the wrong user with 400 and keeps the loan", () => {
      cy.task("verifyBook", books.betaBook).then((before: any) => {
        giveBack(books.betaBook, users.Scnalpha)
          .its("status")
          .should("eq", 400);

        cy.task("verifyBook", books.betaBook).then((after: any) => {
          expect(after.rentalStatus).to.eq("rented");
          expect(after.userId).to.eq(users.Scnbeta);
          expect(new Date(after.dueDate).getTime()).to.eq(
            new Date(before.dueDate).getTime(),
          );
        });
      });
    });

    it("rejects returning a book that is not rented", () => {
      giveBack(books.freeBook, users.Scnalpha).its("status").should("eq", 400);

      cy.task("verifyBook", books.freeBook).then((book: any) => {
        expect(book.rentalStatus).to.eq("available");
      });
    });
  });

  describe("extending", () => {
    it("sets the due date to today + EXTENSION_DURATION_DAYS and counts it", () => {
      extend(books.deltaBook).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.result).to.eq("ok");
        expect(res.body.renewalCount).to.eq(1);
      });

      cy.task("verifyBook", books.deltaBook).then((book: any) => {
        expect(book.renewalCount).to.eq(1);
        expect(book.rentalStatus).to.eq("rented");
        expectDueInDays(book.dueDate, EXTENSION_DURATION_DAYS);
      });
    });

    it("counts from today, not from the old due date", () => {
      // deltaBook is due in ~12 days; counting from that would give 12 + 14.
      extend(books.deltaBook).its("status").should("eq", 200);

      cy.task("verifyBook", books.deltaBook).then((book: any) => {
        const old = Date.now() + 12 * DAY_MS;
        expect(new Date(book.dueDate).getTime()).to.be.lessThan(
          old + EXTENSION_DURATION_DAYS * DAY_MS - DAY_MS,
        );
      });
    });

    it("answers 409 once MAX_EXTENSIONS is reached and changes nothing", () => {
      for (let i = 0; i < MAX_EXTENSIONS; i++) {
        extend(books.betaBook).its("status").should("eq", 200);
      }

      cy.task("verifyBook", books.betaBook).then((atLimit: any) => {
        expect(atLimit.renewalCount).to.eq(MAX_EXTENSIONS);

        extend(books.betaBook).then((res) => {
          expect(res.status).to.eq(409);
          expect(res.body.result).to.eq("already_extended");
        });

        cy.task("verifyBook", books.betaBook).then((after: any) => {
          expect(after.renewalCount).to.eq(MAX_EXTENSIONS);
          expect(new Date(after.dueDate).getTime()).to.eq(
            new Date(atLimit.dueDate).getTime(),
          );
        });
      });
    });

    it("rejects a book that is not rented (no due date) with 400", () => {
      extend(books.freeBook).its("status").should("eq", 400);
    });

    it("answers 404 for an unknown book", () => {
      extend(999999).its("status").should("eq", 404);
    });

    it("starts counting again after a return and a new rental", () => {
      extend(books.deltaBook).its("status").should("eq", 200);
      giveBack(books.deltaBook, users.Scndelta).its("status").should("eq", 200);
      rent(books.deltaBook, users.Scndelta).its("status").should("eq", 200);

      cy.task("verifyBook", books.deltaBook).then((book: any) => {
        expect(book.renewalCount).to.eq(0);
      });
      extend(books.deltaBook).its("body.renewalCount").should("eq", 1);
    });
  });
});
