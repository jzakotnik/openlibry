import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Grid, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";

import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ClearIcon from "@mui/icons-material/Clear";
import UpdateIcon from "@mui/icons-material/Update";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import userNameForBook from "@/utils/userNameForBook";
import dayjs from "dayjs";
import "dayjs/locale/de";

import itemsjs from "itemsjs";

interface BookPropsType {
  books: Array<BookType>;
  users: Array<UserType>;
  handleExtendBookButton: (id: number, b: BookType) => void;
  handleReturnBookButton: (bookid: number, userid: number) => void;
  handleRentBookButton: (id: number, userid: number) => void;
  userExpanded: number | false;
  searchFieldRef: any;
  handleUserSearchSetFocus: () => void;
  extensionDueDate: dayjs.Dayjs;
  sortBy: string;
}

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
  const [renderedBooks, setRenderedBooks] = useState(books);
  const [returnedBooks, setReturnedBooks] = useState({});
  const sortings: any = {
    id_asc: {
      field: "id",
      order: "asc",
    },
    id_desc: {
      field: "id",
      order: "desc",
    },
    title_asc: {
      field: "title",
      order: "asc",
    },
    title_desc: {
      field: "title",
      order: "desc",
    },
  };
  const searchEngine = itemsjs(books, {
    searchableFields: ["title", "author", "subtitle", "id"],
    sortings: sortings,
  });

  useEffect(() => {
    searchBooks(bookSearchInput);
  }, [books, bookSearchInput]);

  async function searchBooks(searchString: string) {
    const foundBooks = searchEngine.search({
      per_page: 20,
      sort: sortBy,
      // full text search
      query: searchString,
    });
    //console.log("Found books", foundBooks);
    setRenderedBooks(foundBooks.data.items);
  }

  const handleClear = (e: any) => {
    e.preventDefault();
    setBookSearchInput("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setBookSearchInput(e.target.value);
    //set rendered books
    searchBooks(e.target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent): void => {
    if (e.key == "Escape") {
      if (bookSearchInput == "") {
        handleUserSearchSetFocus();
      } else {
        setBookSearchInput("");
      }
    }
  };

  const ReturnedIcon = () => {
    //console.log("Rendering icon ", id, returnedBooks);
    return <ArrowCircleLeftIcon />; /*
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <ArrowCircleLeftIcon />;
    }*/
  };

  const ExtendedIcon = () => {
    return <UpdateIcon />; //console.log("Rendering icon ", id, returnedBooks);
    /*if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <UpdateIcon />;
    }*/
  };

  return (
    <div>
      <FormControl variant="standard">
        <InputLabel htmlFor="book-search-input-label">Suche Buch</InputLabel>
        <Input
          id="book-search-input"
          inputRef={searchFieldRef}
          startAdornment={
            <InputAdornment position="start">
              <MenuBookIcon />
            </InputAdornment>
          }
          endAdornment={
            bookSearchInput && (
              <InputAdornment position="end">
                <Tooltip title="Suche löschen">
                  <IconButton edge="end" onMouseDown={handleClear}>
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
      <Grid
        container
        direction="column"
        alignItems="stretch"
        justifyContent="flex-start"
        sx={{ px: 0.5, my: 0.5 }}
      >
        {renderedBooks.slice(0, 100).map((b: any) => {
          let allowExtendBookRent = extensionDueDate.isAfter(b.dueDate, "day");
          let tooltip = allowExtendBookRent
            ? "Verlängern"
            : "Maximale Ausleihzeit erreicht";
          return (
            <div key={b.id}>
              <Paper elevation={2} sx={{ my: 0.5 }}>
                {/* HEADER ROW */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                    pt: 0.5,
                    width: "100%",
                    minWidth: 0, // enables ellipsis on flex children
                  }}
                >
                  {/* LEFT: title — grows, no wrap */}
                  <Typography sx={{ flex: 1, minWidth: 0 }} noWrap>
                    {b.title}
                  </Typography>

                  {/* RIGHT: icon cluster — stays on one line */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
                  >
                    {b.rentalStatus !== "available" && (
                      <Tooltip
                        title={
                          allowExtendBookRent
                            ? "Verlängern"
                            : "Maximale Ausleihzeit erreicht"
                        }
                      >
                        <span>
                          <IconButton
                            aria-label="extend"
                            disabled={!allowExtendBookRent}
                            onClick={() => {
                              handleExtendBookButton(b.id!, b);
                              const time = Date.now();
                              setReturnedBooks({
                                ...returnedBooks,
                                [b.id!]: time,
                              });
                            }}
                            size="small"
                          >
                            <UpdateIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    {b.rentalStatus !== "available" && (
                      <Tooltip title="Zurückgeben">
                        <IconButton
                          onClick={() => {
                            handleReturnBookButton(b.id!, b.userId!);
                            const time = Date.now();
                            setReturnedBooks({
                              ...returnedBooks,
                              [b.id!]: time,
                            });
                          }}
                          aria-label="zurückgeben"
                          size="small"
                        >
                          <ArrowCircleLeftIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {userExpanded && b.rentalStatus === "available" && (
                      <Tooltip title="Ausleihen">
                        <IconButton
                          onClick={() => {
                            handleRentBookButton(b.id!, userExpanded!);
                            const time = Date.now();
                            setReturnedBooks({
                              ...returnedBooks,
                              [b.id!]: time,
                            });
                          }}
                          aria-label="ausleihen"
                          size="small"
                        >
                          <PlaylistAddIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                    pt: 0.5,
                    width: "100%",
                    minWidth: 0, // enables ellipsis on flex children
                  }}
                >
                  <Typography sx={{ m: 0.5 }} variant="body2">
                    Untertitel: {b.subtitle}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                    pt: 0.5,
                    width: "100%",
                    minWidth: 0, // enables ellipsis on flex children
                  }}
                >
                  <Typography sx={{ m: 0.5 }} variant="body2">
                    Buch Nr. {b.id}
                    {!(
                      b.rentalStatus == "available" || b.rentalStatus == "lost"
                    ) && (
                        <span>
                          {" "}
                          - ausgeliehen bis{" "}
                          {dayjs(b.dueDate).format("DD.MM.YYYY")} an{" "}
                          {userNameForBook(users, b.userId!)}
                        </span>
                      )}
                    {b.rentalStatus == "available" && (
                      <span> -{" " + b.author}</span>
                    )}
                  </Typography>

                </Box>

              </Paper>
            </div>
          );
        })}
      </Grid>
    </div>
  );
}
