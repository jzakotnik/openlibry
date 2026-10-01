/// <reference types="cypress" />

describe("API write allow-lists and error messages", () => {
  const API = "http://localhost:3000/api";

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

  it("ignores unknown fields and nested relation writes when creating a user", () => {
    cy.request("POST", `${API}/book`, {
      id: 987001,
      title: "Allowlist Testbuch",
      author: "Tester",
      renewalCount: 0,
      rentalStatus: "available",
    });

    cy.request("POST", `${API}/user`, {
      id: 987002,
      firstName: "Allow",
      lastName: "List",
      active: true,
      unknownField: "x",
      books: { connect: [{ id: 987001 }] },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.id).to.eq(987002);
    });

    // the nested "connect" must not have handed the book to the new user
    cy.request(`${API}/book/987001`).its("body.userId").should("eq", null);
  });

  it("does not let a book update change its id or assign it to a user", () => {
    cy.request("PUT", `${API}/book/987001`, {
      title: "Allowlist Testbuch 2",
      author: "Tester",
      renewalCount: 0,
      rentalStatus: "available",
      id: 987099,
      userId: 987002,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.id).to.eq(987001);
      expect(res.body.userId).to.eq(null);
    });
  });

  it("keeps the deliberate duplicate-ID message", () => {
    cy.request({
      method: "POST",
      url: `${API}/user`,
      body: { id: 987002, firstName: "A", lastName: "B", active: true },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.result).to.contain("987002");
    });
  });

  it("does not leak Prisma internals on invalid data", () => {
    cy.request({
      method: "PUT",
      url: `${API}/book/987001`,
      body: { title: 123, renewalCount: "x" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      const text = JSON.stringify(res.body);
      expect(text).not.to.contain("Prisma");
      expect(text).not.to.contain("invocation");
      expect(text).not.to.contain("renewalCount");
    });
  });
});
