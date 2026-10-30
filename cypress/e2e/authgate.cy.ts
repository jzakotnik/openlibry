/// <reference types="cypress" />

// Every page and API route except the public ones must require a login. With
// AUTH_ENABLED=true an anonymous request is redirected to the sign-in page
// (or refused); it must never reach the handler. Public by design: the
// catalog, /api/public/*, /api/images*, /api/version, /api/auth/* and the
// login pages (see lib/rootRoute.ts and proxy.ts).
describe("Authentication gate", () => {
  let users: Record<string, number>;
  let books: Record<string, number>;

  beforeEach(() => {
    cy.resetAndSeed();
    cy.task("seedScenario", "batch").then((ids: any) => {
      users = ids.userIdByLastName;
      books = ids.bookIdByLabel;
    });
    // anonymous: no session in these tests
    cy.clearCookies();
  });

  after(() => {
    cy.clearDatabase();
  });

  const anonymous = (
    method: string,
    path: string,
    body?: Cypress.RequestBody,
  ) =>
    cy.request({
      method,
      url: path,
      body,
      followRedirect: false,
      failOnStatusCode: false,
    });

  const expectBlocked = (res: Cypress.Response<any>) => {
    expect(res.status, "status").to.be.oneOf([302, 307, 401, 403]);
    if (res.status === 302 || res.status === 307) {
      expect(String(res.redirectedToUrl ?? res.headers.location)).to.match(
        /\/(api\/auth\/signin|auth\/login)/,
      );
    }
  };

  const expectNotBlocked = (res: Cypress.Response<any>) => {
    expect(res.status, "status").to.not.be.oneOf([302, 307, 401, 403]);
  };

  describe("pages", () => {
    [
      "/manage",
      "/user",
      "/user/1",
      "/book",
      "/book/1",
      "/book/new",
      "/book/batchscan",
      "/rental",
      "/scan",
      "/reports",
      "/reports/audit",
      "/reports/books",
      "/reports/rentals",
      "/reports/userhistory",
      "/reports/users",
      "/reports/xlsimport",
      "/reports/labels/editor",
      "/reports/labels/print",
      "/admin",
      "/admin/settings",
      "/admin/health",
      "/openbiblio",
    ].forEach((path) => {
      it(`requires a login: ${path}`, () => {
        anonymous("GET", path).then(expectBlocked);
      });
    });
  });

  describe("API reads", () => {
    [
      "/api/user",
      "/api/user/1",
      "/api/book",
      "/api/book/1",
      "/api/book/cover/1",
      "/api/book/FillBookByIsbn?isbn=9783551551672",
      "/api/rental",
      "/api/audit",
      "/api/excel",
      "/api/db/download",
      "/api/health",
      "/api/antolin/1",
      "/api/login",
      "/api/login/1",
      "/api/labels/sheets",
      "/api/labels/templates",
      "/api/report/reminder",
      "/api/report/pdfcatalog",
      "/api/report/userlabels?id=1",
    ].forEach((path) => {
      it(`requires a login: GET ${path}`, () => {
        anonymous("GET", path).then(expectBlocked);
      });
    });
  });

  describe("API writes", () => {
    it("refuses to create, change or delete users", () => {
      anonymous("POST", "/api/user", {
        firstName: "Anonym",
        lastName: "Angelegt",
      }).then(expectBlocked);
      anonymous("PUT", `/api/user/${users.Scnalpha}`, {
        lastName: "Gehackt",
      }).then(expectBlocked);
      anonymous("DELETE", `/api/user/${users.Scnalpha}`).then(expectBlocked);

      cy.task("verifyUser", users.Scnalpha).then((user: any) => {
        expect(user.lastName).to.eq("Scnalpha");
      });
    });

    it("refuses to create, change or delete books", () => {
      cy.task("countBooks").then((before) => {
        anonymous("POST", "/api/book", {
          title: "Anonym",
          author: "A",
          renewalCount: 0,
        }).then(expectBlocked);
        anonymous("PUT", `/api/book/${books.freeBook}`, {
          title: "Gehackt",
          author: "A",
          renewalCount: 0,
        }).then(expectBlocked);
        anonymous("DELETE", `/api/book/${books.freeBook}`).then(expectBlocked);

        cy.task("countBooks").should("eq", before);
      });
      cy.task("verifyBook", books.freeBook).then((book: any) => {
        expect(book.title).to.eq("Scn Free");
      });
    });

    it("refuses to rent, return and extend", () => {
      anonymous(
        "POST",
        `/api/book/${books.freeBook}/user/${users.Scnalpha}`,
      ).then(expectBlocked);
      anonymous(
        "DELETE",
        `/api/book/${books.alphaBook1}/user/${users.Scnalpha}`,
      ).then(expectBlocked);
      anonymous("POST", `/api/book/${books.deltaBook}/extend`).then(
        expectBlocked,
      );

      cy.task("verifyBook", books.freeBook).then((book: any) => {
        expect(book.rentalStatus).to.eq("available");
      });
      cy.task("verifyBook", books.alphaBook1).then((book: any) => {
        expect(book.rentalStatus).to.eq("rented");
      });
      cy.task("verifyBook", books.deltaBook).then((book: any) => {
        expect(book.renewalCount).to.eq(0);
      });
    });

    it("refuses admin account management", () => {
      anonymous("POST", "/api/login/create", {
        username: "anonymous_admin",
        password: "Password1234!",
        email: "anon@example.com",
        role: "admin",
      }).then(expectBlocked);
      anonymous("DELETE", "/api/login/1").then(expectBlocked);
    });

    it("refuses label template and import endpoints", () => {
      anonymous("POST", "/api/labels/templates", {}).then(expectBlocked);
      anonymous("POST", "/api/labels/generate", {}).then(expectBlocked);
      anonymous("POST", "/api/openbiblioimport/migrateBooks", {}).then(
        expectBlocked,
      );
      anonymous("POST", "/api/openbiblioimport/migrateUsers", {}).then(
        expectBlocked,
      );
    });
  });

  describe("public by design", () => {
    [
      "/catalog",
      "/auth/login",
      "/api/version",
      "/api/public/books",
      "/api/images",
      "/api/auth/csrf",
      "/api/auth/providers",
    ].forEach((path) => {
      it(`stays reachable without a login: ${path}`, () => {
        anonymous("GET", path).then(expectNotBlocked);
      });
    });
  });
});
