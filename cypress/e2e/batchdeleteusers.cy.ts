/// <reference types="cypress" />

// DELETE /api/batch/user — the endpoint behind "delete selected users" on the
// user list. Deleting users must never delete books: a book that was still
// rented out becomes "lost" and is detached from the deleted borrower.
describe("Batch user deletion API", () => {
  const API = "http://localhost:3000/api";

  let users: Record<string, number>;
  let books: Record<string, number>;

  // Destructive endpoint, so every test starts from a fresh seed.
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

  const batchDelete = (ids: number[]) =>
    cy.request({
      method: "DELETE",
      url: `${API}/batch/user`,
      body: ids,
      failOnStatusCode: false,
    });

  const expectUserGone = (id: number) =>
    cy.task("verifyUser", id).then((user) => {
      expect(user, `user ${id}`).to.be.null;
    });

  const expectUserExists = (id: number, lastName: string) =>
    cy.task("verifyUser", id).then((user: any) => {
      expect(user, `user ${id}`).to.not.be.null;
      expect(user.lastName).to.eq(lastName);
    });

  it("deletes all selected users in one call", () => {
    batchDelete([users.Scnalpha, users.Scnbeta, users.Scngamma]).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.length(3);
    });

    expectUserGone(users.Scnalpha);
    expectUserGone(users.Scnbeta);
    expectUserGone(users.Scngamma);
  });

  it("leaves users that were not selected untouched", () => {
    batchDelete([users.Scnalpha, users.Scnbeta])
      .its("status")
      .should("eq", 200);

    expectUserExists(users.Scngamma, "Scngamma");
    expectUserExists(users.Scndelta, "Scndelta");
    expectUserExists(users.Scninactive, "Scninactive");
  });

  it("marks books rented by deleted users as lost and detaches them", () => {
    batchDelete([users.Scnalpha, users.Scnbeta])
      .its("status")
      .should("eq", 200);

    [books.alphaBook1, books.alphaBook2, books.betaBook].forEach((id) => {
      cy.task("verifyBook", id).then((book: any) => {
        expect(book, `book ${id} must survive`).to.not.be.null;
        expect(book.rentalStatus).to.eq("lost");
        expect(book.userId).to.be.null;
        expect(book.dueDate).to.be.null;
      });
    });
  });

  it("does not change the number of books", () => {
    cy.task("countBooks").then((before) => {
      batchDelete([users.Scnalpha, users.Scnbeta, users.Scndelta])
        .its("status")
        .should("eq", 200);
      cy.task("countBooks").should("eq", before);
    });
  });

  it("keeps the loans of other users and all unrented books as they were", () => {
    cy.task("verifyBook", books.deltaBook).then((deltaBefore: any) => {
      batchDelete([users.Scnalpha, users.Scnbeta])
        .its("status")
        .should("eq", 200);

      cy.task("verifyBook", books.deltaBook).then((delta: any) => {
        expect(delta.rentalStatus).to.eq("rented");
        expect(delta.userId).to.eq(users.Scndelta);
        expect(new Date(delta.dueDate).getTime()).to.eq(
          new Date(deltaBefore.dueDate).getTime(),
        );
      });
    });

    cy.task("verifyBook", books.freeBook).then((book: any) => {
      expect(book.rentalStatus).to.eq("available");
      expect(book.userId).to.be.null;
    });
    cy.task("verifyBook", books.lostBook).then((book: any) => {
      expect(book.rentalStatus).to.eq("lost");
    });
  });

  it("deletes a user who has no books", () => {
    batchDelete([users.Scngamma]).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.length(1);
    });

    expectUserGone(users.Scngamma);
    expectUserExists(users.Scnalpha, "Scnalpha");
  });

  it("deletes inactive users as well", () => {
    batchDelete([users.Scninactive]).its("status").should("eq", 200);
    expectUserGone(users.Scninactive);
  });

  it("deletes nothing when one of the ids does not exist", () => {
    batchDelete([users.Scnalpha, 999999]).its("status").should("eq", 400);

    expectUserExists(users.Scnalpha, "Scnalpha");
    cy.task("verifyBook", books.alphaBook1).then((book: any) => {
      expect(book.rentalStatus).to.eq("rented");
      expect(book.userId).to.eq(users.Scnalpha);
    });
  });

  it("rejects an unauthenticated request and deletes nothing", () => {
    cy.clearCookies();
    cy.request({
      method: "DELETE",
      url: `${API}/batch/user`,
      body: [users.Scnalpha],
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([302, 307, 401, 403]);
    });

    expectUserExists(users.Scnalpha, "Scnalpha");
  });
});
