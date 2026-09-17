import { BookType } from "@/entities/BookType";
import {
  classifyScan,
  findBookForScan,
} from "@/lib/utils/scanClassifier";
import { useCallback } from "react";

interface UseSmartScanOptions {
  books: BookType[];
  /** Whether an action target (a borrower) is currently selected. */
  hasUser: boolean;
  onRent: (book: BookType) => void;
  onReturn: (book: BookType) => void;
  onUnavailable: (book: BookType) => void;
  onNeedsUser: () => void;
  onUnknownIsbn: (isbn: string) => void;
  onUnknownId: (id: number) => void;
}

/**
 * Shared "smart scan" decision logic used by both the rental page's scan
 * field and the global scan drawer: turns one scanned/typed code into the
 * right action (rent / return / create-new / error) based on the book's
 * current rental status. See lib/utils/scanClassifier.ts for the code
 * classification itself.
 */
export function useSmartScan({
  books,
  hasUser,
  onRent,
  onReturn,
  onUnavailable,
  onNeedsUser,
  onUnknownIsbn,
  onUnknownId,
}: UseSmartScanOptions) {
  const handleScan = useCallback(
    (raw: string): boolean => {
      const classified = classifyScan(raw);
      if (!classified) return false;

      const book = findBookForScan(classified, books);

      if (!book) {
        if (classified.type === "isbn") {
          onUnknownIsbn(classified.isbn!);
        } else {
          onUnknownId(classified.id!);
        }
        return true;
      }

      if (book.rentalStatus === "available") {
        if (!hasUser) {
          onNeedsUser();
        } else {
          onRent(book);
        }
      } else if (book.rentalStatus === "rented") {
        onReturn(book);
      } else {
        onUnavailable(book);
      }

      return true;
    },
    [
      books,
      hasUser,
      onRent,
      onReturn,
      onUnavailable,
      onNeedsUser,
      onUnknownIsbn,
      onUnknownId,
    ],
  );

  return { handleScan };
}
