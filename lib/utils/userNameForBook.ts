import { UserType } from "@/entities/UserType";

export default function userNameforBook(
  users: Array<UserType>,
  userbookid: number
): string {
  if (!userbookid) return "";
  const foundUser = users.filter((u) => u.id == userbookid);
  //console.log("Filter user", foundUser, userbookid);
  return foundUser.length == 0
    ? ""
    : foundUser[0].firstName + " " + foundUser[0].lastName;
}
