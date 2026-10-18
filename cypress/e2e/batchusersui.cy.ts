/// <reference types="cypress" />

// The batch actions on the user list (/user): select users with the checkboxes
// or "select all", then "increase grade" or "delete" from the actions menu.
// The endpoints behind them are covered by batchgrade/batchdeleteusers; these
// tests cover the page: what gets selected, what is sent, what is shown after.
describe("User list batch actions (UI)", () => {
  let users: Record<string, number>;
  let books: Record<string, number>;

  type GradeUpdate = { id: number; grade: string };

  beforeEach(() => {
    cy.resetAndSeed();
    cy.task("seedScenario", "batch").then((ids: any) => {
      users = ids.userIdByLastName;
      books = ids.bookIdByLabel;
    });
    cy.session("user-session", () => {
      cy.login();
    });
    cy.visit("http://localhost:3000/user");
    cy.get("[data-cy=rental_input_searchuser]").should("be.visible");
  });

  after(() => {
    cy.clearDatabase();
  });

  // Narrow the list to the 8 scenario users (last names start with "Scn").
  const showScenarioUsers = () => {
    cy.get("[data-cy=rental_input_searchuser]").clear().type("Scn");
    cy.get("[data-cy^=user_row_]").should("have.length", 8);
  };

  const selectUser = (lastName: string) =>
    cy.get(`[data-cy=user_checkbox_${users[lastName]}]`).click();

  const openActionsMenu = () => cy.get("[data-cy=user_actions_menu]").click();

  const expectGradeInDb = (lastName: string, grade: string | null) =>
    cy.task("verifyUser", users[lastName]).then((user: any) => {
      expect(user.schoolGrade, `grade of ${lastName}`).to.eq(grade);
    });

  describe("selecting", () => {
    it("shows the selection bar with the number of selected users", () => {
      showScenarioUsers();
      cy.get("[data-cy=user_selection_bar]").should("not.exist");

      selectUser("Scnalpha");
      selectUser("Scnbeta");

      cy.get("[data-cy=user_selection_bar]").should("be.visible");
      cy.get("[data-cy=user_selected_count]").should("have.text", "2");
      cy.get(`[data-cy=user_checkbox_${users.Scnalpha}]`).should(
        "have.attr",
        "data-state",
        "checked",
      );
      cy.get(`[data-cy=user_checkbox_${users.Scngamma}]`).should(
        "have.attr",
        "data-state",
        "unchecked",
      );
    });

    it("hides the selection bar again when the last user is unchecked", () => {
      showScenarioUsers();
      selectUser("Scnalpha");
      cy.get("[data-cy=user_selection_bar]").should("be.visible");

      selectUser("Scnalpha");
      cy.get("[data-cy=user_selection_bar]").should("not.exist");
    });

    it("selects every listed user with select-all and clears with deselect", () => {
      cy.get("[data-cy^=user_row_]").then(($rows) => {
        const total = $rows.length;
        cy.get("[data-cy=user_select_all_button]").click();
        cy.get("[data-cy=user_selected_count]").should(
          "have.text",
          String(total),
        );

        cy.get("[data-cy=user_deselect_button]").click();
        cy.get("[data-cy=user_selection_bar]").should("not.exist");
      });
    });

    // Select-all acts on ALL users, not on the ones the search currently
    // shows, so "search one user, select all, delete" removes everybody.
    // Enable this test once select-all only selects the visible users.
    it.skip("KNOWN BUG: select-all with an active search selects only the visible users", () => {
      cy.get("[data-cy=rental_input_searchuser]").clear().type("Scnalpha");
      cy.get("[data-cy^=user_row_]").should("have.length", 1);

      cy.get("[data-cy=user_select_all_button]").click();
      cy.get("[data-cy=user_selected_count]").should("have.text", "1");
    });
  });

  describe("increasing the grade", () => {
    it("sends and shows the next grade for the selected users only", () => {
      cy.intercept("POST", "/api/batch/grade").as("batchGrade");
      showScenarioUsers();
      selectUser("Scnalpha");
      selectUser("Scnbeta");

      openActionsMenu();
      cy.get("[data-cy=user_action_increase_grade]").click();

      cy.wait("@batchGrade").then(({ request, response }) => {
        expect(response?.statusCode).to.eq(200);
        const sent = [...(request.body as GradeUpdate[])].sort(
          (a, b) => a.id - b.id,
        );
        expect(sent).to.deep.equal(
          [
            { id: users.Scnalpha, grade: "4a" },
            { id: users.Scnbeta, grade: "4b" },
          ].sort((a, b) => a.id - b.id),
        );
      });

      cy.get(`[data-cy=user_grade_${users.Scnalpha}]`).should("contain", "4a");
      cy.get(`[data-cy=user_grade_${users.Scnbeta}]`).should("contain", "4b");
      cy.get("[data-cy=user_selection_bar]").should("not.exist");

      expectGradeInDb("Scnalpha", "4a");
      expectGradeInDb("Scnbeta", "4b");
      expectGradeInDb("Scngamma", "4a"); // not selected, unchanged
    });

    it("increases only the first number of a grade", () => {
      cy.intercept("POST", "/api/batch/grade").as("batchGrade");
      showScenarioUsers();
      selectUser("Scndotted");

      openActionsMenu();
      cy.get("[data-cy=user_action_increase_grade]").click();

      cy.wait("@batchGrade")
        .its("request.body")
        .should("deep.equal", [{ id: users.Scndotted, grade: "2.1" }]);
      expectGradeInDb("Scndotted", "2.1");
    });

    it("leaves users without a numeric grade alone", () => {
      cy.intercept("POST", "/api/batch/grade").as("batchGrade");
      showScenarioUsers();
      selectUser("Scnsquirrel");
      selectUser("Scnnograde");

      openActionsMenu();
      cy.get("[data-cy=user_action_increase_grade]").click();

      cy.wait("@batchGrade").its("request.body").should("deep.equal", []);
      expectGradeInDb("Scnsquirrel", "Eichhörnchen");
      expectGradeInDb("Scnnograde", null);
    });
  });

  describe("deleting", () => {
    it("asks for confirmation: the first click deletes nothing", () => {
      cy.intercept("DELETE", "/api/batch/user").as("batchDelete");
      showScenarioUsers();
      selectUser("Scnalpha");

      openActionsMenu();
      cy.get("[data-cy=user_action_delete]").click();

      // the menu stays open and no request has been sent
      cy.get("[data-cy=user_action_delete]").should("be.visible");
      cy.get("@batchDelete.all").should("have.length", 0);
      cy.task("verifyUser", users.Scnalpha).should("not.be.null");
    });

    it("deletes the selected users after the second click", () => {
      cy.intercept("DELETE", "/api/batch/user").as("batchDelete");
      showScenarioUsers();
      selectUser("Scnalpha");
      selectUser("Scnbeta");

      openActionsMenu();
      cy.get("[data-cy=user_action_delete]").click();
      cy.get("[data-cy=user_action_delete]").click();

      cy.wait("@batchDelete").then(({ request, response }) => {
        expect(response?.statusCode).to.eq(200);
        expect([...(request.body as number[])].sort()).to.deep.equal(
          [users.Scnalpha, users.Scnbeta].sort(),
        );
      });

      cy.get(`[data-cy=user_row_${users.Scnalpha}]`).should("not.exist");
      cy.get(`[data-cy=user_row_${users.Scnbeta}]`).should("not.exist");
      cy.get(`[data-cy=user_row_${users.Scngamma}]`).should("exist");

      cy.task("verifyUser", users.Scnalpha).should("be.null");
      cy.task("verifyUser", users.Scnbeta).should("be.null");
      cy.task("verifyUser", users.Scngamma).should("not.be.null");
    });

    it("keeps the books of deleted users, marked as lost", () => {
      cy.intercept("DELETE", "/api/batch/user").as("batchDelete");
      showScenarioUsers();
      selectUser("Scnalpha");

      openActionsMenu();
      cy.get("[data-cy=user_action_delete]").click();
      cy.get("[data-cy=user_action_delete]").click();
      cy.wait("@batchDelete").its("response.statusCode").should("eq", 200);

      [books.alphaBook1, books.alphaBook2].forEach((id) => {
        cy.task("verifyBook", id).then((book: any) => {
          expect(book, `book ${id} must survive`).to.not.be.null;
          expect(book.rentalStatus).to.eq("lost");
          expect(book.userId).to.be.null;
        });
      });
    });
  });
});
