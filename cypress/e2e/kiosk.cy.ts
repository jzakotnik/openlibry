/// <reference types="cypress" />

// Self-checkout kiosk (/kiosk): scan a card, scan books to rent or return,
// finish or time out. The scanner is simulated by typing into the page's
// hidden, always-focused input and pressing Enter, exactly like a
// keyboard-wedge barcode reader. Besides the UI feedback (result card,
// toasts, scanned numbers, "ready to scan" indicator) every action is
// checked against the database through the API.

const IDLE_TIMEOUT_MS = 45_000; // keep in sync with pages/kiosk/index.tsx

describe("Kiosk self-checkout", () => {
  let emmaId: number;
  let inactiveId: number;
  let bookAId: number;

  before(() => {
    cy.resetAndSeed().then((seed: any) => {
      emmaId = seed.userIdByLastName["Pfau"];
      inactiveId = seed.userIdByLastName["Inaktiv"];
      bookAId = seed.bookIdByLabel["bookA"];
    });
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
  });

  /** Simulates the barcode reader: the code followed by Enter. */
  function scan(code: string | number) {
    cy.get("[data-cy=kiosk_input]").type(`${code}{enter}`, { force: true });
  }

  function dbBook(id: number) {
    return cy
      .request(`/api/book/${id}`)
      .its("body")
      .then((b) => (typeof b === "string" ? JSON.parse(b) : b));
  }

  function logIn(userId: number) {
    scan(userId);
    cy.get("[data-cy=kiosk_user]").should("be.visible");
  }

  it("shows only the scan prompt and no navigation", () => {
    cy.visit("/kiosk");
    cy.get("[data-cy=kiosk_prompt_card]").should("be.visible");
    cy.get("[data-cy=kiosk_finish]").should("not.exist");
    cy.get("a").should("not.exist");
    cy.get("[data-cy=kiosk_last_scan]").should("not.exist");
  });

  describe("ready-to-scan indicator", () => {
    it("shows 'Bereit zum Scannen' while the window and scan input have focus", () => {
      cy.visit("/kiosk");
      cy.window().then((win) => {
        cy.stub(win.document, "hasFocus").returns(true);
      });
      cy.get("[data-cy=kiosk_ready]")
        .should("have.attr", "data-ready", "true")
        .and("contain.text", "Bereit zum Scannen");
    });

    it("warns 'Nicht bereit' when the window has lost focus", () => {
      cy.visit("/kiosk");
      cy.window().then((win) => {
        cy.stub(win.document, "hasFocus").returns(false);
      });
      cy.get("[data-cy=kiosk_ready]")
        .should("have.attr", "data-ready", "false")
        .and("contain.text", "Nicht bereit");
    });

    it("puts the focus on the scan input without any click", () => {
      cy.visit("/kiosk");
      cy.focused().should("have.attr", "data-cy", "kiosk_input");
    });
  });

  describe("card scan", () => {
    beforeEach(() => {
      cy.visit("/kiosk");
    });

    it("asks for the card first when a book is scanned and shows the code", () => {
      scan("9783785725206");
      cy.get("[data-cy=kiosk_result]")
        .should("contain.text", "Erst den Ausweis scannen")
        .and("contain.text", "9783785725206");
      cy.contains("[data-sonner-toast]", "Erst den Ausweis scannen");
      cy.get("[data-cy=kiosk_last_scan]").should(
        "contain.text",
        "9783785725206",
      );
      cy.get("[data-cy=kiosk_user]").should("not.exist");
    });

    it("rejects an unknown card and shows the scanned number", () => {
      scan("99999");
      cy.get("[data-cy=kiosk_result]")
        .should("contain.text", "Ausweis nicht erkannt")
        .and("contain.text", "99999");
      cy.contains("[data-sonner-toast]", "Ausweis nicht erkannt");
      cy.get("[data-cy=kiosk_user]").should("not.exist");
    });

    it("rejects the card of an inactive user", () => {
      scan(inactiveId);
      cy.get("[data-cy=kiosk_result]")
        .should("contain.text", "Ausweis nicht erkannt")
        .and("contain.text", String(inactiveId));
      cy.get("[data-cy=kiosk_user]").should("not.exist");
    });

    it("logs in with a valid card, showing name and card number", () => {
      scan(emmaId);
      cy.get("[data-cy=kiosk_user]").should("contain.text", "Emma");
      cy.get("[data-cy=kiosk_user_id]").should(
        "contain.text",
        `Ausweis-Nr. ${emmaId}`,
      );
      cy.get("[data-cy=kiosk_prompt_book]").should("be.visible");
      cy.get("[data-cy=kiosk_finish]").should("be.visible");
      cy.contains("[data-sonner-toast]", "Angemeldet: Emma");
      cy.get("[data-cy=kiosk_last_scan]").should(
        "contain.text",
        String(emmaId),
      );
    });
  });

  describe("rent and return", () => {
    beforeEach(() => {
      cy.visit("/kiosk");
      logIn(emmaId);
    });

    it("rents an available book and writes it to the database", () => {
      dbBook(bookAId).its("rentalStatus").should("eq", "available");

      scan(bookAId);

      cy.get("[data-cy=kiosk_result]")
        .should("contain.text", "Ausgeliehen")
        .and("contain.text", "Cypress Buch Erstausleihe");
      cy.get("[data-cy=kiosk_result_detail]").should(
        "contain.text",
        `Mediennummer ${bookAId}`,
      );
      cy.contains("[data-sonner-toast]", "Ausgeliehen");
      cy.get("[data-cy=kiosk_last_scan]").should(
        "contain.text",
        String(bookAId),
      );

      dbBook(bookAId).then((b) => {
        expect(b.rentalStatus).to.eq("rented");
        expect(b.userId).to.eq(emmaId);
        expect(b.dueDate).to.be.a("string").and.not.be.empty;
      });
    });

    it("lists the rented book under the user's own books", () => {
      cy.get("[data-cy=kiosk_prompt_book]").should("be.visible");
      cy.contains("Deine Bücher: 1");
      cy.contains("Cypress Buch Erstausleihe");
    });

    it("returns the rented book and writes it to the database", () => {
      scan(bookAId);

      cy.get("[data-cy=kiosk_result]")
        .should("contain.text", "Zurückgegeben")
        .and("contain.text", "Cypress Buch Erstausleihe");
      cy.get("[data-cy=kiosk_result_detail]").should(
        "contain.text",
        `Mediennummer ${bookAId}`,
      );
      cy.contains("[data-sonner-toast]", "Zurückgegeben");
      cy.contains("Deine Bücher: 0");

      dbBook(bookAId).then((b) => {
        expect(b.rentalStatus).to.eq("available");
        expect(b.userId).to.eq(null);
      });
    });

    it("reports an unknown book with the scanned number and changes nothing", () => {
      scan("88888");
      cy.get("[data-cy=kiosk_result]")
        .should("contain.text", "Buch nicht gefunden")
        .and("contain.text", "88888");
      cy.contains("[data-sonner-toast]", "Buch nicht gefunden");
      dbBook(bookAId).its("rentalStatus").should("eq", "available");
    });
  });

  describe("end of session", () => {
    it("resets to the card prompt with a toast when 'Fertig' is pressed", () => {
      cy.visit("/kiosk");
      logIn(emmaId);

      cy.get("[data-cy=kiosk_finish]").click();

      cy.get("[data-cy=kiosk_prompt_card]").should("be.visible");
      cy.get("[data-cy=kiosk_user]").should("not.exist");
      cy.get("[data-cy=kiosk_finish]").should("not.exist");
      cy.contains("[data-sonner-toast]", "Die Sitzung ist beendet");
      // the next person can scan straight away
      cy.focused().should("have.attr", "data-cy", "kiosk_input");
    });

    it("does not show the previous user to the next person", () => {
      cy.visit("/kiosk");
      logIn(emmaId);
      cy.get("[data-cy=kiosk_finish]").click();
      cy.contains("Emma").should("not.exist");
    });

    it("ends the session by itself after the idle timeout, with a toast", () => {
      cy.clock();
      cy.visit("/kiosk");
      logIn(emmaId);

      cy.tick(IDLE_TIMEOUT_MS - 1000);
      cy.get("[data-cy=kiosk_user]").should("be.visible");

      cy.tick(2000);
      cy.get("[data-cy=kiosk_prompt_card]").should("be.visible");
      cy.get("[data-cy=kiosk_user]").should("not.exist");
      cy.contains("[data-sonner-toast]", "wegen Inaktivität beendet");
    });
  });
});
