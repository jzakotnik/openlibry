import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  BookOpen,
  CircleArrowLeft,
  ListPlus,
  RefreshCw,
  X,
} from "lucide-react";

import dayjs from "dayjs";

import React, { useCallback } from "react";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { useBookSearch } from "@/hooks/useBookSearch";
import { t } from "@/lib/i18n";
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
  renderLimit?: number;
}

// Human-readable label for any rentalStatus that is neither "available"
// nor "rented" (e.g. "lost", "damaged"). Falls back to a generic label
// for statuses that don't have a dedicated translation yet.
function getStatusLabel(status: string): string {
  switch (status) {
    case "broken":
      return t("rental.statusBroken");
    case "presentation":
      return t("rental.statusPresentation");
    case "ordered":
      return t("rental.statusOrdered");
    case "lost":
      return t("rental.statusLost");
    case "remote":
      return t("rental.statusRemote");
    default:
      return t("rental.statusUnknown", { status });
  }
}

const BookList = React.memo(function BookList({
  renderedBooks,
  users,
  userExpanded,
  maxExtensions,
  renderLimit,
  handleExtendBookButton,
  handleReturnBookButton,
  handleRentBookButton,
}: {
  renderedBooks: Array<BookType>;
  users: Array<UserType>;
  userExpanded: number | false;
  extensionDurationDays: number;
  maxExtensions: number;
  renderLimit?: number;
  handleExtendBookButton: (id: number, b: BookType) => void;
  handleReturnBookButton: (bookid: number, userid: number) => void;
  handleRentBookButton: (id: number, userid: number) => void;
}) {
  const totalCount = renderedBooks.length;
  const visibleBooks =
    renderLimit !== undefined
      ? renderedBooks.slice(0, renderLimit)
      : renderedBooks;

  return (
    <>
      <div
        className="flex flex-col gap-2 px-0.5 mt-2"
        data-cy="book_list_container"
      >
        {visibleBooks.map((b: BookType) => {
          const isAvailable = b.rentalStatus === "available";
          const isRented = b.rentalStatus === "rented";
          // Anything that's neither available nor actively rented (lost,
          // damaged, etc.) has no valid rental to extend or return.
          const isUnavailableOther = !isAvailable && !isRented;

          const allowExtendBookRent = canExtendBook(b, maxExtensions);
          const extendTooltip = allowExtendBookRent
            ? t("rental.extend")
            : t("rental.maxExtensionReached");

          return (
            <div
              key={b.id}
              className="rounded-lg border border-border bg-card shadow-sm overflow-visible"
              data-cy={`book_item_${b.id}`}
              data-rental-status={b.rentalStatus}
            >
              {/* HEADER ROW */}
              <div
                className="flex items-center gap-2 px-2 pt-1.5 w-full flex-nowrap min-w-0"
                data-cy={`book_header_${b.id}`}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="flex-1 min-w-0 truncate text-sm font-medium text-foreground"
                      data-cy={`book_title_${b.id}`}
                    >
                      {b.title}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{b.title}</TooltipContent>
                </Tooltip>

                <div
                  className="flex items-center gap-0.5 shrink-0 overflow-visible relative z-[1]"
                  data-cy={`book_actions_${b.id}`}
                >
                  {isUnavailableOther && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                            data-cy={`book_status_badge_${b.id}`}
                            aria-label={t("rental.statusBadgeAria", {
                              status: getStatusLabel(b.rentalStatus),
                            })}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {getStatusLabel(b.rentalStatus)}
                          </Badge>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getStatusLabel(b.rentalStatus)}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {isRented && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t("rental.extendAria")}
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
                          onClick={() =>
                            handleReturnBookButton(b.id!, b.userId!)
                          }
                          aria-label={t("rental.returnAria")}
                          data-cy={`book_return_button_${b.id}`}
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <CircleArrowLeft className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("rental.return")}</TooltipContent>
                    </Tooltip>
                  )}

                  {userExpanded && isAvailable && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRentBookButton(b.id!, userExpanded)
                          }
                          aria-label={t("rental.rentAria")}
                          data-cy={`book_rent_button_${b.id}`}
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                        >
                          <ListPlus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("rental.rent")}</TooltipContent>
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
                  data-due-date={
                    b.dueDate ? dayjs(b.dueDate).format("YYYY-MM-DD") : ""
                  }
                >
                  {t("rental.bookNumberPrefix")} {b.id}
                  {isRented && (
                    <span data-cy={`book_rented_status_${b.id}`}>
                      {" "}
                      — {t("rental.bookRentedUntil")}{" "}
                      {dayjs(b.dueDate).format("DD.MM.YYYY")}{" "}
                      {t("rental.bookRentedTo")}{" "}
                      {userNameforBook(users, b.userId!)}
                    </span>
                  )}
                  {isAvailable && (
                    <span data-cy={`book_available_status_${b.id}`}>
                      {" "}
                      — {b.author}
                    </span>
                  )}
                  {isUnavailableOther && (
                    <span data-cy={`book_unavailable_status_${b.id}`}>
                      {" "}
                      — {b.author} · {getStatusLabel(b.rentalStatus)}
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {renderLimit !== undefined && totalCount > renderLimit && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {t("rental.showingFirst", {
            shown: renderLimit,
            total: totalCount,
          })}
        </p>
      )}
    </>
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
  renderLimit,
}: BookPropsType) {
  const { renderedBooks, bookSearchInput, handleInputChange, handleClear } =
    useBookSearch(books, { sort: sortBy, perPage: renderLimit ?? 100 });

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
          toast.warning(t("rental.toastAlreadyRented", { bookId }));
        } else {
          toast.warning(t("rental.toastBookNotFound", { bookId }));
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
            placeholder={t("rental.searchBookPlaceholder")}
            data-cy="book_search_input"
            aria-label={t("rental.searchBooksAria")}
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
                  aria-label={t("rental.clearSearch")}
                  className="absolute right-1 h-6 w-6"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("rental.clearSearch")}</TooltipContent>
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
          renderLimit={renderLimit}
          handleExtendBookButton={handleExtendBookButton}
          handleReturnBookButton={handleReturnBookButton}
          handleRentBookButton={handleRentBookButton}
        />
      </div>
    </TooltipProvider>
  );
}
