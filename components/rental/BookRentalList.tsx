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

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UpdateIcon from "@mui/icons-material/Update";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";

interface UserPropsType {
  users: Array<UserType>;
  books: Array<BookType>;
  rentals: any;
  handleExtendBookButton: any;
  handleReturnBookButton: any;
}

interface BookPropsType {
  books: Array<BookType>;
}

export default function BookRentalList({ books }: BookPropsType) {
  const [bookSearchInput, setBookSearchInput] = useState("");
  const [renderedBooks, setRenderedBooks] = useState(books);
  const [returnedBooks, setReturnedBooks] = useState({});
  const itemsjs = require("itemsjs")(books, {
    searchableFields: ["title", "author", "subtitle", "topics", "id"],
  });

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
        sx={{ px: 2, my: 2 }}
      >
        {renderedBooks.slice(0, 100).map((b: BookType) => (
          <Paper key={b.id}>
            <Grid
              container
              direction="row"
              alignItems="flex-start"
              justifyContent="flex-start"
              sx={{ px: 2 }}
            >
              <Grid item>
                <IconButton
                  aria-label="extend"
                  onClick={() => {
                    handleExtendBookButton(b.id);
                    const time = Date.now();
                    const newbook = {};
                    (newbook as any)[b.id!] = time;
                    setReturnedBooks({ ...returnedBooks, ...newbook });
                  }}
                >
                  <ExtendedIcon key={b.id} id={b.id} />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton
                  onClick={() => {
                    handleReturnBookButton(b.id);
                    const time = Date.now();
                    const newbook = {};
                    (newbook as any)[b.id!] = time;
                    setReturnedBooks({ ...returnedBooks, ...newbook });
                  }}
                  aria-label="zurückgeben"
                >
                  <ReturnedIcon key={b.id} id={b.id} />
                </IconButton>{" "}
              </Grid>
              <Grid item>
                <Typography sx={{ m: 2 }}>{b.title}</Typography>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Grid>
    </div>
  );
}
