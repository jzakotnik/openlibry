import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  CircleArrowLeft,
  RefreshCw,
  Settings2,
  User,
  X,
} from "lucide-react";

import { Dispatch, useState } from "react";

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

  let exactMatchUserId: number = -1;

  const filterUserSub = (
    users: Array<UserType>,
    searchString: string,
    rentals: Array<RentalsUserType>,
    exactMatch: boolean = false,
  ) => {
    const [filteredUsers, exactMatchRes] = filterUsers(
      users,
      searchString,
      rentals,
      exactMatch,
    );
    exactMatchUserId = exactMatchRes;
    return filteredUsers;
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setUserExpanded(false);
    setUserSearchInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserSearchInput(e.target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      if (exactMatchUserId > -1) {
        setUserExpanded(exactMatchUserId);
      }
      handleBookSearchSetFocus();
    } else if (e.key === "Escape") {
      setUserExpanded(false);
      setUserSearchInput("");
    }
  };

  const handleToggleUser = (userID: number) => {
    setUserExpanded(userExpanded === userID ? false : userID);
  };

  const getBookFromID = (id: number): BookType => {
    return books.filter((b: BookType) => b.id === id)[0];
  };

  const getUserFromID = (id: number): UserType => {
    return users.filter((u: UserType) => u.id === id)[0];
  };

  const getUniqueGrades = () => {
    return users.reduce((unique: Array<string>, user: UserType) => {
      if (user.schoolGrade && !unique.includes(user.schoolGrade)) {
        unique.push(user.schoolGrade);
      }
      return unique;
    }, []);
  };

  const extensionDays = extendDays(
    new Date(),
    process.env.EXTENSION_DURATION_DAYS
      ? parseInt(process.env.EXTENSION_DURATION_DAYS)
      : 14,
  );

  return (
    <TooltipProvider>
      <div data-cy="user_rental_list_container">
        {/* ── Search header ──────────────────────────────────── */}
        <div className="flex items-center gap-2" data-cy="user_search_header">
          {/* Search input */}
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="user-search-input"
              ref={searchFieldRef}
              type="text"
              autoFocus
              value={userSearchInput}
              onChange={handleInputChange}
              onKeyUp={handleKeyUp}
              placeholder="Name, ID, klasse?, fällig?"
              data-cy="user_search_input"
              aria-label="search users"
              className="h-10 w-full rounded-lg border border-border bg-card
                         pl-9 pr-9 text-sm text-foreground
                         placeholder:text-muted-foreground
                         transition-colors duration-200
                         hover:border-primary/25
                         focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {userSearchInput && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onMouseDown={handleClear}
                    data-cy="user_search_clear_button"
                    aria-label="Suche löschen"
                    className="absolute right-2 top-1/2 -translate-y-1/2
                               flex h-6 w-6 items-center justify-center rounded
                               text-muted-foreground hover:bg-muted hover:text-foreground
                               transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Suche löschen</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Selected user badge */}
          {userExpanded && (
            <span
              className="text-xs font-medium text-primary whitespace-nowrap"
              data-cy="user_selected_display"
            >
              {getUserFromID(userExpanded).firstName}
            </span>
          )}

          {/* Settings toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="search-settings"
                onClick={() => setShowDetailSearch(!showDetailSearch)}
                data-cy="user_search_settings_button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                           border border-border bg-card text-primary
                           hover:bg-primary/10 transition-colors"
              >
                <Settings2 className="h-4 w-4" />
              </button>
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
        <div className="mt-2 flex flex-col gap-0.5">
          {filterUserSub(users, userSearchInput, rentals).map((u: UserType) => {
            const rentalsUser = booksForUser(u.id!, rentals);
            const isExpanded = userExpanded === u.id!;

            return (
              <div
                key={u.id}
                className="rounded-lg border border-border bg-card min-w-[275px]"
                data-cy={`user_accordion_${u.id}`}
              >
                {/* ── Accordion trigger ──────────────────── */}
                <button
                  type="button"
                  onClick={() => handleToggleUser(u.id!)}
                  aria-controls={`user-details-${u.id}`}
                  aria-expanded={isExpanded}
                  data-cy={`user_accordion_summary_${u.id}`}
                  className="flex w-full items-center gap-2 px-3 py-2.5
                               text-left
                               hover:bg-muted/50 transition-colors
                               rounded-lg"
                >
                  {/* Name + book count */}
                  <span
                    className="flex-1 min-w-0 truncate text-sm text-muted-foreground"
                    data-cy={`user_name_${u.id}`}
                  >
                    {u.firstName} {u.lastName}
                    {rentalsUser.length > 0
                      ? `, ${rentalsUser.length} ${
                          rentalsUser.length > 1 ? "Bücher" : "Buch"
                        }`
                      : ""}
                  </span>

                  {/* Meta info */}
                  <span
                    className="text-xs text-foreground whitespace-nowrap mr-1"
                    data-cy={`user_meta_${u.id}`}
                  >
                    Nr. {u.id}, Klasse {u.schoolGrade}
                  </span>

                  <OverdueIcon rentalsUser={rentalsUser} />

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* ── Accordion content ─────────────────── */}
                {isExpanded && (
                  <div
                    id={`user-details-${u.id}`}
                    data-cy={`user_accordion_details_${u.id}`}
                    className="px-3 pb-3"
                  >
                    <div
                      className="flex flex-col gap-2 px-1 my-1"
                      data-cy={`user_rental_books_container_${u.id}`}
                    >
                      {rentalsUser.map((r: RentalsUserType) => {
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
                            className="flex items-center gap-2 rounded-md
                                         bg-muted/30 px-2 py-1.5"
                          >
                            {/* Return button */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    if (!userExpanded) return;
                                    handleReturnBookButton(r.id, userExpanded);
                                    setReturnedBooks((prev) => ({
                                      ...prev,
                                      [r.id]: Date.now(),
                                    }));
                                  }}
                                  aria-label="zurückgeben"
                                  data-cy={`book_return_button_${r.id}`}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center
                                               rounded-md text-muted-foreground
                                               hover:bg-destructive/10 hover:text-destructive
                                               transition-colors"
                                >
                                  <CircleArrowLeft className="h-4 w-4" />
                                </button>
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
                            {userExpanded && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <button
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
                                      className="flex h-8 w-8 shrink-0 items-center justify-center
                                                   rounded-md text-muted-foreground
                                                   enabled:hover:bg-primary/10 enabled:hover:text-primary
                                                   disabled:opacity-40 disabled:cursor-not-allowed
                                                   transition-colors"
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>{extendTooltip}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        );
                      })}

                      {rentalsUser.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2 text-center">
                          Keine ausgeliehenen Bücher
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
