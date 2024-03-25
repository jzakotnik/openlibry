export function increaseNumberInString(text: any) {
  return text.replace(/\d+/g, function (match: any) {
    // Convert the matched substring to a number, add 1, and return it
    return parseInt(match, 10) + 1;
  });
}
