import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Grid, Tooltip } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";

import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ClearIcon from "@mui/icons-material/Clear";
import UpdateIcon from "@mui/icons-material/Update";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { extendDays } from "@/utils/dateutils";
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
}: BookPropsType) {
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [renderedBooks, setRenderedBooks] = useState(books);
  const [returnedBooks, setReturnedBooks] = useState({});
  const searchEngine = itemsjs(books, {
    searchableFields: ["title", "author", "subtitle", "id"],
  });

  useEffect(() => {
    searchBooks(bookSearchInput);
  }, [books, bookSearchInput]);

  async function searchBooks(searchString: string) {
    const resultBooks = [] as Array<BookType>;
    const foundBooks = searchEngine.search({
      per_page: 20,
      sort: "name_asc",
      // full text search
      query: searchString,
    });
    //console.log("Found books", foundBooks);
    setRenderedBooks(foundBooks.data.items);
  }

  const extensionDays = extendDays(
    new Date(),
    process.env.EXTENSION_DURATION_DAYS
      ? parseInt(process.env.EXTENSION_DURATION_DAYS)
      : 14
  );
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
          const allowExtendBookRent = extensionDays.isAfter(b.dueDate, "day");
          const tooltip = allowExtendBookRent
            ? "Verlängern"
            : "Maximale Ausleihzeit erreicht";
          return (
            <div key={b.id}>
              <Paper elevation={2} sx={{ my: 0.5 }}>
                <Grid
                  item
                  container
                  direction="column"
                  alignItems="flex-start"
                  justifyContent="flex-start"
                >
                  <Grid
                    container
                    item
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Grid item>
                      <Typography sx={{ m: 0.5 }}>{b.title}</Typography>
                    </Grid>
                    <Grid>
                      <Grid
                        container
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        sx={{ px: 0.5 }}
                      >
                        <Grid item>
                          {!(b.rentalStatus == "available") && (
                            <Tooltip title={tooltip}>
                              <span>
                                <IconButton
                                  aria-label="extend"
                                  disabled={!allowExtendBookRent}
                                  onClick={() => {
                                    console.log(
                                      "Book rental list, extend button",
                                      b
                                    );
                                    handleExtendBookButton(b.id!, b);
                                    const time = Date.now();
                                    const newbook = {};
                                    (newbook as any)[b.id!] = time;
                                    setReturnedBooks({
                                      ...returnedBooks,
                                      ...newbook,
                                    });
                                  }}
                                >
                                  <ExtendedIcon key={b.id} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Grid>
                        <Grid item>
                          {!(b.rentalStatus == "available") && (
                            <Tooltip title="Zurückgeben">
                              <IconButton
                                onClick={() => {
                                  const result = handleReturnBookButton(
                                    b.id!,
                                    b.userId! //TODO not sure if this is actually needed
                                  );
                                  console.log("Result of the return:", result);
                                  const time = Date.now();
                                  const newbook = {};
                                  (newbook as any)[b.id!] = time;
                                  setReturnedBooks({
                                    ...returnedBooks,
                                    ...newbook,
                                  });
                                }}
                                aria-label="zurückgeben"
                              >
                                <ReturnedIcon key={b.id} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Grid>
                        {userExpanded && b.rentalStatus == "available" && (
                          <Grid container item>
                            <Tooltip title="Ausleihen">
                              <IconButton
                                onClick={() => {
                                  console.log("Rent click", b);
                                  handleRentBookButton(b.id!, userExpanded!);
                                  const time = Date.now();
                                  const newbook = {};
                                  (newbook as any)[b.id!] = time;
                                  setReturnedBooks({
                                    ...returnedBooks,
                                    ...newbook,
                                  });
                                }}
                                aria-label="ausleihen"
                              >
                                <PlaylistAddIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    {" "}
                    <Typography sx={{ m: 0.5 }} variant="body2">
                      Untertitel: {b.subtitle}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    {" "}
                    <Typography sx={{ m: 0.5 }} variant="body2">
                      Buch Nr. {b.id}
                      {!(
                        b.rentalStatus == "available" ||
                        b.rentalStatus == "lost"
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
                  </Grid>
                </Grid>
              </Paper>
            </div>
          );
        })}
      </Grid>
    </div>
  );
}
