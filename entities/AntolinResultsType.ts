export interface AntolinItem {
  Autor: string;
  Titel: string;
  Klasse: string;
  ISBN: string;
  ISBN13: string;
  "ISBN-10": string;
  "ISBN-13": string;
  Verlag: string;
  book_id: string;
  "in Antolin seit": string;
  "wie oft gelesen": string;
  _id: string;
}
export interface AntolinResultType {
  foundNumber: number;
  items: Array<AntolinItem>;
}
