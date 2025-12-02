import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ClearIcon from "@mui/icons-material/Clear";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import UpdateIcon from "@mui/icons-material/Update";

import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import dayjs from "dayjs";
import "dayjs/locale/de";
import itemsjs from "itemsjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import userNameForBook from "@/utils/userNameForBook";

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
    {}
  );

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

  // Stable search function (captures engine + sortBy)
  const searchBooks = useCallback(
    (query: any) => {
      const found = searchEngine.search({
        per_page: 20,
        sort: sortBy,
        query,
      });
      setRenderedBooks(found.data.items);
    },
    [searchEngine, sortBy]
  );

  // Run search whenever input text changes or engine/sort changes
  useEffect(() => {
    searchBooks(bookSearchInput);
  }, [bookSearchInput, searchBooks]);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setBookSearchInput("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const v = e.target.value;
    setBookSearchInput(v);
    // optional immediate search (effect will also run)
    //searchBooks(v);
  };

  const handleKeyUp = (e: React.KeyboardEvent): void => {
    if (e.key === "Escape") {
      if (bookSearchInput === "") {
        handleUserSearchSetFocus();
      } else {
        setBookSearchInput("");
      }
    }
  };

  const markBookTouched = (id: number) => {
    const time = Date.now();
    setReturnedBooks((prev) => ({ ...prev, [id]: time }));
  };

  const ReturnedIcon = () => <ArrowCircleLeftIcon />;
  const ExtendedIcon = () => <UpdateIcon />;

  return (
    <div data-cy="book_rental_list_container">
      <FormControl variant="standard">
        <InputLabel
          htmlFor="book-search-input-label"
          data-cy="book_search_label"
        >
          Suche Buch
        </InputLabel>
        <Input
          id="book-search-input"
          inputRef={searchFieldRef}
          data-cy="book_search_input"
          startAdornment={
            <InputAdornment position="start">
              <MenuBookIcon />
            </InputAdornment>
          }
          endAdornment={
            bookSearchInput && (
              <InputAdornment position="end">
                <Tooltip title="Suche löschen">
                  <IconButton
                    edge="end"
                    onMouseDown={handleClear}
                    data-cy="book_search_clear_button"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }
          value={bookSearchInput}
          onChange={handleInputChange}
          onKeyUp={handleKeyUp}
        />
      </FormControl>

      {/* Use Stack instead of Grid for the vertical list to avoid spacing/overflow quirks */}
      <Stack
        spacing={1}
        sx={{ px: 0.5, my: 0.5 }}
        data-cy="book_list_container"
      >
        {renderedBooks.slice(0, 100).map((b: BookType) => {
          const allowExtendBookRent = extensionDueDate.isAfter(
            b.dueDate,
            "day"
          );
          const tooltip = allowExtendBookRent
            ? "Verlängern"
            : "Maximale Ausleihzeit erreicht";

          return (
            <Paper
              key={b.id}
              elevation={2}
              sx={{
                my: 0.5,
                // VERY IMPORTANT for iPad/Safari: do not clip trailing icons
                overflow: "visible",
              }}
              data-cy={`book_item_${b.id}`}
            >
              {/* HEADER ROW */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  pt: 0.5,
                  width: "100%",
                  // Make this a strict single-line row with proper shrinking
                  flexWrap: "nowrap",
                  minWidth: 0,
                }}
                data-cy={`book_header_${b.id}`}
              >
                {/* LEFT: title — grows, can truncate */}
                <Typography
                  sx={{ flex: "1 1 auto", minWidth: 0 }}
                  noWrap
                  data-cy={`book_title_${b.id}`}
                >
                  {b.title}
                </Typography>

                {/* RIGHT: icon cluster — never shrink, never wrap, keep on top */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{
                    flex: "0 0 auto",
                    whiteSpace: "nowrap",
                    position: "relative",
                    zIndex: 1,
                    overflow: "visible",
                  }}
                  data-cy={`book_actions_${b.id}`}
                >
                  {b.rentalStatus !== "available" && (
                    <Tooltip title={tooltip}>
                      <span>
                        <IconButton
                          aria-label="extend"
                          disabled={!allowExtendBookRent}
                          onClick={() => {
                            handleExtendBookButton(b.id!, b);
                            markBookTouched(b.id!);
                          }}
                          size="small"
                          data-cy={`book_extend_button_${b.id}`}
                        >
                          <ExtendedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}

                  {b.rentalStatus !== "available" && (
                    <Tooltip title="Zurückgeben">
                      <IconButton
                        onClick={() => {
                          handleReturnBookButton(b.id!, b.userId!);
                          markBookTouched(b.id!);
                        }}
                        aria-label="zurückgeben"
                        size="small"
                        data-cy={`book_return_button_${b.id}`}
                      >
                        <ReturnedIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {userExpanded && b.rentalStatus === "available" && (
                    <Tooltip title="Ausleihen">
                      <IconButton
                        onClick={() => {
                          handleRentBookButton(b.id!, userExpanded!);
                          markBookTouched(b.id!);
                        }}
                        aria-label="ausleihen"
                        size="small"
                        data-cy={`book_rent_button_${b.id}`}
                      >
                        <PlaylistAddIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Box>

              {/* SUBTITLE ROW */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  pt: 0.5,
                  width: "100%",
                  minWidth: 0,
                }}
                data-cy={`book_subtitle_row_${b.id}`}
              >
                <Typography
                  sx={{ m: 0.5 }}
                  variant="body2"
                  noWrap
                  data-cy={`book_subtitle_${b.id}`}
                >
                  Untertitel: {b.subtitle}
                </Typography>
              </Box>

              {/* INFO ROW */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  pt: 0.5,
                  width: "100%",
                  minWidth: 0,
                }}
                data-cy={`book_info_row_${b.id}`}
              >
                <Typography
                  sx={{ m: 0.5 }}
                  variant="body2"
                  data-cy={`book_info_${b.id}`}
                >
                  Buch Nr. {b.id}
                  {!(
                    b.rentalStatus === "available" || b.rentalStatus === "lost"
                  ) && (
                    <span>
                      {" "}
                      - ausgeliehen bis {dayjs(b.dueDate).format(
                        "DD.MM.YYYY"
                      )}{" "}
                      an {userNameForBook(users, b.userId!)}
                    </span>
                  )}
                  {b.rentalStatus === "available" && <span> - {b.author}</span>}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </div>
  );
}
