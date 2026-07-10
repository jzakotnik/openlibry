import BookSummaryRow from "@/components/book/BookSummaryRow";
import { BookType } from "@/entities/BookType";
import { t } from "@/lib/i18n";
import { memo, useMemo } from "react";

type SummaryBook = BookType & { copyCount?: number };

interface SummaryRowContainerProps {
  renderedBooks: SummaryBook[];
  totalBooks: number;
  maxBooks: number;
  onLoadMore: () => void;
  onCopyBook: (book: BookType) => void;
}

const SummaryRowContainer = memo(function SummaryRowContainer({
  renderedBooks,
  totalBooks,
  maxBooks,
  onLoadMore,
  onCopyBook,
}: SummaryRowContainerProps) {
  const groupedBooks = useMemo(() => {
    const map = new Map<string, SummaryBook[]>();

    for (const book of renderedBooks) {
      const key = book.isbn?.trim() ? book.isbn.trim() : `__no_isbn_${book.id}`;
      const group = map.get(key) ?? [];
      group.push(book);
      map.set(key, group);
    }

    return Array.from(map.values()).map((group) => {
      const representative =
        group.find((b) => b.rentalStatus !== "rented") ?? group[0];
      const copyCount = Math.max(
        group.length,
        ...group.map((book) => book.copyCount ?? 0),
      );
      return { book: representative, count: copyCount };
    });
  }, [renderedBooks]);

  const visibleLimit = Math.min(totalBooks, maxBooks);

  return (
    <div className="flex flex-col gap-2 w-full">
      {groupedBooks.map(({ book, count }) => (
        <BookSummaryRow
          key={book.id}
          book={book}
          count={count}
          handleCopyBook={() => onCopyBook(book)}
        />
      ))}
      {visibleLimit - renderedBooks.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            {t("bookPage.loadMore")}{" "}
            {Math.max(0, visibleLimit - renderedBooks.length)}
          </button>
        </div>
      )}
    </div>
  );
});

export default SummaryRowContainer;
