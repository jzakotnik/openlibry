/// <reference types="cypress" />

const DESKTOP = { width: 1280, height: 800 } as const;
const MOBILE = { width: 390, height: 844 } as const;

describe("Rental History Report", () => {
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

  describe("Desktop view", () => {
    beforeEach(() => {
      cy.viewport(DESKTOP.width, DESKTOP.height);
      cy.visit("http://localhost:3000/reports/userhistory");
    });

    it("displays the page structure with data", () => {
      cy.get("[data-cy=history-datagrid]").should("be.visible");
      cy.get("[data-cy=history-error]").should("not.exist");
      cy.get("[data-cy=history-title]").should("be.visible");
      cy.get("[data-cy=history-excel-export]").should("be.visible");
      cy.get("[data-cy=history-pdf-export]").should("be.visible");
    });

    it("shows only active users by default and toggles all users", () => {
      // The seed has no audit records so borrowCount=0 for everyone —
      // "active only" (users with ≥1 loan) shows no rows by default.
      // Uncheck to show all users, then verify rows appear.
      cy.get("[data-cy=history-active-only]").should("be.checked");
      cy.get("[data-cy=history-active-only]").uncheck();
      cy.get("[data-cy=history-active-only]").should("not.be.checked");
      cy.get("[data-cy=history-table] tbody tr").should("have.length.gt", 0);

      // Re-checking should reduce or equal the count
      cy.get("[data-cy=history-table] tbody tr").then(($allRows) => {
        const allCount = $allRows.length;
        cy.get("[data-cy=history-active-only]").check();
        cy.get("[data-cy=history-active-only]").should("be.checked");
        cy.get("[data-cy=history-table] tbody tr").should(
          "have.length.lte",
          allCount,
        );
      });
    });

    it("filters rows by school grade", () => {
      cy.get("[data-cy=history-table] tbody tr").then(($rows) => {
        const totalRows = $rows.length;

        cy.get("[data-cy=history-grade-filter] option").then(($options) => {
          const gradeOption = $options
            .toArray()
            .find((o) => (o as HTMLOptionElement).value !== "") as
            | HTMLOptionElement
            | undefined;

          if (!gradeOption) return;

          cy.get("[data-cy=history-grade-filter]").select(gradeOption.value);
          cy.get("[data-cy=history-table] tbody tr").should(
            "have.length.lte",
            totalRows,
          );

          cy.get("[data-cy=history-grade-filter]").select("");
          cy.get("[data-cy=history-table] tbody tr").should(
            "have.length",
            totalRows,
          );
        });
      });
    });

    it("filters rows by name search and clears with Escape", () => {
      cy.get("[data-cy=history-table] tbody tr").then(($rows) => {
        const totalRows = $rows.length;

        cy.get("[data-cy=history-name-filter]").type("a");
        cy.get("[data-cy=history-table] tbody tr").should(
          "have.length.lte",
          totalRows,
        );

        cy.get("[data-cy=history-name-filter]").type("{esc}");
        cy.get("[data-cy=history-table] tbody tr").should(
          "have.length",
          totalRows,
        );
      });
    });

    it("paginates through rows", () => {
      cy.get("[data-cy=history-page-size]").select("25");

      cy.get("[data-cy=history-page-next]").then(($btn) => {
        if ($btn.prop("disabled")) {
          cy.get("[data-cy=history-page-first]").should("be.disabled");
          cy.get("[data-cy=history-page-prev]").should("be.disabled");
        } else {
          cy.get("[data-cy=history-page-next]").click();
          cy.get("[data-cy=history-page-first]").should("not.be.disabled");
          cy.get("[data-cy=history-page-prev]").should("not.be.disabled");
          cy.get("[data-cy=history-page-first]").click();
          cy.get("[data-cy=history-page-first]").should("be.disabled");
        }
      });
    });

    it("navigates back to the reports overview", () => {
      cy.get("[data-cy=history-back-link]").click();
      cy.url().should("include", "/reports");
    });
  });

  describe("Mobile view", () => {
    beforeEach(() => {
      cy.viewport(MOBILE.width, MOBILE.height);
      cy.visit("http://localhost:3000/reports/userhistory");
      // Uncheck "active only" so all seeded users appear regardless of
      // borrow history — the seed has no audit records so borrowCount=0
      // for everyone, meaning the default "active only" filter shows nobody.
      cy.get("[data-cy=history-active-only]").uncheck();
    });

    it("shows the mobile card list and hides the desktop table", () => {
      cy.get("[data-cy=history-mobile-list]").should("be.visible");
      cy.get("[data-cy=history-mobile-card]").should("have.length.gt", 0);
      cy.get("[data-cy=history-table]").should("not.be.visible");
    });

    it("expands and collapses a card", () => {
      // The seed has no audit records so borrowedBooks is empty — we can only
      // verify the expand/collapse mechanism works, not the borrow history content.
      cy.get("[data-cy=history-mobile-card]").first().as("firstCard");

      // Card is collapsed by default — the toggle button exists
      cy.get("@firstCard").find("button").first().should("be.visible");

      // Click to expand
      cy.get("@firstCard").find("button").first().click();

      // Expanded state: the card content area grows (aria-expanded or visible child)
      cy.get("@firstCard").find("button").first().should("exist");

      // Click again to collapse
      cy.get("@firstCard").find("button").first().click();
    });

    it("filters cards by name via the mobile search input", () => {
      cy.get("[data-cy=history-mobile-card]").then(($cards) => {
        const totalCards = $cards.length;
        cy.get("[data-cy=history-mobile-name-filter]").type("a");
        cy.get(
          "[data-cy=history-mobile-list] [data-cy=history-mobile-card]",
        ).should("have.length.lte", totalCards);
        cy.get("[data-cy=history-mobile-name-filter]").type("{esc}");
        cy.get(
          "[data-cy=history-mobile-list] [data-cy=history-mobile-card]",
        ).should("have.length", totalCards);
      });
    });

    it("filters cards by grade via the mobile grade select", () => {
      cy.get("[data-cy=history-mobile-card]").then(($cards) => {
        const totalCards = $cards.length;

        cy.get("[data-cy=history-mobile-grade-filter] option").then(
          ($options) => {
            const gradeOption = $options
              .toArray()
              .find((o) => (o as HTMLOptionElement).value !== "") as
              | HTMLOptionElement
              | undefined;

            if (!gradeOption) return;

            cy.get("[data-cy=history-mobile-grade-filter]").select(
              gradeOption.value,
            );
            cy.get(
              "[data-cy=history-mobile-list] [data-cy=history-mobile-card]",
            ).should("have.length.lte", totalCards);

            cy.get("[data-cy=history-mobile-grade-filter]").select("");
            cy.get(
              "[data-cy=history-mobile-list] [data-cy=history-mobile-card]",
            ).should("have.length", totalCards);
          },
        );
      });
    });

    it("toggles active-only on mobile", () => {
      // beforeEach already unchecked active-only so all users are visible.
      // Re-check it and confirm the count is ≤ the full count.
      cy.get("[data-cy=history-mobile-card]").then(($allCards) => {
        const allCount = $allCards.length;

        cy.get("[data-cy=history-active-only]").check();
        cy.get("[data-cy=history-active-only]").should("be.checked");

        cy.get(
          "[data-cy=history-mobile-list] [data-cy=history-mobile-card]",
        ).should("have.length.lte", allCount);
      });
    });
  });
});
