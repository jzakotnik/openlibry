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

    // Store the book title for later verification
    cy.get("[data-cy^=book_item_]")
      .first()
      .invoke("text")
      .then((bookText) => {
        cy.wrap(bookText).as("rentedBookText");
      });

    // Find an available book (not rented) and click the rent button
    cy.get("[data-cy^=book_item_]")
      .first()
      .within(() => {
        cy.get("[data-cy^=book_rent_button_]").click();
      });

    cy.wait(5000);

    // Verify rental success message appears
    cy.contains("ausgeliehen").should("be.visible");

    // The book should now appear in the user's rented books list
    cy.get("[data-cy^=user_accordion_details_]")
      .first()
      .within(() => {
        cy.contains("Dorf").should("be.visible");
      });

    // Now navigate to the user detail page to delete the user
    cy.get("@rentedUserId").then((userId) => {
      cy.visit(`http://localhost:3000/user/${userId}`);
    });

    // Wait for the user detail page to load
    cy.url().should("include", "/user/");

    // The user detail page should be in edit mode (initiallyEditable=true)
    // Find and hold the delete button (HoldButton) to delete the user
    // The HoldButton requires holding for deleteSafetySeconds (default 3 seconds)
    // After the hold duration, the delete action fires automatically and the app
    // routes to /user, so we don't need to release the button manually
    cy.contains("button", "Löschen")
      .should("be.visible")
      .trigger("mousedown", { force: true });

    // The HoldButton will trigger the delete action after the hold duration
    // and the app will automatically navigate to /user
    // Verify user deletion success message appears
    cy.contains("Nutzer gelöscht", { timeout: 10000 }).should("be.visible");

    // Should be redirected to user list
    cy.url().should("include", "/user");
    cy.url().should("not.include", "/user/");

    // Now navigate to book list to verify the book is also deleted
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();

    // Verify book list page is loaded
    cy.url().should("include", "/book");
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Search for the book that was rented by the deleted user
    cy.get("[data-cy=rental_input_searchbook]").type("Dorf");

    // Wait for search results to update
    cy.wait(1000);

    // Verify the book is no longer in the list (it should be deleted along with the user)
    cy.get("body").then(($body) => {
      if ($body.find("[data-cy^=book_item_]").length > 0) {
        // If there are books, verify the rented book is not among them
        cy.get("[data-cy^=book_item_]").should("not.exist");
      } else {
        // No books found matching the search - this is expected
        cy.log(
          "No books found matching 'Dorf' - book was successfully deleted with user",
        );
      }
    });

    // Navigate to user list to verify it renders correctly
    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_user_button]").click();

    // Verify user list page is loaded
    cy.url().should("include", "/user");
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");

    // Search for the deleted user - they should no longer appear
    cy.get("[data-cy=rental_input_searchuser]").type("Magnus");

    // Wait for search results to update
    cy.wait(1000);

    // Verify the deleted user is not in the list
    // The user list should either be empty or not contain the deleted user
    cy.get("body").then(($body) => {
      // Check if any user items exist after searching
      if ($body.find("[data-cy^=user_list_item_]").length > 0) {
        // If there are users, verify Magnus is not among them
        cy.get("[data-cy^=user_list_item_]").should("not.contain", "Magnus");
      } else {
        // No users found matching the search - this is expected
        cy.log(
          "No users found matching 'Magnus' - user was successfully deleted",
        );
      }
    });

    // Clear search and verify the user list still renders properly
    cy.get("[data-cy=rental_input_searchuser]").clear();

    // Verify the user list component is still functional
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");
  });
});
