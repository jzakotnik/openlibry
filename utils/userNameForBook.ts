import { UserType } from "@/entities/UserType";

export default function userNameforBook(
  users: Array<UserType>,
  userbookid: number
): string {
  const foundUser = users.filter((u) => u.id == userbookid);
  //console.log("Filter user", foundUser, userbookid);
  if (foundUser.length == 0) {
    return "";
  } else {
    return foundUser[0].firstName + " " + foundUser[0].lastName;
  }
}
