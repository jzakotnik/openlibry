import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import { hasOverdueBooks } from "@/utils/hasOverdueBooks";

export function searchAndRemoveKlasse(inputString: string) {
    // Create a regex pattern to find "klasse?" followed by a number
    const regex = /klasse\?\s?([\d,\w,\u00F0-\u02AF]+)/gi;

    // Initialize variables to store whether the string is found and the number
    let foundKlasse = false;
    let klasse = "";

    // Search for the string using the regex pattern and capture the number
    const match = regex.exec(inputString);
    console.log("Klassenmatch", inputString, match);
    if (match) {
        foundKlasse = true;
        klasse = match[1];
    }
    // Remove the found string from the original string
    const updatedString = inputString.replace(regex, "").trim();

    return {
        foundKlasse,
        klasse,
        updatedString,
    };
}

export function filterUsers(users: Array<UserType>, searchString: string, rentals: Array<RentalsUserType>, exactMatch: boolean = false): [Array<UserType>, number] {
    let exactMatchUserIdRes = -1;
    if (searchString.length == 0) return [users, exactMatchUserIdRes]; //nothing to do
    const lowerCaseSearch = searchString.toLowerCase();

    const searchPattern = { klasse: "", overdue: false };
    // Create a regex pattern to find "klasse?" followed by a number
    const { foundKlasse, klasse, updatedString } =
        searchAndRemoveKlasse(lowerCaseSearch);
    foundKlasse ? (searchPattern.klasse = klasse.toLowerCase()) : "";
    let finalString = updatedString;
    if (updatedString.indexOf("fällig?") > -1) {
        searchPattern.overdue = true;
        finalString = updatedString.replace("fällig?", "").trim();
    }


    let filteredUsers = users.filter((u: UserType,) => {

        //this can be done shorter, but like this is easier to understand, ah well, what a mess
        let foundString = false;
        let foundClass = true;
        let foundOverdue = true;
        const filterForClass = foundKlasse;
        const filterForOverdue = searchPattern.overdue;

        //check if the string is at all there
        if (
            u.lastName.toLowerCase().includes(finalString) ||
            u.firstName.toLowerCase().includes(finalString) ||
            u.id!.toString().includes(finalString)
        ) {
            foundString = true;
        }
        console.log("suche klasse bei user", filterForClass, searchPattern.klasse, u.schoolGrade!)
        if (
            filterForClass &&
            !(u.schoolGrade!.toLowerCase().startsWith(searchPattern.klasse))
        ) {
            foundClass = false;
        }
        if (
            filterForOverdue &&
            !(searchPattern.overdue == hasOverdueBooks(booksForUser(u.id!, rentals)))
        ) {
            foundOverdue = false;
        }

        if (foundString && foundClass && foundOverdue) return u;
    });
    const idMatchedUser = users.filter((u: UserType) => {
        // ok again. This time we go for exact match on id only for barcode scanning
        let foundString = false;

        //check if the string is at all there
        if (

            u.id!.toString() == finalString
        ) {
            return u;
        }


    });
    if (filteredUsers.length == 1) {
        exactMatchUserIdRes = filteredUsers[0].id!;
    } else if (idMatchedUser.length == 1) {
        exactMatchUserIdRes = idMatchedUser[0].id!;
    }
    return [filteredUsers, exactMatchUserIdRes];
};


export function booksForUser(id: number, rentals: Array<RentalsUserType>): Array<RentalsUserType> {
    const userRentals = rentals.filter((r: RentalsUserType) => r.userid == id);
    //console.log("Filtered rentals", userRentals);
    return userRentals;
};