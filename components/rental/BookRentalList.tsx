import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookOpen,
  CircleArrowLeft,
  ListPlus,
  RefreshCw,
  X,
} from "lucide-react";

import dayjs from "dayjs";
import "dayjs/locale/de";
import React, { useCallback } from "react";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { useBookSearch } from "@/hooks/useBookSearch";
import userNameforBook from "@/lib/utils/lookups";
import { canExtendBook } from "@/lib/utils/rentalUtils";
import { toast } from "sonner";

interface BookPropsType {
  books: Array<BookType>;
  users: Array<UserType>;
  handleExtendBookButton: (id: number, b: BookType) => void;
  handleReturnBookButton: (bookid: number, userid: number) => void;
  handleRentBookButton: (id: number, userid: number) => void;
  userExpanded: number | false;
  searchFieldRef: React.Ref<HTMLInputElement>;
  handleUserSearchSetFocus: () => void;
  extensionDurationDays: number;
  maxExtensions: number;
  sortBy: any;
}

const BookList = React.memo(function BookList({
  renderedBooks,
  users,
  userExpanded,
  maxExtensions,
  handleExtendBookButton,
  handleReturnBookButton,
  handleRentBookButton,
}: {
  renderedBooks: Array<BookType>;
  users: Array<UserType>;
  userExpanded: number | false;
  extensionDurationDays: number;
  maxExtensions: number;
  handleExtendBookButton: (id: number, b: BookType) => void;
  handleReturnBookButton: (bookid: number, userid: number) => void;
  handleRentBookButton: (id: number, userid: number) => void;
}) {
  return (
    <div
      className="flex flex-col gap-2 px-0.5 mt-2"
      data-cy="book_list_container"
    >
      {renderedBooks.slice(0, 100).map((b: BookType) => {
        const allowExtendBookRent = canExtendBook(b, maxExtensions);
        const extendTooltip = allowExtendBookRent
          ? "Verlängern"
          : "Maximale Ausleihzeit erreicht";
        const isRented = b.rentalStatus !== "available";

        return (
          <div
            key={b.id}
            className="rounded-lg border border-border bg-card shadow-sm overflow-visible"
            data-cy={`book_item_${b.id}`}
          >
            {/* HEADER ROW */}
            <div
              className="flex items-center gap-2 px-2 pt-1.5 w-full flex-nowrap min-w-0"
              data-cy={`book_header_${b.id}`}
            >
              <span
                className="flex-1 min-w-0 truncate text-sm font-medium text-foreground"
                data-cy={`book_title_${b.id}`}
              >
                {b.title}
              </span>

              <div
                className="flex items-center gap-0.5 shrink-0 overflow-visible relative z-[1]"
                data-cy={`book_actions_${b.id}`}
              >
                {isRented && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="extend"
                          disabled={!allowExtendBookRent}
                          onClick={() => handleExtendBookButton(b.id!, b)}
                          data-cy={`book_extend_button_${b.id}`}
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{extendTooltip}</TooltipContent>
                  </Tooltip>
                )}

                {isRented && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReturnBookButton(b.id!, b.userId!)}
                        aria-label="zurückgeben"
                        data-cy={`book_return_button_${b.id}`}
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <CircleArrowLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zurückgeben</TooltipContent>
                  </Tooltip>
                )}

                {userExpanded && !isRented && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRentBookButton(b.id!, userExpanded)
                        }
                        aria-label="ausleihen"
                        data-cy={`book_rent_button_${b.id}`}
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                      >
                        <ListPlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ausleihen</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* SUBTITLE ROW */}
            {b.subtitle && (
              <div
                className="px-2 pt-1 w-full min-w-0"
                data-cy={`book_subtitle_row_${b.id}`}
              >
                <span
                  className="text-xs text-muted-foreground truncate block"
                  data-cy={`book_subtitle_${b.id}`}
                >
                  {b.subtitle}
                </span>
              </div>
            )}

            {/* INFO ROW */}
            <div className="px-2 pt-1 pb-2" data-cy={`book_info_row_${b.id}`}>
              <span
                className="text-xs text-muted-foreground"
                data-cy={`book_info_${b.id}`}
              >
                Nr. {b.id}
                {isRented && b.rentalStatus !== "lost" && (
                  <span>
                    {" "}
                    — ausgeliehen bis {dayjs(b.dueDate).format(
                      "DD.MM.YYYY",
                    )} an {userNameforBook(users, b.userId!)}
                  </span>
                )}
                {!isRented && <span> — {b.author}</span>}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

/* ────────────────────────────────────────────────────────────────
 * Main component
 * ──────────────────────────────────────────────────────────────── */
export default function BookRentalList({
  books,
  users,
  handleExtendBookButton,
  handleReturnBookButton,
  handleRentBookButton,
  userExpanded,
  searchFieldRef,
  handleUserSearchSetFocus,
  extensionDurationDays,
  maxExtensions,
  sortBy,
}: BookPropsType) {
  const { renderedBooks, bookSearchInput, handleInputChange, handleClear } =
    useBookSearch(books, { sort: sortBy, perPage: 100 });

  const handleInputChangeEvent = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      handleInputChange(e.target.value),
    [handleInputChange],
  );

  const handleClearMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleClear();
    },
    [handleClear],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === "Escape") {
        if (bookSearchInput === "") {
          handleUserSearchSetFocus();
        } else {
          handleClear();
        }
      }

      if (e.key === "Enter" && userExpanded) {
        // Bypass debounce for barcode scan + Enter — feels instant.
        const bookId = parseInt(bookSearchInput.trim(), 10);
        const book = books.find((b) => b.id === bookId);

        if (book && book.rentalStatus === "available") {
          handleRentBookButton(book.id!, userExpanded);
          handleClear();
        } else if (book) {
          toast.warning(`Buch ${bookId} ist bereits ausgeliehen`);
        } else {
          toast.warning(`Buch ${bookId} nicht gefunden`);
        }
      }
    },
    [
      bookSearchInput,
      handleUserSearchSetFocus,
      handleClear,
      userExpanded,
      books,
      handleRentBookButton,
    ],
  );

  return (
    <TooltipProvider>
      <div data-cy="book_rental_list_container">
        {/* ── Search field ─────────────────────────────────────── */}
        <div className="relative flex items-center">
          <BookOpen className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            ref={searchFieldRef}
            id="book-search-input"
            type="text"
            value={bookSearchInput}
            onChange={handleInputChangeEvent}
            onKeyUp={handleKeyUp}
            placeholder="Suche Buch"
            data-cy="book_search_input"
            aria-label="search books"
            className="pl-9 pr-9"
          />
          {bookSearchInput && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onMouseDown={handleClearMouseDown}
                  data-cy="book_search_clear_button"
                  aria-label="Suche löschen"
                  className="absolute right-1 h-6 w-6"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Suche löschen</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* ── Book list (memoised) ─────────────────────────────── */}
        <BookList
          renderedBooks={renderedBooks}
          users={users}
          userExpanded={userExpanded}
          extensionDurationDays={extensionDurationDays}
          maxExtensions={maxExtensions}
          handleExtendBookButton={handleExtendBookButton}
          handleReturnBookButton={handleReturnBookButton}
          handleRentBookButton={handleRentBookButton}
        />
      </div>
    </TooltipProvider>
  );
}
