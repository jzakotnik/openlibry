import { BookType } from "@/entities/BookType";

export type ScanStatus = "loading" | "found" | "not_found" | "edited" | "error";

export interface ScannedEntry {
  id: string;
  isbn: string;
  status: ScanStatus;
  bookData: Partial<BookType>;
  errorMessage?: string;
  isEditing?: boolean;
  coverUrl?: string;
  hasCover?: boolean;
  coverBlob?: Blob;
  coverSource?: string;
  quantity: number;
}
