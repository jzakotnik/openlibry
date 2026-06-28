import { PublicBookType } from "./PublicBookType";

export interface PublicBookDetailType extends PublicBookType {
  subtitle: string | null;
  summary: string | null;
  publisherName: string | null;
  publisherDate: string | null;
  pages: number | null;
  minAge: string | null;
  maxAge: string | null;
  relatedBooks: PublicBookType[];
}
