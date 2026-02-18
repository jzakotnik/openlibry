/// <reference types="cypress" />
describe("Batch scan book import", () => {
  before(() => {
    cy.resetDatabase();
    cy.login();
  });

  after(() => {
    cy.cleanupDatabase();
  });

  it("should batch scan multiple books with quantity controls and import them", () => {
    // Navigate to the batch scan page
    cy.visit("http://localhost:3000/book/batchscan");

    // Wait for the batch scan page to load
    cy.get("[data-cy=batch-scan-isbn-input]").should("be.visible");

    // Scan first ISBN: Herr der Ringe
    const isbnHerrDerRinge = "978-3-608-93828-9";
    cy.get("[data-cy=batch-scan-isbn-input]").type(isbnHerrDerRinge);
    cy.get("[data-cy=batch-scan-add-button]").click();

    // Wait for the book lookup to complete and entry to appear
    cy.get("[data-cy=batch-scan-entry]", { timeout: 15000 })
      .first()
      .should("be.visible");

    // Wait for loading to finish (check that "Suche in Datenbank..." disappears)
    cy.contains("Suche in Datenbank", { timeout: 15000 }).should("not.exist");

    // Verify the first book was found (should show title containing "Ringe")
    cy.get("[data-cy=batch-scan-entry]")
      .first()
      .should("contain.text", "Ringe");

    // Scan second ISBN: Herr der Fliegen
    const isbnHerrDerFliegen = "978-3-596-90667-3";
    cy.get("[data-cy=batch-scan-isbn-input]").type(isbnHerrDerFliegen);
    cy.get("[data-cy=batch-scan-add-button]").click();

    // Wait for the second book lookup to complete
    cy.get("[data-cy=batch-scan-entry]", { timeout: 15000 }).should(
      "have.length",
      2,
    );

    // Wait for loading to finish on the new entry
    cy.contains("Suche in Datenbank", { timeout: 15000 }).should("not.exist");

    // Verify the second book was found
    cy.get("[data-cy=batch-scan-entry]").should("contain.text", "Fliegen");

    // Scan the first ISBN again - counter should increase to 2
    cy.get("[data-cy=batch-scan-isbn-input]").type(isbnHerrDerRinge);
    cy.get("[data-cy=batch-scan-add-button]").click();

    // The number of entries should remain 2 (same ISBN increases quantity)
    cy.get("[data-cy=batch-scan-entry]").should("have.length", 2);

    // Wait a moment for the quantity to update
    cy.wait(500);

    // Verify the quantity for Herr der Ringe is now 2 Exemplare
    cy.get("[data-cy=batch-scan-entry]")
      .contains("Ringe")
      .parents("[data-cy=batch-scan-entry]")
      .should("contain.text", "2")
      .and("contain.text", "Exemplare");

    // Manually increase the counter for Herr der Fliegen to 3
    // Find the entry with Fliegen and click the plus button twice (1 -> 2 -> 3)
    cy.get("[data-cy=batch-scan-entry]")
      .contains("Fliegen")
      .parents("[data-cy=batch-scan-entry]")
      .within(() => {
        // The quantity controls Stack contains: [minus IconButton] [TextField] [plus IconButton] [Typography]
        // Find the Typography "Exemplar" and get its parent Stack, then find buttons
        cy.contains("Exemplar")
          .parent()
          .find("button")
          .eq(1) // Second button is the plus button (first is minus)
          .click();

        cy.wait(200);

        cy.contains("Exemplar").parent().find("button").eq(1).click();
      });

    // Verify the quantity for Herr der Fliegen is now 3 Exemplare
    cy.get("[data-cy=batch-scan-entry]")
      .contains("Fliegen")
      .parents("[data-cy=batch-scan-entry]")
      .should("contain.text", "3")
      .and("contain.text", "Exemplare");

    // Verify the import button shows 5 books total (2 + 3)
    cy.get("[data-cy=batch-scan-import-button]").should("contain.text", "5");

    // Click the import button
    cy.get("[data-cy=batch-scan-import-button]").click();

    // Wait for import to complete
    cy.contains("erfolgreich importiert", { timeout: 30000 }).should(
      "be.visible",
    );

    // Navigate to the book list to verify all 5 books are present
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();

    // Verify book list page is loaded
    cy.url().should("include", "/book");
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Search for "Ringe" - should find 2 copies of Herr der Ringe
    cy.get("[data-cy=rental_input_searchbook]").type("Ringe");

    // Wait for search results
    cy.wait(2000);

    // Count the number of book cards - should be at least 2
    // BookSummaryCard uses data-cy="book_title" for the title
    cy.get("[data-cy=book_title]").should("have.length.at.least", 2);

    // Clear search and search for "Fliegen"
    cy.get("[data-cy=rental_input_searchbook]").clear();
    cy.get("[data-cy=rental_input_searchbook]").type("Fliegen");

    // Wait for search results
    cy.wait(2000);

    // Count the number of book cards - should be at least 3
    cy.get("[data-cy=book_title]").should("have.length.at.least", 3);

    // Clear search to show all books
    cy.get("[data-cy=rental_input_searchbook]").clear();

    // Wait for results to load
    cy.wait(1000);

    // Final verification: both book types should be present when searching
    cy.get("[data-cy=rental_input_searchbook]").type("Herr");
    cy.wait(1000);

    // Should find all 5 books (2 Ringe + 3 Fliegen)
    cy.get("[data-cy=book_title]").should("have.length.at.least", 5);
  });
});
