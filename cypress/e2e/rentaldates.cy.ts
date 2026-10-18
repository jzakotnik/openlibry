/// <reference types="cypress" />

// How rental dates are reported by GET /api/rental (the data behind the rental
// screen and the overdue views): days overdue, and calendar days of fixed
// dates. Fixed dates are seeded at 12:00 UTC so the expected day is the same in
// every server timezone (the API formats in the server's local timezone).
describe("Rental dates (API)", () => {
  const API = "http://localhost:3000/api";

  let users: Record<string, number>;
  let books: Record<string, number>;

  type RentalRow = {
    id: number;
    userid: number;
    remainingDays: number;
    dueDate: string;
    renewalCount: number;
  };

  beforeEach(() => {
    cy.resetAndSeed();
    cy.task("seedScenario", "batch").then((ids: any) => {
      users = ids.userIdByLastName;
      books = ids.bookIdByLabel;
    });
    cy.session("user-session", () => {
      cy.login();
    });
  });

  after(() => {
    cy.clearDatabase();
  });

  const getSummary = () => cy.request(`${API}/rental`).its("body");

  const rentalOf = (summary: { rentals: RentalRow[] }, bookId: number) =>
    summary.rentals.find((r) => r.id === bookId);

  it("reports the number of days a loan is overdue as a positive number", () => {
    getSummary().then((summary) => {
      const row = rentalOf(summary, books.alphaBook2);
      expect(row, "overdue loan is listed").to.exist;
      expect(row!.remainingDays).to.eq(3);
      expect(row!.userid).to.eq(users.Scnalpha);
      expect(row!.renewalCount).to.eq(2);
    });
  });

  it("reports a loan that is not due yet with zero or negative days", () => {
    getSummary().then((summary) => {
      const row = rentalOf(summary, books.alphaBook1);
      expect(row, "running loan is listed").to.exist;
      // due in 5 days: -4 or -5 depending on how the partial day truncates
      expect(row!.remainingDays).to.be.within(-5, -4);
    });
  });

  it("reports a fixed due date as the same calendar day (leap day)", () => {
    getSummary().then((summary) => {
      expect(rentalOf(summary, books.fixedDueBook)!.dueDate).to.eq(
        "2028-02-29",
      );

      const book = summary.books.find((b: any) => b.id === books.fixedDueBook);
      expect(book.dueDate).to.eq("2028-02-29");
      expect(book.rentedDate).to.eq("2028-02-01");
    });
  });

  it("lists exactly the rented books, not available or lost ones", () => {
    getSummary().then((summary) => {
      const listed = summary.rentals.map((r: RentalRow) => r.id);
      [
        books.alphaBook1,
        books.alphaBook2,
        books.betaBook,
        books.deltaBook,
        books.fixedDueBook,
      ].forEach((id) => expect(listed).to.include(id));
      [books.freeBook, books.freeBook2, books.lostBook].forEach((id) =>
        expect(listed).to.not.include(id),
      );
    });
  });

  it("drops a book from the rental list and clears its due date on return", () => {
    cy.request({
      method: "DELETE",
      url: `${API}/book/${books.alphaBook2}/user/${users.Scnalpha}`,
    })
      .its("status")
      .should("eq", 200);

    getSummary().then((summary) => {
      expect(rentalOf(summary, books.alphaBook2)).to.be.undefined;
      const book = summary.books.find((b: any) => b.id === books.alphaBook2);
      expect(book.dueDate).to.eq("");
    });
  });

  it("shows a new rental as not overdue", () => {
    cy.request({
      method: "POST",
      url: `${API}/book/${books.freeBook}/user/${users.Scngamma}`,
    })
      .its("status")
      .should("eq", 200);

    getSummary().then((summary) => {
      const row = rentalOf(summary, books.freeBook);
      expect(row, "new loan is listed").to.exist;
      expect(row!.remainingDays).to.be.lessThan(0);
      expect(row!.userid).to.eq(users.Scngamma);
    });
  });
});
