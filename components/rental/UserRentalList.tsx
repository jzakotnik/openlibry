import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleArrowLeft, RefreshCw, Settings2, User, X } from "lucide-react";

import { Dispatch, useMemo, useState } from "react";

import { BookType } from "@/entities/BookType";
import { RentalsUserType } from "@/entities/RentalsUserType";
import { UserType } from "@/entities/UserType";
import { extendDays } from "@/lib/utils/dateutils";
import { booksForUser, filterUsers } from "@/lib/utils/searchUtils";
import dayjs from "dayjs";
import "dayjs/locale/de";

import OverdueIcon from "./OverdueIcon";
import RentSearchParams from "./RentSearchParams";

type UserPropsType = {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: Array<RentalsUserType>;
  handleExtendBookButton: (id: number, b: BookType) => void;
  handleReturnBookButton: (bookid: number, userid: number) => void;
  setUserExpanded: Dispatch<number | false>;
  userExpanded: number | false;
  searchFieldRef: any;
  handleBookSearchSetFocus: () => void;
  extensionDurationDays?: number;
};

export default function UserRentalList({
  users,
  books,
  rentals,
  handleExtendBookButton,
  handleReturnBookButton,
  setUserExpanded,
  userExpanded,
  searchFieldRef,
  handleBookSearchSetFocus,
  extensionDurationDays = 14,
}: UserPropsType) {
  const [userSearchInput, setUserSearchInput] = useState("");
  const [returnedBooks, setReturnedBooks] = useState<Record<number, number>>(
    {},
  );
  const [showDetailSearch, setShowDetailSearch] = useState(false);
  const [searchParams, setSearchParams] = useState({
    overdue: false,
    grade: "",
  });

  // ── Memoized filter ─────────────────────────────────────────────────────
  // filterUsers previously ran on every render inside the map. useMemo
  // ensures it only re-runs when users, search input, or rentals change.
  // exactMatchUserId is now returned alongside the filtered list instead of
  // being tracked via a mutable variable.
  const [filteredUsers, exactMatchUserId] = useMemo(
    () => filterUsers(users, userSearchInput, rentals, false),
    [users, userSearchInput, rentals],
  );

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setUserExpanded(false);
    setUserSearchInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearchInput(e.target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (exactMatchUserId > -1) setUserExpanded(exactMatchUserId);
      handleBookSearchSetFocus();
    } else if (e.key === "Escape") {
      setUserExpanded(false);
      setUserSearchInput("");
    }
  };

  const handleSelectedUserClick = () => {
    setUserExpanded(false);
    setUserSearchInput("");
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getBookFromID = (id: number): BookType =>
    books.find((b) => b.id === id)!;
  const getUserFromID = (id: number): UserType =>
    users.find((u) => u.id === id)!;

  const getUniqueGrades = () =>
    users.reduce((unique: Array<string>, user: UserType) => {
      if (user.schoolGrade && !unique.includes(user.schoolGrade))
        unique.push(user.schoolGrade);
      return unique;
    }, []);

  const extensionDays = extendDays(new Date(), extensionDurationDays);

  // shadcn Accordion value is a string; map user ids to strings
  const accordionValue = userExpanded !== false ? String(userExpanded) : "";

  return (
    <TooltipProvider>
      <div data-cy="user_rental_list_container">
        {/* ── Search header ──────────────────────────────────── */}
        <div className="flex items-center gap-2" data-cy="user_search_header">
          {/* Search input */}
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="user-search-input"
              ref={searchFieldRef}
              type="text"
              autoFocus
              value={userSearchInput}
              onChange={handleInputChange}
              onKeyUp={handleKeyUp}
              placeholder="Nutzer suchen"
              data-cy="user_search_input"
              aria-label="search users"
              className="pl-9 pr-9"
            />
            {userSearchInput && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onMouseDown={handleClear}
                    data-cy="user_search_clear_button"
                    aria-label="Suche löschen"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Suche löschen</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Selected user badge – clicking it deselects and clears search */}
          {userExpanded && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  data-cy="user_selected_display"
                  onClick={handleSelectedUserClick}
                  className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  {getUserFromID(userExpanded).firstName}{" "}
                  {getUserFromID(userExpanded).lastName}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Auswahl aufheben</TooltipContent>
            </Tooltip>
          )}

          {/* Settings toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="search-settings"
                onClick={() => setShowDetailSearch(!showDetailSearch)}
                data-cy="user_search_settings_button"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sucheinstellungen</TooltipContent>
          </Tooltip>
        </div>

        {/* ── Detail search params ───────────────────────────── */}
        {showDetailSearch && (
          <div className="mt-2">
            <RentSearchParams
              overdue={searchParams.overdue}
              grade={getUniqueGrades()}
              setUserSearchInput={setUserSearchInput}
            />
          </div>
        )}

        {/* ── User accordion list ────────────────────────────── */}
        {filteredUsers.length === 0 ? (
          <p
            className="mt-4 text-center text-sm text-muted-foreground"
            data-cy="user_no_results"
          >
            Keine NutzerInnen gefunden
          </p>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={accordionValue}
            onValueChange={(val) => setUserExpanded(val ? Number(val) : false)}
            className="mt-2 flex flex-col gap-0.5"
            data-cy="user_accordion_list"
          >
            {filteredUsers.map((u: UserType) => {
              const rentalsUser = booksForUser(u.id!, rentals);

              return (
                <AccordionItem
                  key={u.id}
                  value={String(u.id)}
                  className="rounded-lg border border-border bg-card min-w-[275px] px-3"
                  data-cy={`user_accordion_${u.id}`}
                >
                  <AccordionTrigger
                    data-cy={`user_accordion_summary_${u.id}`}
                    className="py-2.5 hover:no-underline gap-2"
                  >
                    {/* Name + book count */}
                    <span
                      className="flex-1 min-w-0 truncate text-sm text-muted-foreground text-left"
                      data-cy={`user_name_${u.id}`}
                    >
                      {u.firstName} {u.lastName}
                      {rentalsUser.length > 0
                        ? `, ${rentalsUser.length} ${rentalsUser.length > 1 ? "Bücher" : "Buch"}`
                        : ""}
                    </span>

                    {/* Meta info */}
                    <span
                      className="text-xs text-foreground whitespace-nowrap"
                      data-cy={`user_meta_${u.id}`}
                    >
                      Nr. {u.id}, Klasse {u.schoolGrade}
                    </span>

                    <OverdueIcon rentalsUser={rentalsUser} />
                  </AccordionTrigger>

                  <AccordionContent data-cy={`user_accordion_details_${u.id}`}>
                    <div
                      className="flex flex-col gap-2 px-1 pb-1"
                      data-cy={`user_rental_books_container_${u.id}`}
                    >
                      {rentalsUser.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center">
                          Keine ausgeliehenen Bücher
                        </p>
                      ) : (
                        rentalsUser.map((r: RentalsUserType) => {
                          const allowExtendBookRent = extensionDays.isAfter(
                            r.dueDate,
                            "day",
                          );
                          const extendTooltip = allowExtendBookRent
                            ? "Verlängern"
                            : "Maximale Ausleihzeit erreicht";

                          return (
                            <div
                              key={r.id}
                              data-cy={`rental_book_item_${r.id}`}
                              className="flex items-center gap-2 rounded-md bg-muted/30 px-2 py-1.5"
                            >
                              {/* Return button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (!userExpanded) return;
                                      handleReturnBookButton(
                                        r.id,
                                        userExpanded,
                                      );
                                      setReturnedBooks((prev) => ({
                                        ...prev,
                                        [r.id]: Date.now(),
                                      }));
                                    }}
                                    aria-label="zurückgeben"
                                    data-cy={`book_return_button_${r.id}`}
                                    className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <CircleArrowLeft className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Zurückgeben</TooltipContent>
                              </Tooltip>

                              {/* Book info */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm truncate"
                                  data-cy={`rental_book_title_${r.id}`}
                                >
                                  {r.title}
                                </p>
                                <p
                                  className="text-xs text-muted-foreground"
                                  data-cy={`rental_book_details_${r.id}`}
                                >
                                  bis {dayjs(r.dueDate).format("DD.MM.YYYY")},{" "}
                                  {r.renewalCount}x verlängert
                                </p>
                              </div>

                              {/* Extend button */}
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
                                        handleExtendBookButton(
                                          r.id,
                                          getBookFromID(r.id!),
                                        );
                                        setReturnedBooks((prev) => ({
                                          ...prev,
                                          [r.id]: Date.now(),
                                        }));
                                      }}
                                      data-cy={`book_extend_button_${r.id}`}
                                      className="h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary"
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>{extendTooltip}</TooltipContent>
                              </Tooltip>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </TooltipProvider>
  );
}
