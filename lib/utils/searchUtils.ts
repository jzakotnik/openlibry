import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";

function hasOverdueBooks(rentals: Array<RentalsUserType>): boolean {
  return rentals.some((b) => b.remainingDays > 0);
}

export function searchAndRemoveKlasse(inputString: string) {
  // Create a regex pattern to find "klasse?" followed by a number
  const regex = /klasse\?\s?([\d,\w,\u00F0-\u02AF]+)/gi;

  const match = regex.exec(inputString);
  console.log("Klassenmatch", inputString, match);
  const foundKlasse = !!match;
  const klasse = match ? match[1] : "";
  const updatedString = inputString.replace(regex, "").trim();

  return {
    foundKlasse,
    klasse,
    updatedString,
  };
}

export function filterUsers(
  users: Array<UserType>,
  searchString: string,
  rentals: Array<RentalsUserType>,
  exactMatch: boolean = false,
): [Array<UserType>, number] {
  const exactMatchUserIdDefault = -1;
  if (searchString.length === 0) return [users, exactMatchUserIdDefault]; // nothing to do

  // If the search string is purely numeric, strip leading zeros
  // (barcodes may have leading zeros, but user IDs are stored without them)
  const strippedSearch = /^\d+$/.test(searchString)
    ? String(parseInt(searchString, 10))
    : searchString;

  const lowerCaseSearch = strippedSearch.toLowerCase();

  // Extract search modifiers (klasse, overdue)
  const { foundKlasse, klasse, updatedString } =
    searchAndRemoveKlasse(lowerCaseSearch);

  const searchPattern = {
    klasse: foundKlasse ? klasse.toLowerCase() : "",
    overdue: updatedString.indexOf("fällig?") > -1,
  };

  const finalString = searchPattern.overdue
    ? updatedString.replace("fällig?", "").trim()
    : updatedString;

  const filteredUsers = users.filter((u: UserType) => {
    const filterForClass = foundKlasse;
    const filterForOverdue = searchPattern.overdue;

    const foundString =
      u.lastName.toLowerCase().includes(finalString) ||
      u.firstName.toLowerCase().includes(finalString) ||
      u.id!.toString().includes(finalString);

    const foundClass =
      !filterForClass ||
      u.schoolGrade!.toLowerCase().startsWith(searchPattern.klasse);

    const foundOverdue =
      !filterForOverdue ||
      searchPattern.overdue === hasOverdueBooks(booksForUser(u.id!, rentals));

    return foundString && foundClass && foundOverdue;
  });

  const idMatchedUser = users.filter(
    (u: UserType) => u.id!.toString() === finalString,
  );

  const exactMatchUserIdRes =
    filteredUsers.length === 1
      ? filteredUsers[0].id!
      : idMatchedUser.length === 1
        ? idMatchedUser[0].id!
        : exactMatchUserIdDefault;

  return [filteredUsers, exactMatchUserIdRes];
}

export function booksForUser(
  id: number,
  rentals: Array<RentalsUserType>,
): Array<RentalsUserType> {
  const userRentals = rentals.filter((r: RentalsUserType) => r.userid == id);
  //console.log("Filtered rentals", userRentals);
  return userRentals;
}
