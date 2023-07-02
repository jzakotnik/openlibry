import Grid from "@mui/material/Grid";

import { BookType } from "@/entities/BookType";
import BookRentalRow from "./BookRentalRow";

interface BookPropsType {
  books: Array<BookType>;
}

export default function BookRentalList({ books }: BookPropsType) {
  return (
    <Grid
      container
      direction="column"
      justifyContent="space-between"
      alignItems="left"
      sx={{ width: "100%", my: 2 }}
    >
      {books.map((b: BookType) => (
        <BookRentalRow key={b.id} book={b} />
      ))}
    </Grid>
  );
}
