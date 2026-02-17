/// <reference types="cypress" />

describe("Excel Export", () => {
  before(() => {
    cy.resetDatabase();
  });

  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
  });

  after(() => {
    cy.task("clearDownloads", "cypress/downloads");
  });

  const getExpectedFilename = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `Backup_OpenLibry_${yyyy}_${mm}_${dd}.xlsx`;
  };

  it("should export Excel file and validate its content", () => {
    cy.visit("http://localhost:3000/admin");
    cy.url().should("include", "/admin");

    cy.intercept("GET", "/api/excel").as("excelDownload");
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
      expect(columns.length).to.eq(29);
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
        cy.log(`Books exported: ${result.booksRowCount - 1}`);
        cy.log(`Users exported: ${result.usersRowCount - 1}`);
      },
    );
  });
});
