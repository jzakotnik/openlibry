import { BookType } from "@/entities/BookType";
import { Paper, Typography } from "@mui/material";
import Barcode from "react-barcode";

interface BookTypeProps {
  book: BookType;
}

export default function BookBarcode({ book }: BookTypeProps) {
  return (
    <Paper sx={{ mx: 10, my: 10, px: 5 }}>
      <Typography> {book.title.substring(0, 30) + "..."}</Typography>

      <Barcode
        value={book.id!.toString()}
        height={90}
        width={2.0}
        fontOptions="400"
        textMargin={4}
        margin={2}
      />
    </Paper>
  );
}
