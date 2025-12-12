import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import itemsjs from "itemsjs";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import palette from "@/styles/palette";
import userNameForBook from "@/utils/userNameForBook";

import { GlassCard, SearchInput } from "../shared";
import BookListItem from "./BookListItem";
import RentHint from "./RentHint";

export type SortOption = "id_asc" | "id_desc" | "title_asc" | "title_desc";

interface BookPanelProps {
  books: Array<BookType>;
  users: Array<UserType>;
  handleExtendBookButton: (id: number, book: BookType) => void;
  handleReturnBookButton: (bookid: number, userid: number) => void;
  handleRentBookButton: (id: number, userid: number) => void;
  userExpanded: number | false;
  searchFieldRef: RefObject<HTMLInputElement | null>;
  handleUserSearchSetFocus: () => void;
  extensionDueDate: dayjs.Dayjs | null;
  sortBy: SortOption;
}

type Sorting<T> = {
  field: keyof T | (keyof T)[];
  order: "asc" | "desc";
};

export default function BookPanel({
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
}: BookPanelProps) {
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [renderedBooks, setRenderedBooks] = useState<Array<BookType>>(books);

  // Sortings configuration
  const sortings = useMemo(
    () =>
      ({
        id_asc: { field: "id", order: "asc" },
        id_desc: { field: "id", order: "desc" },
        title_asc: { field: "title", order: "asc" },
        title_desc: { field: "title", order: "desc" },
      } as const satisfies Record<
        "id_asc" | "id_desc" | "title_asc" | "title_desc",
        Sorting<BookType>
      >),
    []
  );

  // Build itemsjs index only when the dataset changes
  const searchEngine = useMemo(
    () =>
      itemsjs(books, {
        searchableFields: ["title", "author", "subtitle", "id"],
        sortings,
      }),
    [books, sortings]
  );

  // Stable search function
  const searchBooks = useCallback(
    (query: string) => {
      const found = searchEngine.search({
        per_page: 100,
        sort: sortBy,
        query,
      });
      setRenderedBooks(found.data.items);
    },
    [searchEngine, sortBy]
  );

  // Run search whenever input text changes
  useEffect(() => {
    searchBooks(bookSearchInput);
  }, [bookSearchInput, searchBooks]);

  // Handle keyboard events
  const handleKeyUp = (e: React.KeyboardEvent): void => {
    if (e.key === "Escape") {
      if (bookSearchInput === "") {
        handleUserSearchSetFocus();
      } else {
        setBookSearchInput("");
      }
    }
  };

  // Get selected user info
  const selectedUser = userExpanded
    ? users.find((u) => u.id === userExpanded)
    : null;

  return (
    <GlassCard>
      <Box sx={{ p: 2.5 }}>
        {/* Search Header */}
        <Box sx={{ mb: 2.5 }}>
          <SearchInput
            placeholder="Buch suchen... (Titel, ID, ISBN, Autor)"
            value={bookSearchInput}
            onChange={setBookSearchInput}
            onKeyUp={handleKeyUp}
            icon={<MenuBookIcon />}
            accentColor={palette.secondary.main}
            inputRef={searchFieldRef}
            dataCy="rental_input_searchbook"
          />
        </Box>

        {/* Rent hint when user is selected */}
        {selectedUser && <RentHint userName={selectedUser.firstName} />}

        {/* Book List */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            maxHeight: "520px",
            overflowY: "auto",
            pr: 1,
            // Custom scrollbar
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(18, 85, 111, 0.2)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(18, 85, 111, 0.3)",
            },
          }}
        >
          {renderedBooks.slice(0, 100).map((book) => {
            // Default to false during SSR (when extensionDueDate is null)
            const allowExtend = extensionDueDate
              ? extensionDueDate.isAfter(dayjs(book.dueDate), "day")
              : false;
            const userName = book.userId
              ? userNameForBook(users, book.userId)
              : "";

            return (
              <BookListItem
                key={book.id}
                book={book}
                userName={userName}
                userSelected={!!userExpanded}
                allowExtend={allowExtend}
                onRent={() => {
                  if (userExpanded) {
                    handleRentBookButton(book.id!, userExpanded);
                  }
                }}
                onReturn={() => {
                  if (book.userId) {
                    handleReturnBookButton(book.id!, book.userId);
                  }
                }}
                onExtend={() => {
                  handleExtendBookButton(book.id!, book);
                }}
              />
            );
          })}

          {renderedBooks.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "#5A6166",
              }}
            >
              <Typography>Keine Bücher gefunden</Typography>
            </Box>
          )}

          {renderedBooks.length > 100 && (
            <Box
              sx={{
                textAlign: "center",
                py: 2,
                color: "#5A6166",
                fontSize: "14px",
              }}
            >
              <Typography variant="caption">
                Zeige 100 von {renderedBooks.length} Büchern. Bitte Suche
                verfeinern.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </GlassCard>
  );
}
