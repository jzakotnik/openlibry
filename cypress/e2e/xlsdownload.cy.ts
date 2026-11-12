/// <reference types="cypress" />

describe("Excel Export", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.task("clearDownloads", "cypress/downloads");
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
  });

  const getExpectedFilename = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `Backup_OpenLibry_${yyyy}_${mm}_${dd}.xlsx`;
  };

  it("should export Excel file and validate its content", () => {
    cy.visit("/admin");
    cy.url().should("include", "/admin");

    cy.intercept("GET", "/api/export*").as("excelDownload");
    cy.get("[data-cy=admin-excel-backup-button]").click();
    cy.wait("@excelDownload", { timeout: 15000 })
      .its("response.statusCode")
      .should("eq", 200);

    const expectedFilename = getExpectedFilename();
    const downloadsFolder = "cypress/downloads";

    cy.readFile(`${downloadsFolder}/${expectedFilename}`, null, {
      timeout: 15000,
    }).should("exist");

    cy.task(
      "validateExcelStructure",
      `${downloadsFolder}/${expectedFilename}`,
    ).then((result: any) => {
      expect(result.worksheetCount).to.eq(2);
      expect(result.worksheetNames).to.include("Bücherliste");
      expect(result.worksheetNames).to.include("Userliste");
    });

    cy.task(
      "validateBookColumns",
      `${downloadsFolder}/${expectedFilename}`,
    ).then((columns: any) => {
      expect(columns).to.include("Mediennummer");
      expect(columns).to.include("Titel");
      expect(columns).to.include("Autor");
      expect(columns).to.include("Ausleihstatus");
      expect(columns).to.include("ISBN");
      expect(columns).to.include("Erzeugt am");
      expect(columns).to.include("Update am");
      expect(columns).to.include("Ausgeliehen am");
      expect(columns).to.include("Rückgabe am");
      expect(columns.length).to.eq(30);
    });

    cy.task(
      "validateUserColumns",
      `${downloadsFolder}/${expectedFilename}`,
    ).then((columns: any) => {
      expect(columns).to.include("Nummer");
      expect(columns).to.include("Vorname");
      expect(columns).to.include("Nachname");
      expect(columns).to.include("Klasse");
      expect(columns).to.include("Freigeschaltet");
      expect(columns).to.include("Erzeugt am");
      expect(columns).to.include("Update am");
      expect(columns).to.include("Lehrkraft");
      expect(columns).to.include("eMail");
      expect(columns.length).to.eq(9);
    });

    cy.task("validateExcelData", `${downloadsFolder}/${expectedFilename}`).then(
      (result: any) => {
        expect(result.booksRowCount).to.be.at.least(1);
        expect(result.usersRowCount).to.be.at.least(1);
      },
    );
  });

  it("should export an ODS file (valid zip with ODS mimetype)", () => {
    cy.request({
      url: "/api/export?format=ods",
      encoding: "binary",
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.headers["content-type"]).to.eq(
        "application/vnd.oasis.opendocument.spreadsheet",
      );
      // ODS = zip whose first entry is the uncompressed "mimetype" file
      expect(res.body.slice(0, 2)).to.eq("PK");
      expect(res.body).to.include(
        "mimetypeapplication/vnd.oasis.opendocument.spreadsheet",
      );
    });
  });

  it("should reject unknown export formats", () => {
    cy.request({ url: "/api/export?format=foo", failOnStatusCode: false })
      .its("status")
      .should("eq", 400);
  });
});
