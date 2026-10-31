/// <reference types="cypress" />

// POST /api/batch/grade — the endpoint behind "increase school grade" on the
// user list. The client computes the new grade; the server only stores it, so
// these tests cover what gets written and that nothing else changes.
describe("Batch grade update API", () => {
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

  const updateGrades = (body: Cypress.RequestBody) =>
    cy.request({
      method: "POST",
      url: `${API}/batch/grade`,
      body,
      failOnStatusCode: false,
    });

  const expectGrade = (id: number, grade: string) =>
    cy.task("verifyUser", id).then((user: any) => {
      expect(user.schoolGrade, `grade of user ${id}`).to.eq(grade);
    });

  it("sets the new grade for every selected user", () => {
    updateGrades([
      { id: users.Scnalpha, grade: "4a" },
      { id: users.Scnbeta, grade: "4b" },
    ]).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.length(2);
    });

    expectGrade(users.Scnalpha, "4a");
    expectGrade(users.Scnbeta, "4b");
  });

  it("leaves the grade of users that were not selected alone", () => {
    updateGrades([{ id: users.Scnalpha, grade: "4a" }])
      .its("status")
      .should("eq", 200);

    expectGrade(users.Scnbeta, "3b");
    expectGrade(users.Scngamma, "4a");
    expectGrade(users.Scninactive, "2c");
  });

  it("changes only the grade, not name, status or loans", () => {
    updateGrades([{ id: users.Scnalpha, grade: "4a" }])
      .its("status")
      .should("eq", 200);

    cy.task("verifyUser", users.Scnalpha).then((user: any) => {
      expect(user.firstName).to.eq("Anna");
      expect(user.lastName).to.eq("Scnalpha");
      expect(user.active).to.eq(true);
    });
    cy.task("verifyBook", books.alphaBook1).then((book: any) => {
      expect(book.rentalStatus).to.eq("rented");
      expect(book.userId).to.eq(users.Scnalpha);
    });
  });

  it("promotes inactive users and keeps them inactive", () => {
    updateGrades([{ id: users.Scninactive, grade: "3c" }])
      .its("status")
      .should("eq", 200);

    cy.task("verifyUser", users.Scninactive).then((user: any) => {
      expect(user.schoolGrade).to.eq("3c");
      expect(user.active).to.eq(false);
    });
  });

  it("stores non-numeric grades as given", () => {
    updateGrades([{ id: users.Scnalpha, grade: "Eichhörnchen" }])
      .its("status")
      .should("eq", 200);
    expectGrade(users.Scnalpha, "Eichhörnchen");
  });

  it("ignores extra properties in the request", () => {
    updateGrades([
      { id: users.Scnalpha, grade: "5a", active: false, lastName: "Hacked" },
    ])
      .its("status")
      .should("eq", 200);

    cy.task("verifyUser", users.Scnalpha).then((user: any) => {
      expect(user.schoolGrade).to.eq("5a");
      expect(user.active).to.eq(true);
      expect(user.lastName).to.eq("Scnalpha");
    });
  });

  it("changes no grade when one of the ids does not exist", () => {
    updateGrades([
      { id: users.Scnalpha, grade: "9z" },
      { id: 999999, grade: "1a" },
    ])
      .its("status")
      .should("eq", 400);

    expectGrade(users.Scnalpha, "3a");
  });

  it("rejects a grade longer than 50 characters", () => {
    updateGrades([{ id: users.Scnalpha, grade: "x".repeat(51) }])
      .its("status")
      .should("eq", 400);
    expectGrade(users.Scnalpha, "3a");
  });

  it("rejects an unauthenticated request and changes nothing", () => {
    cy.clearCookies();
    cy.request({
      method: "POST",
      url: `${API}/batch/grade`,
      body: [{ id: users.Scnalpha, grade: "9z" }],
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([302, 307, 401, 403]);
    });

    expectGrade(users.Scnalpha, "3a");
  });
});
