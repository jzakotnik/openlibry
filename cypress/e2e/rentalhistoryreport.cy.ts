/// <reference types="cypress" />

// Viewport helpers
const DESKTOP = { width: 1280, height: 800 } as const;
const MOBILE = { width: 390, height: 844 } as const; // iPhone 14

describe("Rental History Report", () => {
  before(() => {
    cy.resetDatabase();
  });

  after(() => {
    cy.cleanupDatabase();
  });

  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
  });

  // ===========================================================================
  // Desktop tests
  // ===========================================================================

  describe("Desktop view", () => {
    beforeEach(() => {
      cy.viewport(DESKTOP.width, DESKTOP.height);
      cy.visit("http://localhost:3000/reports/userhistory");
    });

    it("displays the page structure with data", () => {
      cy.get("[data-cy=history-datagrid]").should("be.visible");
      cy.get("[data-cy=history-error]").should("not.exist");
      cy.get("[data-cy=history-no-data]").should("not.exist");
      cy.get("[data-cy=history-title]").should("be.visible");
      cy.get("[data-cy=history-excel-export]").should("be.visible");
      cy.get("[data-cy=history-pdf-export]").should("be.visible");
    });

    it("shows only active users by default and toggles all users", () => {
      // "Nur aktive Nutzer" is checked by default — only users with ≥1 loan shown
      cy.get("[data-cy=history-active-only]").should("be.checked");
      cy.get("[data-cy=history-table] tbody tr").should("have.length.gt", 0);

      // Unchecking shows all users (count should be ≥ current)
      cy.get("[data-cy=history-table] tbody tr").then(($activeRows) => {
        const activeCount = $activeRows.length;

        cy.get("[data-cy=history-active-only]").uncheck();
        cy.get("[data-cy=history-active-only]").should("not.be.checked");

        cy.get("[data-cy=history-table] tbody tr").should(
          "have.length.gte",
          activeCount,
        );
      });
    });

    it("filters rows by school grade", () => {
      cy.get("[data-cy=history-table] tbody tr").then(($rows) => {
        const totalRows = $rows.length;

        // Find the first non-empty grade option
        cy.get("[data-cy=history-grade-filter] option").then(($options) => {
          const gradeOption = $options
            .toArray()
            .find((o) => (o as HTMLOptionElement).value !== "") as
            | HTMLOptionElement
            | undefined;

          if (!gradeOption) return;

          cy.get("[data-cy=history-grade-filter]").select(gradeOption.value);

          // After filtering, row count must be ≤ the unfiltered total.
          // Zero rows (grade has no active borrowers) is a valid outcome —
          // the no-results message is expected in that case.
          cy.get("[data-cy=history-table] tbody tr").should(
            "have.length.lte",
            totalRows,
          );

          // Reset filter
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

        // Escape clears the filter
        cy.get("[data-cy=history-name-filter]").type("{esc}");

        cy.get("[data-cy=history-table] tbody tr").should(
          "have.length",
          totalRows,
        );
      });
    });

    it("paginates through rows", () => {
      // Set a small page size to ensure multiple pages exist with real data
      cy.get("[data-cy=history-page-size]").select("25");

      cy.get("[data-cy=history-page-next]").then(($btn) => {
        if ($btn.prop("disabled")) {
          // Only one page — pagination controls are correctly disabled
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
      cy.contains("a", "Zurück").click();
      cy.url().should("include", "/reports");
    });
  });

  // ===========================================================================
  // Mobile tests
  // ===========================================================================

  describe("Mobile view", () => {
    beforeEach(() => {
      cy.viewport(MOBILE.width, MOBILE.height);
      cy.visit("http://localhost:3000/reports/userhistory");
    });

    it("shows the mobile card list and hides the desktop table", () => {
      cy.get("[data-cy=history-mobile-list]").should("be.visible");
      // Desktop table wrapper is hidden via CSS — verify cards render instead
      cy.get("[data-cy=history-mobile-card]").should("have.length.gt", 0);
      cy.get("[data-cy=history-table]").should("not.be.visible");
    });

    it("expands and collapses a card to reveal book history", () => {
      cy.get("[data-cy=history-mobile-card]").first().as("firstCard");

      // Click the toggle button to expand
      cy.get("@firstCard").find("button").first().click();

      // Expanded card shows date and ID chips
      cy.get("@firstCard").find(".font-mono").should("have.length.gte", 1);

      // Click the toggle button again to collapse
      cy.get("@firstCard").find("button").first().click();

      cy.get("@firstCard").find(".font-mono").should("not.exist");
    });

    it("filters cards by name via the mobile search input", () => {
      cy.get("[data-cy=history-mobile-card]").then(($cards) => {
        const totalCards = $cards.length;

        cy.get("[data-cy=history-mobile-name-filter]").type("a");

        cy.get(
          "[data-cy=history-mobile-list] [data-cy=history-mobile-card]",
        ).should("have.length.lte", totalCards);

        // Escape clears the filter
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

            // Reset
            cy.get("[data-cy=history-mobile-grade-filter]").select("");

            cy.get(
              "[data-cy=history-mobile-list] [data-cy=history-mobile-card]",
            ).should("have.length", totalCards);
          },
        );
      });
    });

    it("toggles active-only on mobile", () => {
      cy.get("[data-cy=history-active-only]").should("be.checked");

      cy.get("[data-cy=history-mobile-card]").then(($cards) => {
        const activeCount = $cards.length;

        cy.get("[data-cy=history-active-only]").uncheck();

        cy.get(
          "[data-cy=history-mobile-list] [data-cy=history-mobile-card]",
        ).should("have.length.gte", activeCount);
      });
    });
  });
});
