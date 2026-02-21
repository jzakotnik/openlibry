/// <reference types="cypress" />
describe("Rental cleanup on user deletion", () => {
  before(() => {
    cy.resetDatabase();
    cy.login();
  });

  after(() => {
    cy.cleanupDatabase();
  });

  it("should rent a book, delete the user, and verify the book is also deleted", () => {
    cy.log(Cypress.env("user"));

    // Navigate to the rental screen
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_rental_button]").click();

    // Wait for the rental page to load
    cy.url().should("include", "/rental");

    // Search for and select a user (UserRentalList component)
    cy.get("[data-cy=user_search_input]").should("be.visible").type("Magnus");

    // Click on the first user accordion to expand it
    cy.get("[data-cy^=user_accordion_]").first().click();

    // The user accordion should expand - verify user details are visible
    cy.get("[data-cy^=user_accordion_details_]").first().should("be.visible");

    // Get the user ID from the accordion for later navigation
    cy.get("[data-cy^=user_accordion_]")
      .filter((_, el) =>
        /user_accordion_\d+$/.test(el.getAttribute("data-cy") || ""),
      )
      .first()
      .invoke("attr", "data-cy")
      .then((dataCy) => {
        const userId = dataCy!.replace("user_accordion_", "");
        cy.wrap(userId).as("rentedUserId");
      });

    // Search for an available book (BookRentalList component)
    cy.get("[data-cy=book_search_input]").should("be.visible").type("Dorf");

    // Store the book ID and a reliable title substring for later verification
    cy.get("[data-cy^=book_item_]")
      .first()
      .then(($el) => {
        const bookText = $el.text();
        // Extract the book number (e.g. "Nr. 2002") to use as a stable identifier
        const nrMatch = bookText.match(/Nr\.\s*(\d+)/);
        const bookNr = nrMatch ? nrMatch[1] : null;
        // Extract title (text before "Nr.")
        const title = bookText.split("Nr.")[0].trim();
        cy.wrap(bookNr).as("rentedBookNr");
        cy.wrap(title).as("rentedBookTitle");
        cy.log(`Renting book: "${title}" (Nr. ${bookNr})`);
      });

    // Find an available book (not rented) and click the rent button
    cy.get("[data-cy^=book_item_]")
      .first()
      .within(() => {
        cy.get("[data-cy^=book_rent_button_]").click();
      });

    // Verify rental success message appears
    cy.contains("ausgeliehen", { timeout: 8000 }).should("be.visible");

    // The book should now appear in the user's rented books list
    cy.get("@rentedBookTitle").then((title) => {
      cy.get("[data-cy^=user_accordion_details_]")
        .first()
        .within(() => {
          cy.contains(title as unknown as string).should("be.visible");
        });
    });

    // Now navigate to the user detail page to delete the user
    cy.get("@rentedUserId").then((userId) => {
      cy.visit(`http://localhost:3000/user/${userId}`);
    });

    // Wait for the user detail page to load
    cy.url().should("include", "/user/");

    // Hold the delete button - HoldButton fires automatically after hold duration
    cy.contains("button", "Löschen")
      .should("be.visible")
      .trigger("mousedown", { force: true });

    // Verify user deletion success message appears
    cy.contains("Nutzer gelöscht", { timeout: 10000 }).should("be.visible");

    // Should be redirected to user list
    cy.url({ timeout: 5000 }).should("match", /\/user$/);

    // Navigate to book list to verify the book is also deleted
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();

    // Verify book list page is loaded
    cy.url().should("include", "/book");
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Search for the rented book by its number to confirm it was deleted
    cy.get("@rentedBookNr").then((bookNr) => {
      cy.get("[data-cy=rental_input_searchbook]").type(
        bookNr as unknown as string,
      );

      // Wait for search results to settle
      cy.wait(2000);

      // The book should no longer exist
      cy.get("[data-cy^=book_item_]").should("not.exist");
    });

    // Navigate to user list to verify Magnus is gone
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_user_button]").click();

    cy.url().should("include", "/user");
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");

    // Search for the deleted user - they should no longer appear
    cy.get("[data-cy=rental_input_searchuser]").type("Magnus");

    // Wait for search results to update
    cy.wait(1000);

    // Verify Magnus is not in the list
    cy.get("[data-cy^=user_list_item_]").should("not.exist");

    // Clear search and verify the user list component is still functional
    cy.get("[data-cy=rental_input_searchuser]").clear();
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");
  });
});
