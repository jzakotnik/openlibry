/// <reference types="cypress" />
describe("Book creation and validation", () => {
  const testBook = {
    title: "Test Cypress Book",
    author: "Jure",
    subtitle: "Batman uses a bathtub",
    isbn: "9781234567890",
    publisherName: "Cypress Publishing",
    publisherLocation: "Königstein",
    publisherDate: "2025",
    pages: "42",
  };

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
    cy.visit("http://localhost:3000/");
  });

  it("should create a new book, fill in details, save, and verify it exists", () => {
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    cy.get("[data-cy=create_book_button]").click();
    cy.url().should("include", "/book/new");
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    cy.get("[data-cy=book-isbn-field]").clear().type(testBook.isbn);
    cy.get("[data-cy=book-title-field]").clear().type(testBook.title);
    cy.get("[data-cy=book-author-field]").clear().type(testBook.author);
    cy.get("[data-cy=book-subtitle-field]").clear().type(testBook.subtitle);
    cy.get("[data-cy=book-publisherName-field]")
      .clear()
      .type(testBook.publisherName);
    cy.get("[data-cy=book-publisherLocation-field]")
      .clear()
      .type(testBook.publisherLocation);
    cy.get("[data-cy=book-publisherDate-field]")
      .clear()
      .type(testBook.publisherDate);
    cy.get("[data-cy=book-pages-field]").clear().type(testBook.pages);

    cy.intercept("POST", "/api/book").as("createBook");
    cy.get("[data-cy=save-book-button]").should("be.visible").click();

    cy.wait("@createBook", { timeout: 10000 }).then((interception) => {
      expect(interception.response!.statusCode).to.eq(200);
      const bookId = interception.response!.body.id;
      expect(bookId).to.exist;
      cy.wrap(bookId).as("newBookId");
    });

    cy.url().should("include", "/book");
    cy.url().should("not.include", "/book/new");

    cy.visit("http://localhost:3000/");
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    // Search by the book's ID for an exact match — avoids false positives
    // from other books created in earlier tests within the same suite.
    cy.get("@newBookId").then((bookId) => {
      cy.get("[data-cy=rental_input_searchbook]").clear().type(String(bookId));
      cy.wait(1000);

      cy.get("[data-cy=book_title]")
        .should("be.visible")
        .and("contain", testBook.title);
      cy.contains(testBook.author).should("be.visible");

      cy.get(`[data-cy=book_summary_card_${bookId}]`)
        .should("be.visible")
        .find("[data-cy=book_card_editbutton]")
        .click();
    });
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    cy.get("[data-cy=book-title-field]").should("have.value", testBook.title);
    cy.get("[data-cy=book-author-field]").should("have.value", testBook.author);
    cy.get("[data-cy=book-subtitle-field]").should(
      "have.value",
      testBook.subtitle,
    );
    cy.get("[data-cy=book-isbn-field]").should("have.value", testBook.isbn);
    cy.get("[data-cy=book-publisherName-field]").should(
      "have.value",
      testBook.publisherName,
    );
    cy.get("[data-cy=book-publisherLocation-field]").should(
      "have.value",
      testBook.publisherLocation,
    );
    cy.get("[data-cy=book-publisherDate-field]").should(
      "have.value",
      testBook.publisherDate,
    );
    cy.get("[data-cy=book-pages-field]").should("have.value", testBook.pages);
  });

  it("should create a new book with custom rented/due dates without a validation error", () => {
    // Regression test: editing the rentedDate/dueDate pickers before
    // saving a *new* book used to send Prisma a date-only string
    // ("YYYY-MM-DD") instead of a full ISO-8601 datetime, which
    // book.create() rejected ("Invalid value for argument `dueDate`:
    // premature end of input. Expected ISO-8601 DateTime."). A later fix
    // anchored the conversion to local midnight, which shifted the
    // stored calendar date by one day in timezones ahead of UTC. Both
    // regressions are covered here: the save must succeed, and the
    // dates must read back unchanged.
    const customRentedDate = "2025-01-15";
    const customDueDate = "2025-02-05";

    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    cy.get("[data-cy=create_book_button]").click();
    cy.url().should("include", "/book/new");
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    cy.get("[data-cy=book-title-field]")
      .clear()
      .type("Cypress Book With Custom Dates");
    cy.get("[data-cy=book-author-field]").clear().type("Jure");

    cy.get("[data-cy=book_rentedDate_datepicker]")
      .find("input[type=date]")
      .clear()
      .type(customRentedDate);
    cy.get("[data-cy=book_dueDate_datepicker]")
      .find("input[type=date]")
      .clear()
      .type(customDueDate);

    cy.intercept("POST", "/api/book").as("createBookWithDates");
    cy.get("[data-cy=save-book-button]").should("be.visible").click();

    cy.wait("@createBookWithDates", { timeout: 10000 }).then(
      (interception) => {
        expect(interception.response!.statusCode).to.eq(200);
        const bookId = interception.response!.body.id;
        expect(bookId).to.exist;
        cy.wrap(bookId).as("newDatedBookId");
      },
    );

    cy.url().should("include", "/book");
    cy.url().should("not.include", "/book/new");

    cy.get("@newDatedBookId").then((bookId) => {
      cy.navigateToBookEdit(String(bookId));

      cy.get("[data-cy=book_rentedDate_datepicker]")
        .find("input[type=date]")
        .should("have.value", customRentedDate);
      cy.get("[data-cy=book_dueDate_datepicker]")
        .find("input[type=date]")
        .should("have.value", customDueDate);

      cy.task("verifyBook", bookId).then((book: any) => {
        expect(book).to.not.be.null;
        expect(new Date(book.rentedDate).toISOString().slice(0, 10)).to.equal(
          customRentedDate,
        );
        expect(new Date(book.dueDate).toISOString().slice(0, 10)).to.equal(
          customDueDate,
        );
      });
    });
  });

  it("should cancel book creation and return to book list", () => {
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    cy.get("[data-cy=create_book_button]").click();
    cy.url().should("include", "/book/new");
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    cy.get("[data-cy=book-title-field]").type("This should not be saved");
    cy.get("[data-cy=cancel-book-button]").should("be.visible").click();

    cy.url().should("include", "/book");
    cy.url().should("not.include", "/book/new");

    cy.get("[data-cy=rental_input_searchbook]").type(
      "This should not be saved",
    );
    cy.wait(500);
    cy.get("[data-cy=book_title]").should("not.exist");
  });

  it("should validate required fields before saving", () => {
    cy.get("[data-cy=index_book_button]").click();
    cy.get("[data-cy=rental_input_searchbook]").should("be.visible");

    cy.get("[data-cy=create_book_button]").click();
    cy.url().should("include", "/book/new");
    cy.get("[data-cy=book-edit-form]").should("be.visible");

    cy.get("[data-cy=save-book-button]").click();
    cy.url().should("include", "/book/new");

    cy.get("[data-cy=book-title-field]").type("Only Title");
    cy.get("[data-cy=save-book-button]").click();
    cy.url().should("include", "/book/new");

    cy.get("[data-cy=book-author-field]").type("Test Author");
    cy.intercept("POST", "/api/book").as("createBook");
    cy.get("[data-cy=save-book-button]").click();

    cy.wait("@createBook").then((interception) => {
      expect(interception.response!.statusCode).to.eq(200);
    });

    cy.url().should("not.include", "/book/new");
  });
});
