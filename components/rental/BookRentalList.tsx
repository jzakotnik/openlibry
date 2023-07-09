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
      alignItems="center"
      sx={{ width: "100%", my: 0.5 }}
      columns={{ xs: 12, md: 12 }}
    >
      {books.map((b: BookType) => (
        <BookRentalRow key={b.id} book={b} />
      ))}
    </Grid>
  );
}
