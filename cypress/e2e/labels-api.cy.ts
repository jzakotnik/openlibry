/// <reference types="cypress" />

/**
 * Label System — API Tests
 *
 * Tests the REST API endpoints directly via cy.request().
 * No browser UI needed. Verifies backend correctness.
 */

describe("Label API", () => {
  const API = "http://localhost:3000/api/labels";
  const TEMPLATE_FILE =
    "database/custom/labels/templates/cypress-test-vorlage.json";

  before(() => {
    cy.resetDatabase();
  });

  after(() => {
    // Remove any test-created template file
    cy.task("deleteFile", TEMPLATE_FILE);
    cy.cleanupDatabase();
  });
  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
  });

  // ─── Sheet Config Endpoints ────────────────────────────────────────

  describe("GET /api/labels/sheets", () => {
    it("should list all sheet configs", () => {
      cy.request("GET", `${API}/sheets`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");
        expect(response.body.length).to.be.greaterThan(0);

        // Every entry must have the required fields
        response.body.forEach((sheet: any) => {
          expect(sheet).to.have.property("id");
          expect(sheet).to.have.property("name");
          expect(sheet.label).to.have.property("width");
          expect(sheet.label).to.have.property("height");
          expect(sheet.grid).to.have.property("columns");
          expect(sheet.grid).to.have.property("rows");
          expect(sheet).to.have.property("labelsPerSheet");
        });
      });
    });

    it("should return a single sheet by ID", () => {
      cy.request("GET", `${API}/sheets?id=zweckform-3474`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.id).to.eq("zweckform-3474");
        expect(response.body.label.width).to.eq(70);
        expect(response.body.label.height).to.eq(37);
        expect(response.body.labelsPerSheet).to.eq(24);
      });
    });

    it("should return 404 for nonexistent sheet", () => {
      cy.request({
        method: "GET",
        url: `${API}/sheets?id=does-not-exist`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property("error");
      });
    });
  });

  // ─── Template Endpoints ────────────────────────────────────────────

  describe("GET /api/labels/templates", () => {
    it("should list all templates including the default", () => {
      cy.request("GET", `${API}/templates`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");

        const ids = response.body.map((t: any) => t.id);
        expect(ids).to.include("default");
      });
    });
  });

  describe("POST /api/labels/templates", () => {
    it("should save a new template", () => {
      cy.fixture("label-test-template.json").then((template) => {
        cy.request("POST", `${API}/templates`, template).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.success).to.eq(true);
        });

        // Verify it's now in the list
        cy.request("GET", `${API}/templates`).then((response) => {
          const ids = response.body.map((t: any) => t.id);
          expect(ids).to.include("cypress-test-vorlage");
        });
      });
    });

    it("should reject a template with missing fields", () => {
      cy.request({
        method: "POST",
        url: `${API}/templates`,
        body: { id: "bad", name: "Bad" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property("error");
      });
    });

    it("should reject a template with invalid content type", () => {
      cy.request({
        method: "POST",
        url: `${API}/templates`,
        body: {
          id: "bad2",
          name: "Bad2",
          sheetConfigId: "zweckform-3474",
          spineWidthPercent: 25,
          padding: 2,
          fields: {
            spine: { content: "INVALID", fontSizeMax: 10, align: "center" },
            horizontal1: { content: "title", fontSizeMax: 10, align: "left" },
            horizontal2: { content: "title", fontSizeMax: 10, align: "left" },
            horizontal3: { content: "title", fontSizeMax: 10, align: "left" },
          },
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include("Invalid content");
      });
    });
  });

  // ─── PDF Generation Endpoint ───────────────────────────────────────

  describe("POST /api/labels/generate", () => {
    it("should generate a PDF with explicit books (full sheet)", () => {
      cy.fixture("label-test-books.json").then((books) => {
        cy.request({
          method: "POST",
          url: `${API}/generate`,
          body: {
            sheetConfigId: "zweckform-3474",
            templateId: "default",
            books,
          },
          encoding: "binary",
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.headers["content-type"]).to.include(
            "application/pdf",
          );
          expect(response.body.substring(0, 5)).to.eq("%PDF-");
        });
      });
    });

    it("should generate a PDF with bookFilter: latest", () => {
      cy.request({
        method: "POST",
        url: `${API}/generate`,
        body: {
          sheetConfigId: "zweckform-3474",
          templateId: "default",
          bookFilter: { type: "latest", count: 3 },
        },
        encoding: "binary",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.substring(0, 5)).to.eq("%PDF-");
      });
    });

    it("should generate a PDF with bookFilter: all", () => {
      cy.request({
        method: "POST",
        url: `${API}/generate`,
        body: {
          sheetConfigId: "zweckform-3474",
          templateId: "default",
          bookFilter: { type: "all" },
        },
        encoding: "binary",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.substring(0, 5)).to.eq("%PDF-");
      });
    });

    it("should generate a PDF with bookFilter: IDs", () => {
      // Dynamisch echte IDs aus der Test-DB holen
      cy.request("GET", "http://localhost:3000/api/book").then(
        (booksResponse) => {
          const ids = booksResponse.body.slice(0, 2).map((b: any) => b.id);
          expect(ids).to.have.length.greaterThan(0);

          cy.request({
            method: "POST",
            url: `${API}/generate`,
            body: {
              sheetConfigId: "zweckform-3474",
              templateId: "default",
              bookFilter: { type: "ids", ids },
            },
            encoding: "binary",
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.substring(0, 5)).to.eq("%PDF-");
          });
        },
      );
    });

    it("should generate a PDF with startPosition", () => {
      cy.fixture("label-test-books.json").then((books) => {
        cy.request({
          method: "POST",
          url: `${API}/generate`,
          body: {
            sheetConfigId: "zweckform-3474",
            templateId: "default",
            startPosition: { row: 5, col: 2 },
            books,
          },
          encoding: "binary",
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.substring(0, 5)).to.eq("%PDF-");
        });
      });
    });

    it("should generate a PDF with explicit positions", () => {
      cy.fixture("label-test-books.json").then((books) => {
        cy.request({
          method: "POST",
          url: `${API}/generate`,
          body: {
            sheetConfigId: "zweckform-3474",
            templateId: "default",
            positions: [
              { row: 2, col: 1 },
              { row: 5, col: 3 },
              { row: 8, col: 2 },
            ],
            books: books.slice(0, 3),
          },
          encoding: "binary",
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.substring(0, 5)).to.eq("%PDF-");
        });
      });
    });

    it("should generate a PDF with inline template (editor preview)", () => {
      cy.fixture("label-test-books.json").then((books) => {
        cy.request({
          method: "POST",
          url: `${API}/generate`,
          body: {
            sheetConfigId: "zweckform-3474",
            template: {
              id: "inline-preview",
              name: "Inline Preview",
              sheetConfigId: "zweckform-3474",
              spineWidthPercent: 30,
              padding: 2,
              fields: {
                spine: { content: "id", fontSizeMax: 14, align: "center" },
                horizontal1: {
                  content: "title",
                  fontSizeMax: 12,
                  align: "left",
                },
                horizontal2: {
                  content: "topics",
                  fontSizeMax: 9,
                  align: "left",
                },
                horizontal3: {
                  content: "school",
                  fontSizeMax: 8,
                  align: "left",
                },
              },
            },
            books: books.slice(0, 1),
          },
          encoding: "binary",
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.headers["content-type"]).to.include(
            "application/pdf",
          );
          expect(response.headers["content-disposition"]).to.include("inline");
        });
      });
    });

    // ── Error cases ──────────────────────────────────────────────────

    it("should reject out-of-bounds positions", () => {
      cy.fixture("label-test-books.json").then((books) => {
        cy.request({
          method: "POST",
          url: `${API}/generate`,
          body: {
            sheetConfigId: "zweckform-3474",
            templateId: "default",
            positions: [{ row: 99, col: 1 }],
            books: books.slice(0, 1),
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.error).to.include("out of bounds");
        });
      });
    });

    it("should reject request with missing books and filter", () => {
      cy.request({
        method: "POST",
        url: `${API}/generate`,
        body: {
          sheetConfigId: "zweckform-3474",
          templateId: "default",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it("should reject nonexistent sheet", () => {
      cy.request({
        method: "POST",
        url: `${API}/generate`,
        body: {
          sheetConfigId: "nonexistent",
          templateId: "default",
          bookFilter: { type: "all" },
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("should reject nonexistent template", () => {
      cy.request({
        method: "POST",
        url: `${API}/generate`,
        body: {
          sheetConfigId: "zweckform-3474",
          templateId: "nonexistent",
          bookFilter: { type: "all" },
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("should reject request with no template at all", () => {
      cy.request({
        method: "POST",
        url: `${API}/generate`,
        body: {
          sheetConfigId: "zweckform-3474",
          bookFilter: { type: "all" },
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include("templateId");
      });
    });
  });
});
