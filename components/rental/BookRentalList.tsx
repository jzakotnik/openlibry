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
import itemsjs from "itemsjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import userNameforBook from "@/lib/utils/lookups";

interface BookPropsType {
  books: Array<BookType>;
  users: Array<UserType>;
  handleExtendBookButton: (id: number, b: BookType) => void;
  handleReturnBookButton: (bookid: number, userid: number) => void;
  handleRentBookButton: (id: number, userid: number) => void;
  userExpanded: number | false;
  searchFieldRef: React.Ref<HTMLInputElement>;
  handleUserSearchSetFocus: () => void;
  extensionDueDate: dayjs.Dayjs;
  sortBy: any;
}

type Sorting<T> = {
  field: keyof T | (keyof T)[];
  order: "asc" | "desc";
};

export default function BookRentalList({
  books,
  users,
  handleExtendBookButton,
  handleReturnBookButton,
  handleRentBookButton,
  userExpanded,
  searchFieldRef,
  handleUserSearchSetFocus,
  extensionDueDate,
  sortBy,
}: BookPropsType) {
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [renderedBooks, setRenderedBooks] = useState<Array<BookType>>(books);
  const [returnedBooks, setReturnedBooks] = useState<Record<number, number>>(
    {},
  );

  const sortings = useMemo(
    () =>
      ({
        id_asc: { field: "id", order: "asc" },
        id_desc: { field: "id", order: "desc" },
        title_asc: { field: "title", order: "asc" },
        title_desc: { field: "title", order: "desc" },
      }) as const satisfies Record<
        "id_asc" | "id_desc" | "title_asc" | "title_desc",
        Sorting<BookType>
      >,
    [],
  );

  const searchEngine = useMemo(
    () =>
      itemsjs(books, {
        searchableFields: ["title", "author", "subtitle", "id"],
        sortings,
      }),
    [books, sortings],
  );

  const searchBooks = useCallback(
    (query: any) => {
      const found = searchEngine.search({ per_page: 20, sort: sortBy, query });
      setRenderedBooks(found.data.items);
    },
    [searchEngine, sortBy],
  );

  useEffect(() => {
    searchBooks(bookSearchInput);
  }, [bookSearchInput, searchBooks]);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setBookSearchInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookSearchInput(e.target.value);
  };

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === "Escape") {
        if (bookSearchInput === "") {
          handleUserSearchSetFocus();
        } else {
          setBookSearchInput("");
        }
      }

      if (e.key === "Enter" && userExpanded) {
        const trimmedInput = bookSearchInput.trim();
        const bookId = parseInt(trimmedInput, 10);
        const book = books.find((b) => b.id === bookId);

        if (book && book.rentalStatus === "available") {
          handleRentBookButton(book.id!, userExpanded);
          setBookSearchInput("");
        } else if (book && book.rentalStatus !== "available") {
          console.log(`Book ${bookId} is already rented`);
        } else {
          console.log(`Book ${bookId} not found`);
        }
      }
    },
    [
      bookSearchInput,
      handleUserSearchSetFocus,
      userExpanded,
      books,
      handleRentBookButton,
    ],
  );

  const markBookTouched = (id: number) => {
    setReturnedBooks((prev) => ({ ...prev, [id]: Date.now() }));
  };

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
            onChange={handleInputChange}
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
                  onMouseDown={handleClear}
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

        {/* ── Book list ────────────────────────────────────────── */}
        <div
          className="flex flex-col gap-2 px-0.5 mt-2"
          data-cy="book_list_container"
        >
          {renderedBooks.slice(0, 100).map((b: BookType) => {
            const allowExtendBookRent = extensionDueDate.isAfter(
              b.dueDate,
              "day",
            );
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

                  {/* Action buttons */}
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
                              onClick={() => {
                                handleExtendBookButton(b.id!, b);
                                markBookTouched(b.id!);
                              }}
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
                            onClick={() => {
                              handleReturnBookButton(b.id!, b.userId!);
                              markBookTouched(b.id!);
                            }}
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
                            onClick={() => {
                              handleRentBookButton(b.id!, userExpanded);
                              markBookTouched(b.id!);
                            }}
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
                <div
                  className="px-2 pt-1 pb-2"
                  data-cy={`book_info_row_${b.id}`}
                >
                  <span
                    className="text-xs text-muted-foreground"
                    data-cy={`book_info_${b.id}`}
                  >
                    Nr. {b.id}
                    {isRented && b.rentalStatus !== "lost" && (
                      <span>
                        {" "}
                        — ausgeliehen bis{" "}
                        {dayjs(b.dueDate).format("DD.MM.YYYY")} an{" "}
                        {userNameforBook(users, b.userId!)}
                      </span>
                    )}
                    {!isRented && <span> — {b.author}</span>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
