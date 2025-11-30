/// <reference types="cypress" />

describe("Excel Export", () => {
  before(() => {
    cy.resetDatabase();
  });
  beforeEach(() => {
    cy.login();
  });

  after(() => {
    // Clean up downloaded Excel files after tests
    cy.task("clearDownloads", "cypress/downloads");
  });

  it("should export Excel file and validate its content", () => {
    // Navigate to the reports page
    cy.visit("http://localhost:3000/reports");

    // Verify we're on the reports page
    cy.url().should("include", "/reports");

    // Find the Excel Export card and click the download button
    // Use a more specific approach: find the card by title, then click its button
    cy.contains("Excel Export")
      .parent()
      .parent()
      .within(() => {
        cy.contains("Download Excel").click();
      });

    // Wait for the download to complete
    cy.wait(3000);

    // Verify the file was downloaded
    const downloadsFolder = "cypress/downloads";
    cy.readFile(`${downloadsFolder}/openlibry_export.xlsx`, null, {
      timeout: 15000,
    }).should("exist");

    // Validate the Excel file structure using custom task
    cy.task(
      "validateExcelStructure",
      `${downloadsFolder}/openlibry_export.xlsx`
    ).then((result: any) => {
      // Should have exactly 2 worksheets
      expect(result.worksheetCount).to.eq(2);

      // Should have Bücherliste and Userliste worksheets
      expect(result.worksheetNames).to.include("Bücherliste");
      expect(result.worksheetNames).to.include("Userliste");
    });

    // Validate book columns
    cy.task(
      "validateBookColumns",
      `${downloadsFolder}/openlibry_export.xlsx`
    ).then((columns: any) => {
      // Verify essential book columns exist (German names)
      expect(columns).to.include("Mediennummer");
      expect(columns).to.include("Titel");
      expect(columns).to.include("Autor");
      expect(columns).to.include("Ausleihstatus");
      expect(columns).to.include("ISBN");
      expect(columns).to.include("Erzeugt am");
      expect(columns).to.include("Update am");
      expect(columns).to.include("Ausgeliehen am");
      expect(columns).to.include("Rückgabe am");

      // Should have 29 columns total
      expect(columns.length).to.eq(29);
    });

    // Validate user columns
    cy.task(
      "validateUserColumns",
      `${downloadsFolder}/openlibry_export.xlsx`
    ).then((columns: any) => {
      // Verify essential user columns exist (German names)
      expect(columns).to.include("Nummer");
      expect(columns).to.include("Vorname");
      expect(columns).to.include("Nachname");
      expect(columns).to.include("Klasse");
      expect(columns).to.include("Freigeschaltet");
      expect(columns).to.include("Erzeugt am");
      expect(columns).to.include("Update am");
      expect(columns).to.include("Lehrkraft");
      expect(columns).to.include("eMail");

      // Should have 9 columns total
      expect(columns.length).to.eq(9);
    });

    // Validate that data exists in both worksheets
    cy.task(
      "validateExcelData",
      `${downloadsFolder}/openlibry_export.xlsx`
    ).then((result: any) => {
      // Both worksheets should have at least header row
      expect(result.booksRowCount).to.be.at.least(1);
      expect(result.usersRowCount).to.be.at.least(1);

      cy.log(`Books exported: ${result.booksRowCount - 1}`);
      cy.log(`Users exported: ${result.usersRowCount - 1}`);
    });
  });

  it("should download Excel from TopBar backup button", () => {
    // Navigate to home page
    cy.visit("http://localhost:3000/");

    // Find and click the backup button in TopBar
    cy.get("[data-cy=topbar_backup_button]", { timeout: 10000 })
      .should("be.visible")
      .click();

    // Wait for the file to be downloaded
    cy.wait(3000);

    // Generate expected filename with today's date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const expectedFilename = `Backup_OpenLibry_${yyyy}_${mm}_${dd}.xlsx`;

    // Verify the file was downloaded
    const downloadsFolder = "cypress/downloads";
    cy.readFile(`${downloadsFolder}/${expectedFilename}`, null, {
      timeout: 15000,
    }).should("exist");

    cy.log(`Backup file downloaded: ${expectedFilename}`);
  });
});
