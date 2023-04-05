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
  imageLink?: string;

  //additional fields from OpenBiblio data model
  isbn?: string;
  editionDescription?: string;
  publisherLocation?: string;
  pages?: number;
  summary?: string;
  minPlayers?: string;
  publisherName?: string;
  otherPhysicalAttributes?: string;
  supplierComment?: string;
  publisherDate?: string;
  physicalSize?: string;
  minAge?: string;
  maxAge?: string;
  additionalMaterial?: string;
  price?: number;
  userId: number;
}
