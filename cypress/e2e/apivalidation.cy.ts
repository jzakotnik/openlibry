/// <reference types="cypress" />

describe("API input validation", () => {
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

  const expect400 = (method: string, path: string, body?: Cypress.RequestBody) =>
    cy
      .request({
        method,
        url: `${API}${path}`,
        body,
        failOnStatusCode: false,
      })
      .its("status")
      .should("eq", 400);

  describe("malformed IDs are rejected with 400", () => {
    ["abc", "12abc", "0", "-1", "1.5"].forEach((id) => {
      it(`GET /user/${id}`, () => expect400("GET", `/user/${id}`));
      it(`GET /book/${id}`, () => expect400("GET", `/book/${id}`));
    });

    it("POST /book/abc/extend", () => expect400("POST", "/book/abc/extend"));
    it("POST /book/1/user/abc", () => expect400("POST", "/book/1/user/abc"));
    it("DELETE /book/abc/user/1", () => expect400("DELETE", "/book/abc/user/1"));
    it("GET /antolin/abc", () => expect400("GET", "/antolin/abc"));
    it("GET /public/books/12abc", () => expect400("GET", "/public/books/12abc"));
    it("GET /report/userlabels?id=abc", () =>
      expect400("GET", "/report/userlabels?id=abc"));
    it("GET /report/userlabels?start=x&end=2", () =>
      expect400("GET", "/report/userlabels?start=x&end=2"));
  });

  describe("unknown but well-formed IDs are 404, not a hang", () => {
    it("GET /antolin/999999", () => {
      cy.request({ url: `${API}/antolin/999999`, failOnStatusCode: false })
        .its("status")
        .should("eq", 404);
    });
  });

  describe("batch endpoints validate their bodies", () => {
    it("POST /batch/grade rejects string IDs", () =>
      expect400("POST", "/batch/grade", [{ id: "1", grade: "3" }]));
    it("POST /batch/grade rejects a non-array body", () =>
      expect400("POST", "/batch/grade", { id: 1, grade: "3" }));
    it("DELETE /batch/user rejects string IDs", () =>
      expect400("DELETE", "/batch/user", ["1"]));
    it("DELETE /batch/user rejects a non-array body", () =>
      expect400("DELETE", "/batch/user", { id: 1 }));
    it("an empty selection is still a successful no-op", () => {
      cy.request("POST", `${API}/batch/grade`, []).its("status").should("eq", 200);
      cy.request("DELETE", `${API}/batch/user`, [])
        .its("status")
        .should("eq", 200);
    });
  });
});
