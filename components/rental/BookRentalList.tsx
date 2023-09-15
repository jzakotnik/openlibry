import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Input from "@mui/material/Input";
import { Grid } from "@mui/material";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import palette from "@/styles/palette";

import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UpdateIcon from "@mui/icons-material/Update";

import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";
import { PlaylistAdd } from "@mui/icons-material";
import { convertDateToDayString } from "@/utils/convertDateToDayString";
import "dayjs/locale/de";
import dayjs from "dayjs";

interface BookPropsType {
  books: Array<BookType>;
  handleExtendBookButton: any;
  handleReturnBookButton: any;
  handleRentBookButton: any;
  userExpanded: number | false;
}
export default function BookRentalList({
  books,
  handleExtendBookButton,
  handleReturnBookButton,
  handleRentBookButton,
  userExpanded,
}: BookPropsType) {
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [renderedBooks, setRenderedBooks] = useState(books);
  const [returnedBooks, setReturnedBooks] = useState({});
  const itemsjs = require("itemsjs")(books, {
    searchableFields: ["title", "author", "subtitle", "topics", "id"],
  });

  useEffect(() => {
    searchBooks(bookSearchInput);
  }, [books]);

  async function searchBooks(searchString: string) {
    const resultBooks = [] as Array<BookType>;
    const foundBooks = itemsjs.search({
      per_page: 20,
      sort: "name_asc",
      // full text search
      query: searchString,
    });
    console.log("Found books", foundBooks);
    setRenderedBooks(foundBooks.data.items);
  }

  const handleInputChange = (e: any) => {
    setBookSearchInput(e.target.value);
    const result = searchBooks(e.target.value);
  };

  const ReturnedIcon = ({ id }: any) => {
    //console.log("Rendering icon ", id, returnedBooks);
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <ArrowCircleLeftIcon />;
    }
  };

  const ExtendedIcon = ({ id }: any) => {
    //console.log("Rendering icon ", id, returnedBooks);
    if (id in returnedBooks) {
      return <CheckCircleIcon color="success" />;
    } else {
      return <UpdateIcon />;
    }
  };
  console.log("booklist received an expanded user: ", userExpanded);

  return (
    <div>
      <FormControl variant="standard">
        <InputLabel htmlFor="book-search-input-label">Suche Buch</InputLabel>
        <Input
          id="book-search-input"
          startAdornment={
            <InputAdornment position="start">
              <MenuBookIcon />
            </InputAdornment>
          }
          value={bookSearchInput}
          onChange={handleInputChange}
        />
      </FormControl>
      <Grid
        container
        direction="column"
        alignItems="stretch"
        justifyContent="flex-start"
        sx={{ px: 0.5, my: 0.5 }}
      >
        {renderedBooks.slice(0, 100).map((b: BookType) => (
          <div key={b.id}>
            <Paper elevation={2} sx={{ my: 0.5, width: "500px" }}>
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
                          <IconButton
                            aria-label="extend"
                            onClick={() => {
                              console.log("Book rental list, extend button", b);
                              handleExtendBookButton(b.id, b);
                              const time = Date.now();
                              const newbook = {};
                              (newbook as any)[b.id!] = time;
                              setReturnedBooks({
                                ...returnedBooks,
                                ...newbook,
                              });
                            }}
                          >
                            <ExtendedIcon key={b.id} id={b.id} />
                          </IconButton>
                        )}
                      </Grid>
                      <Grid item>
                        {!(b.rentalStatus == "available") && (
                          <IconButton
                            onClick={() => {
                              handleReturnBookButton(b.id);
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
                            <ReturnedIcon key={b.id} id={b.id} />
                          </IconButton>
                        )}
                      </Grid>
                      {userExpanded && b.rentalStatus == "available" && (
                        <Grid container item>
                          <IconButton
                            onClick={() => {
                              handleRentBookButton(b.id, userExpanded);
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
                          </IconButton>{" "}
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
                    Buch ID {b.id}
                    {!(b.rentalStatus == "available") && (
                      <span>
                        {" "}
                        - ausgeliehen bis{" "}
                        {dayjs(b.dueDate).format("DD.MM.YYYY")}
                      </span>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </div>
        ))}
      </Grid>
    </div>
  );
}
