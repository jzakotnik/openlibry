/// <reference types="cypress" />

// Single-user API: POST /api/user, GET/PUT/DELETE /api/user/:id. Includes what
// happens to a user's loans when the user is deactivated or deleted.
describe("User API", () => {
  const API = "/api";

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

  const createUser = (body: Cypress.RequestBody) =>
    cy.request({
      method: "POST",
      url: `${API}/user`,
      body,
      failOnStatusCode: false,
    });

  const updateUser = (id: number, body: Cypress.RequestBody) =>
    cy.request({
      method: "PUT",
      url: `${API}/user/${id}`,
      body,
      failOnStatusCode: false,
    });

  const removeUser = (id: number) =>
    cy.request({
      method: "DELETE",
      url: `${API}/user/${id}`,
      failOnStatusCode: false,
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

  describe("creating", () => {
    it("creates a user with an automatic id", () => {
      createUser({
        firstName: "Neu",
        lastName: "Angelegt",
        schoolGrade: "1a",
        active: true,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.id).to.be.a("number");

        cy.task("verifyUser", res.body.id).then((user: any) => {
          expect(user.firstName).to.eq("Neu");
          expect(user.lastName).to.eq("Angelegt");
          expect(user.schoolGrade).to.eq("1a");
          expect(user.active).to.eq(true);
        });
      });
    });

    it("creates a user with a chosen id", () => {
      createUser({ id: 777, firstName: "Fest", lastName: "Vergeben" })
        .its("body.id")
        .should("eq", 777);
      cy.task("verifyUser", 777).should("not.be.null");
    });

    it("rejects an id that is already taken and keeps the existing user", () => {
      createUser({
        id: users.Scnalpha,
        firstName: "Doppelt",
        lastName: "Doppelt",
      })
        .its("status")
        .should("eq", 400);

      cy.task("verifyUser", users.Scnalpha).then((user: any) => {
        expect(user.lastName).to.eq("Scnalpha");
      });
    });

    [0, -5, 1.5].forEach((id) => {
      it(`rejects the invalid id ${id}`, () => {
        createUser({ id, firstName: "Ungültig", lastName: "Id" })
          .its("status")
          .should("eq", 400);
      });
    });
  });

  describe("reading", () => {
    it("lists all users", () => {
      cy.request(`${API}/user`).then((res) => {
        const names = res.body.map((u: any) => u.lastName);
        expect(names).to.include.members(["Scnalpha", "Scnbeta", "Scngamma"]);
      });
    });

    it("returns one user by id", () => {
      cy.request(`${API}/user/${users.Scnalpha}`).then((res) => {
        expect(res.body.lastName).to.eq("Scnalpha");
        expect(res.body.schoolGrade).to.eq("3a");
      });
    });

    it("answers 404 for an unknown user", () => {
      cy.request({
        url: `${API}/user/999999`,
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 404);
    });
  });

  describe("updating", () => {
    it("stores the changed fields and nothing else", () => {
      updateUser(users.Scnalpha, {
        firstName: "Anja",
        lastName: "Neuname",
        schoolGrade: "5c",
        schoolTeacherName: "Frau Lehrerin",
        eMail: "anja@example.com",
      })
        .its("status")
        .should("eq", 200);

      cy.task("verifyUser", users.Scnalpha).then((user: any) => {
        expect(user.firstName).to.eq("Anja");
        expect(user.lastName).to.eq("Neuname");
        expect(user.schoolGrade).to.eq("5c");
        expect(user.schoolTeacherName).to.eq("Frau Lehrerin");
        expect(user.eMail).to.eq("anja@example.com");
        expect(user.active).to.eq(true);
      });

      // another user is not affected
      cy.task("verifyUser", users.Scnbeta).then((user: any) => {
        expect(user.lastName).to.eq("Scnbeta");
        expect(user.schoolGrade).to.eq("3b");
      });
    });

    it("keeps the loans of the user", () => {
      updateUser(users.Scnalpha, { lastName: "Neuname" })
        .its("status")
        .should("eq", 200);

      [books.alphaBook1, books.alphaBook2].forEach((id) => {
        cy.task("verifyBook", id).then((book: any) => {
          expect(book.rentalStatus).to.eq("rented");
          expect(book.userId).to.eq(users.Scnalpha);
        });
      });
    });

    it("fails for an unknown user", () => {
      updateUser(999999, { lastName: "Niemand" })
        .its("status")
        .should("eq", 400);
    });
  });

  describe("deactivating", () => {
    it("keeps the loans and still allows returning them", () => {
      updateUser(users.Scnalpha, { active: false })
        .its("status")
        .should("eq", 200);

      cy.task("verifyBook", books.alphaBook1).then((book: any) => {
        expect(book.rentalStatus).to.eq("rented");
        expect(book.userId).to.eq(users.Scnalpha);
      });

      giveBack(books.alphaBook1, users.Scnalpha)
        .its("status")
        .should("eq", 200);
      cy.task("verifyBook", books.alphaBook1).then((book: any) => {
        expect(book.rentalStatus).to.eq("available");
      });
    });

    it("blocks new rentals until the user is active again", () => {
      updateUser(users.Scngamma, { active: false })
        .its("status")
        .should("eq", 200);
      rent(books.freeBook, users.Scngamma).its("status").should("eq", 403);

      updateUser(users.Scngamma, { active: true })
        .its("status")
        .should("eq", 200);
      rent(books.freeBook, users.Scngamma).its("status").should("eq", 200);
    });
  });

  describe("deleting", () => {
    it("deletes the user and marks their rented books as lost", () => {
      removeUser(users.Scnalpha).its("status").should("eq", 200);

      cy.task("verifyUser", users.Scnalpha).should("be.null");
      [books.alphaBook1, books.alphaBook2].forEach((id) => {
        cy.task("verifyBook", id).then((book: any) => {
          expect(book, `book ${id} must survive`).to.not.be.null;
          expect(book.rentalStatus).to.eq("lost");
          expect(book.userId).to.be.null;
          expect(book.dueDate).to.be.null;
        });
      });
    });

    it("does not touch the loans of other users", () => {
      removeUser(users.Scnalpha).its("status").should("eq", 200);

      cy.task("verifyBook", books.deltaBook).then((book: any) => {
        expect(book.rentalStatus).to.eq("rented");
        expect(book.userId).to.eq(users.Scndelta);
      });
    });

    it("deletes a user without books", () => {
      removeUser(users.Scngamma).its("status").should("eq", 200);
      cy.task("verifyUser", users.Scngamma).should("be.null");
    });

    it("fails for an unknown user and changes nothing", () => {
      cy.task("countBooks").then((before) => {
        removeUser(999999).its("status").should("eq", 400);
        cy.task("countBooks").should("eq", before);
      });
      cy.task("verifyUser", users.Scnalpha).should("not.be.null");
    });
  });
});
