import { BookType } from "@/entities/BookType";
import { Typography } from "@mui/material";

interface BarcodeGeneratorPropsType {
  books: Array<BookType>;
}

export default function BarcodeGenerator({ books }: BarcodeGeneratorPropsType) {
  //console.log("Dashboard", users, books, rentals);
  return (
    <div>
      <Typography>PDF ID generator TODO</Typography>
    </div>
  );
}
