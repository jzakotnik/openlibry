export interface BookType {
  id: number;
  rentalStatus: string;
  rentedDate: string;
  dueDate: string;
  renewalCount: number;
  title: string;
  subtitle?: string;
  author: string;
  topics?: string;

  //additional fields from OpenBiblio data model
  isbn: string;
  editionDescription: string;
  publisherLocation: string;
  pages: number;
  summary: string;
  minPlayers: string;
  publisherName: string;
  otherPhysicalAttributes: string;
  supplierComent: string;
  publisherDate: string;
  size: number;
  minAge: string;
  maxAge: string;
  additionalMaterial: string;
  price: number;
  userId: number;
}
