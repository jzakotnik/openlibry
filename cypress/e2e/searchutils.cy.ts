/// <reference types="cypress" />
import type { UserType } from "../../entities/UserType";
import {
  filterUsers,
  searchAndRemoveKlasse,
} from "../../lib/utils/searchUtils";

// Pure-function tests: no server or database needed. Grades are free text, so
// the grade token must survive characters like "." and "-" intact. A character
// that isn't captured stays in the search string and is then matched against
// names and IDs, which silently empties the list (issue #549).

const user = (id: number, schoolGrade: string): UserType =>
  ({
    id,
    firstName: "Test",
    lastName: `User${id}`,
    schoolGrade,
  }) as UserType;

describe("searchAndRemoveKlasse", () => {
  it("captures a plain grade", () => {
    expect(searchAndRemoveKlasse("klasse?4b")).to.deep.equal({
      foundKlasse: true,
      klasse: "4b",
      updatedString: "",
    });
  });

  ["1.1", "5-a", "1/2", "10.3b"].forEach((grade) => {
    it(`captures the whole grade "${grade}"`, () => {
      const res = searchAndRemoveKlasse(`klasse?${grade}`);
      expect(res.klasse).to.equal(grade);
      expect(res.updatedString).to.equal("");
    });
  });

  it("leaves the other search terms in place", () => {
    const res = searchAndRemoveKlasse("fällig? klasse?1.1 duck");
    expect(res.klasse).to.equal("1.1");
    expect(res.updatedString).to.equal("fällig?  duck");
  });

  it("reports no grade when the token is absent", () => {
    expect(searchAndRemoveKlasse("donald").foundKlasse).to.equal(false);
  });
});

describe("filterUsers grade filter", () => {
  const users = [user(7, "1.1"), user(8, "1.2"), user(9, "2"), user(10, "1 1")];

  it("finds users of a grade containing a dot", () => {
    const [found] = filterUsers(users, "klasse?1.1", [], false);
    expect(found.map((u) => u.id)).to.deep.equal([7]);
  });

  it("combines a dotted grade with the overdue token", () => {
    const rentals = [{ userid: 7, remainingDays: 3 }, { userid: 8, remainingDays: 3 }];
    const [found] = filterUsers(users, "fällig? klasse?1.1", rentals as any, false);
    expect(found.map((u) => u.id)).to.deep.equal([7]);
  });

  it("still matches grades by prefix", () => {
    const [found] = filterUsers(users, "klasse?1", [], false);
    expect(found.map((u) => u.id)).to.deep.equal([7, 8, 10]);
  });
});
